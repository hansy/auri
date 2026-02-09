import { getAI } from "./gemini";
import fs from "fs/promises";
import path from "path";
import { LessonJSON } from "@auri/shared";

export class StoryGenerator {
    static async generateStory(language: string, level: string, previousContext?: string): Promise<LessonJSON> {
        const ai = getAI();
        const levelLower = level.toLowerCase();

        let corePrompt = "";
        let levelPrompt = "";

        try {
            [corePrompt, levelPrompt] = await Promise.all([
                fs.readFile(path.join(process.cwd(), '../../packages/shared/prompts/story_generation/core.md'), "utf-8"),
                fs.readFile(path.join(process.cwd(), `../../packages/shared/prompts/story_generation/levels/${levelLower}.md`), "utf-8")
            ]);
        } catch (error) {
            console.error(error)
            throw new Error(`Failed to load prompts for level ${level}`);
        }

        const fullPrompt = `${corePrompt}

            ---

            ## Level Instructions (${level})
            ${levelPrompt}

            ---

            ## Context
            Target Language: ${language}
            ${previousContext ? `PAST LESSON CONTEXT:\n${previousContext}` : ""}

            Generate the story JSON.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
            config: {
                responseMimeType: "application/json",
            }
        });

        if (!response.text) {
            throw new Error("Empty response from Gemini");
        }

        try {
            // Note: response.text is already the string in this SDK version
            return JSON.parse(response.text);
        } catch (e) {
            console.error("Failed to parse Gemini response:", response.text);
            throw new Error("Failed to parse Gemini JSON output");
        }
    }
}
