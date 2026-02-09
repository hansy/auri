import { GoogleGenAI } from "@google/genai";
import { Language, CEFR, LessonJSON, Domain } from "@auri/shared";
import { FRAMEWORK_SYSTEM_PROMPT, LESSON_DEVELOPER_PROMPT } from "@auri/shared/constants";

export const getAI = () => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not set');
    }
    return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
};

export const generateLessonJson = async (language: Language, level: CEFR, domain: Domain): Promise<LessonJSON> => {
    const ai = getAI();

    const prompt = LESSON_DEVELOPER_PROMPT
        .replace('{language}', language)
        .replace('{level}', level)
        .replace('{domain}', domain);

    const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
            responseMimeType: "application/json",
            systemInstruction: FRAMEWORK_SYSTEM_PROMPT
        }
    });

    try {
        if (!response.text) {
            throw new Error("Empty response from Gemini");
        }
        return JSON.parse(response.text);
    } catch (e) {
        throw new Error("Failed to parse lesson JSON: " + (e as Error).message);
    }
};
