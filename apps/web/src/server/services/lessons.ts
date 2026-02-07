import { db } from "../db";
import { lessons } from "../db/schema";
import { CEFR } from "@auri/shared/types"; // Verify this import path or use string if not available

export class LessonService {
    static async createLesson(data: {
        userId: string;
        contentJson: any;
        title: string;
        proficiencyLevel: string; // Using string to match schema enum, or CEFR if strict
        audioUrl?: string;
    }) {
        const [lesson] = await db.insert(lessons).values({
            userId: data.userId,
            contentJson: data.contentJson,
            title: data.title,
            proficiencyLevel: data.proficiencyLevel as any, // Cast if needed for enum
            audioUrl: data.audioUrl,
        }).returning();

        return lesson;
    }
}
