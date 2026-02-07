import { db } from "../db";
import { users, emailConfirmations } from "../db/schema";
import { eq, and, gt } from "drizzle-orm";
import { CEFR } from "@auri/shared/types";

export class UserService {
    static async getByEmail(email: string) {
        const [user] = await db.select()
            .from(users)
            .where(eq(users.email, email));
        return user;
    }

    static async getActiveConfirmation(userId: string) {
        const [confirmation] = await db.select()
            .from(emailConfirmations)
            .where(
                and(
                    eq(emailConfirmations.userId, userId),
                    gt(emailConfirmations.expiresAt, new Date())
                )
            )
            .limit(1);
        return confirmation;
    }

    static async createConfirmation(userId: string) {
        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 15);

        const [confirmation] = await db.insert(emailConfirmations).values({
            userId,
            token,
            expiresAt,
        }).returning();

        return confirmation;
    }

    static async updatePreferences(userId: string, language: string, level: CEFR) {
        await db.update(users)
            .set({ targetLanguage: language, level: level as any })
            .where(eq(users.id, userId));
    }

    static async createUser(email: string, language: string, level: CEFR) {
        const [user] = await db.insert(users).values({
            email,
            targetLanguage: language,
            level: level as any,
            isConfirmed: false,
        }).returning();
        return user;
    }
}
