import { task } from "@trigger.dev/sdk/v3";
import { generateDialogueStream } from "../services/elevenlabs";
import { streamToGCS } from "../services/storage";
import { LessonService } from "../services/lessons";
import { UserService } from "../services/users";

import { LessonJSON, StorySpeaker, StorySegment } from "@auri/shared";


export const generateStoryAudioJob = task({
    id: "generate-story-audio",
    run: async (payload: { lessonId: string }) => {
        const { lessonId } = payload;

        const lesson = await LessonService.getLessonById(lessonId);
        const user = await UserService.getUserById(lesson.userId);

        if (!lesson) {
            throw new Error(`Lesson not found: ${lessonId}`);
        }

        const contentJson = lesson.contentJson as LessonJSON;

        // Map segments to DialogueSegments with voiceIds
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

        // Generate audio stream and pipe directly to GCS
        const audioStream = await generateDialogueStream(dialogueSegments, user.targetLanguage);
        const filename = `stories/${lesson.userId}/${lesson.id}.mp3`;
        const gcsUri = await streamToGCS(audioStream, filename, "audio/mpeg");

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
