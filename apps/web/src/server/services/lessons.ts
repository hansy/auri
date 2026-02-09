import { db } from "../db";
import { eq } from "drizzle-orm";
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
            proficiencyLevel: data.proficiencyLevel as CEFR, // Cast if needed for enum
            audioUrl: data.audioUrl,
        }).returning();

        return lesson;
    }

    static async getLessonById(id: string) {
        const [lesson] = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);

        return lesson;
    }

    static async updateLesson(data: {
        id: string;
        audioUrl?: string;
    }) {
        const [lesson] = await db.update(lessons).set({
            audioUrl: data.audioUrl,
        }).where(eq(lessons.id, data.id)).returning();

        return lesson;
    }
}
