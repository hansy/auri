import { task } from "@trigger.dev/sdk/v3";
import { textToSpeech, generateDialogue } from "../services/elevenlabs";
import { uploadToGCS } from "../services/storage";
import { LessonService } from "../services/lessons";
import { UserService } from "../services/users";

import { LessonJSON, StorySpeaker, StorySegment } from "@auri/shared";


export const storyToAudioJob = task({
    id: "story-to-audio",
    run: async (payload: { lessonId: string }) => {
        const { lessonId } = payload;

        const lesson = await LessonService.getLessonById(lessonId);
        const user = await UserService.getUserById(lesson.userId);

        if (!lesson) {
            throw new Error(`Lesson not found: ${lessonId}`);
        }

        const contentJson = lesson.contentJson as unknown as LessonJSON;

        // 4. TTS / Dialogue Generation
        let audioBuffer: Buffer;

        if (contentJson.is_dialogue) {
            // Map segments to DialogueSegments with real voiceIds
            const dialogueSegments = contentJson.segments.map((seg: StorySegment) => {
                const speaker = contentJson.speakers.find((s: StorySpeaker) => s.id === seg.speaker_id);
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
            const speakers = contentJson.speakers || [];
            const primarySpeaker = speakers.find((s: StorySpeaker) => s.id === "Narrator") || speakers[0];
            const narratorVoiceId = primarySpeaker?.voiceId;

            // Join segments to get full text
            const textToRead = contentJson.segments?.map((s: StorySegment) => s.text).join(" ");

            if (!textToRead) {
                throw new Error("No text to read in story JSON");
            }

            audioBuffer = await textToSpeech(textToRead, {
                voiceId: narratorVoiceId, // Use assigned voice ID
                stability: primarySpeaker?.stability === "robust" ? 0.7 : 0.5, // Map 'robust' to higher stability
                languageCode: user.targetLanguage, // Pass BCP 47 code (e.g. en-US)
            });
        }

        // 5. Upload to GCS
        const filename = `stories/${lesson.userId}/${Date.now()}.mp3`;
        const gcsUri = await uploadToGCS(audioBuffer, filename, "audio/mpeg");

        // 6. Save to DB via Service

        await LessonService.updateLesson({
            id: lessonId,
            audioUrl: gcsUri,
        });

        return {
            success: true,
            storyId: lesson.id,
            gcsUri
        };
    },
});
