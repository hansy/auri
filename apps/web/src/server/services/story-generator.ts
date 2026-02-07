import { getAI } from "./gemini";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { LessonJSON } from "@auri/shared"; // Assuming this type exists or we create it

// Helper to get current directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Adjust this path based on where built files land vs source
const PROMPTS_DIR = path.resolve(__dirname, "../../../prompts/story_generation");

export class StoryGenerator {
    static async generateStory(userId: string, language: string, level: string, previousContext?: string): Promise<LessonJSON> { // Add return type if possible
        const ai = getAI();
        const levelLower = level.toLowerCase();

        // Load Prompts
        const corePromptPath = path.join(PROMPTS_DIR, "core.md");
        const levelPromptPath = path.join(PROMPTS_DIR, "levels", `${levelLower}.md`);

        let corePrompt = "";
        let levelPrompt = "";

        try {
            [corePrompt, levelPrompt] = await Promise.all([
                fs.readFile(corePromptPath, "utf-8"),
                fs.readFile(levelPromptPath, "utf-8")
            ]);
        } catch (error) {
            console.error(`Error loading prompts from ${PROMPTS_DIR}:`, error);
            throw new Error(`Failed to load prompts for level ${level}`);
        }

        const fullPrompt = `
${corePrompt}

---

## Level Instructions (${level})
${levelPrompt}

---

## Context
Target Language: ${language}
${previousContext ? `Previous Context: ${previousContext}` : ""}

Generate the story JSON.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-1.5-pro-latest",
            contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
            config: {
                responseMimeType: "application/json",
            }
        });

        if (!response.text) {
            throw new Error("Empty response from Gemini");
        }

        try {
            const parsed = JSON.parse(response.text);
            // TODO: Validate against Zod schema if available
            return parsed;
        } catch (e) {
            console.error("Failed to parse Gemini response:", response.text);
            throw new Error("Failed to parse Gemini JSON output");
        }
    }
}
