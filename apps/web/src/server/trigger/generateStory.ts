import { task } from "@trigger.dev/sdk/v3";
import { StoryGenerator } from "../services/story-generator";
import { textToSpeech, generateDialogue } from "../services/elevenlabs";
import { uploadToGCS } from "../services/storage";
import { UserService } from "../services/users";
import { LessonService } from "../services/lessons";
import { VoiceService } from "../services/voices";

// Local interface definitions based on core.md
interface StorySpeaker {
    id: string;
    gender?: string;
    voice_description?: string;
    stability?: string;
    voiceId?: string; // We will add this
}

interface StorySegment {
    speaker_id: string;
    text: string;
    break_after_ms?: number;
}

interface StoryDictation {
    title: string;
    is_dialogue: boolean;
    speakers: StorySpeaker[];
    segments: StorySegment[];
    plain_script: string;
}

interface StoryJSON {
    dictation: StoryDictation;
    // Add other fields if needed for future logic, but this covers what we access
    [key: string]: any;
}

export const generateStoryJob = task({
    id: "generate-story",
    run: async (payload: { userId: string }) => {
        const { userId } = payload;

        // 1. Fetch User via Service
        const user = await UserService.getUserById(userId);
        if (!user) {
            throw new Error(`User not found: ${userId}`);
        }

        // 2. Generate Story
        // We cast to unknown first then to our interface to avoid conflicts with shared types if they differ slightly
        const storyJson = await StoryGenerator.generateStory(userId, user.targetLanguage, user.proficiencyLevel) as unknown as StoryJSON;

        // 3. Assign Voices
        // Ensure we have speakers. If not, create at least a Narrator
        if (!storyJson.dictation.speakers) {
            throw new Error("Story generation failed: 'speakers' is missing from the output.");
        }

        // Use VoiceService to assign unique IDs
        // Ensure "Narrator" exists in speakers.
        const hasNarrator = storyJson.dictation.speakers.some((s: any) => s.id === "Narrator");
        if (!hasNarrator) {
            throw new Error("Story generation failed: 'Narrator' speaker is missing from the output.");
        }

        const speakersToAssign = storyJson.dictation.speakers.map(s => ({
            id: s.id,
            gender: s.gender
        }));

        const assignedVoices = VoiceService.assignVoicesToSpeakers(user.targetLanguage, speakersToAssign);

        // Update storyJson with assigned voiceIds
        storyJson.dictation.speakers = storyJson.dictation.speakers.map(s => ({
            ...s,
            voiceId: assignedVoices.get(s.id)
        }));

        // 4. TTS / Dialogue Generation
        let audioBuffer: Buffer;
        const dictation = storyJson.dictation;

        if (dictation.is_dialogue) {
            // Map segments to DialogueSegments with real voiceIds
            const dialogueSegments = dictation.segments.map(seg => {
                const speaker = dictation.speakers.find(s => s.id === seg.speaker_id);
                if (!speaker || !speaker.voiceId) {
                    throw new Error(`Voice ID not found for speaker: ${seg.speaker_id}`);
                }
                return {
                    text: seg.text,
                    voiceId: speaker.voiceId,
                    break_after_ms: seg.break_after_ms
                };
            });

            audioBuffer = await generateDialogue(dialogueSegments, user.targetLanguage);
        } else {
            // Monologue / Narrator only
            const speakers = dictation.speakers || [];
            const primarySpeaker = speakers.find(s => s.id === "Narrator") || speakers[0];
            const narrratorVoiceId = primarySpeaker?.voiceId;

            // Use plain_script if available, otherwise join segments
            const textToRead = dictation.plain_script || dictation.segments?.map(s => s.text).join(" ");

            if (!textToRead) {
                throw new Error("No text to read in story JSON");
            }

            audioBuffer = await textToSpeech(textToRead, {
                voiceId: narrratorVoiceId, // Use assigned voice ID
                stability: primarySpeaker?.stability === "robust" ? 0.7 : 0.5, // Map 'robust' to higher stability
                languageCode: user.targetLanguage, // Pass BCP 47 code (e.g. en-US)
            });
        }

        // 5. Upload to GCS
        const filename = `stories/${userId}/${Date.now()}.mp3`;
        const gcsUri = await uploadToGCS(audioBuffer, filename, "audio/mpeg");

        // 6. Save to DB via Service
        const title = dictation.title || "Untitled Story";

        const lesson = await LessonService.createLesson({
            userId: user.id,
            contentJson: storyJson, // Now contains voiceIds
            title: title,
            proficiencyLevel: user.proficiencyLevel,
            audioUrl: gcsUri,
        });

        return {
            success: true,
            storyId: lesson.id,
            gcsUri
        };
    },
});
