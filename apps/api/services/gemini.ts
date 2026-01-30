import { GoogleGenAI } from "@google/genai";
import { Language, CEFR, LessonJSON, Domain } from "../../types";
import { FRAMEWORK_SYSTEM_PROMPT, LESSON_DEVELOPER_PROMPT } from "../../constants";

const getAI = () => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not set');
    }
    return new GoogleGenAI(process.env.GEMINI_API_KEY);
};

export const generateLessonJson = async (language: Language, level: CEFR, domain: Domain): Promise<LessonJSON> => {
    const ai = getAI();
    const model = ai.getGenerativeModel({ model: "gemini-1.5-pro-latest" }); // Using a stable backend model

    const prompt = LESSON_DEVELOPER_PROMPT
        .replace('{language}', language)
        .replace('{level}', level)
        .replace('{domain}', domain);

    const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
        },
        systemInstruction: FRAMEWORK_SYSTEM_PROMPT
    });

    try {
        return JSON.parse(result.response.text());
    } catch (e) {
        throw new Error("Failed to parse lesson JSON: " + (e as Error).message);
    }
};
