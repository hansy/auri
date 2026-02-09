import { task } from "@trigger.dev/sdk/v3";
import { StoryGenerator } from "../services/story-generator";
import { UserService } from "../services/users";
import { LessonService } from "../services/lessons";
import { VoiceService } from "../services/voices";
import { StorySpeaker } from "@auri/shared";

export const generateStoryTextJob = task({
    id: "generate-story-text",
    run: async (payload: { userId: string }) => {
        const { userId } = payload;

        // 1. Fetch User via Service
        const user = await UserService.getUserById(userId);
        if (!user) {
            throw new Error(`User not found: ${userId}`);
        }

        // 2. Generate Story
        const storyJson = await StoryGenerator.generateStory(user.targetLanguage, user.proficiencyLevel);

        // 3. Assign Voices
        // Ensure we have speakers
        if (!storyJson.speakers) {
            throw new Error("Story generation failed: 'speakers' is missing from the output.");
        }

        // Use VoiceService to assign unique IDs
        // Ensure "Narrator" exists in speakers.
        const hasNarrator = storyJson.speakers.some((s: StorySpeaker) => s.id === "Narrator");
        if (!hasNarrator) {
            throw new Error("Story generation failed: 'Narrator' speaker is missing from the output.");
        }

        const speakersToAssign = storyJson.speakers.map((s: StorySpeaker) => ({
            id: s.id,
            gender: s.gender
        }));

        const assignedVoices = VoiceService.assignVoicesToSpeakers(user.targetLanguage, speakersToAssign);

        // Update storyJson with assigned voiceIds
        storyJson.speakers = storyJson.speakers.map((s: StorySpeaker) => ({
            ...s,
            voiceId: assignedVoices.get(s.id)
        }));

        // 4. Save to DB via Service
        const title = storyJson.title || "";

        const lesson = await LessonService.createLesson({
            userId: user.id,
            contentJson: storyJson, // Now contains voiceIds
            title: title,
            proficiencyLevel: user.proficiencyLevel,
        });

        return {
            success: true,
            storyId: lesson.id,
        };
    },
});
