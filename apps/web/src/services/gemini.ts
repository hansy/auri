import { GoogleGenAI, Modality } from "@google/genai";
import { Language, LessonContent, LessonJSON } from '@auri/shared/types';
import { FRAMEWORK_SYSTEM_PROMPT, LESSON_DEVELOPER_PROMPT } from "@auri/shared/constants";

// Always use the direct process.env.API_KEY for initialization as per guidelines
// For Vite/TanStack Start, we might need import.meta.env.VITE_GEMINI_API_KEY
// but I'll stick to process.env.API_KEY if that's what was used before.
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || (import.meta as any).env.VITE_GEMINI_API_KEY });

export async function generateDailyLesson(language: string, proficiencyLevel: string): Promise<LessonContent> {
    const ai = getAI();

    // 1. Generate Structured Lesson Content
    const lessonResponse = await ai.models.generateContent({
        model: 'gemini-2.0-flash', // Using a stable model
        contents: LESSON_DEVELOPER_PROMPT
            .replace('{language}', language)
            .replace('{level}', proficiencyLevel),
        config: {
            systemInstruction: FRAMEWORK_SYSTEM_PROMPT,
            responseMimeType: "application/json"
        }
    });

    let lessonJson: LessonJSON;
    try {
        const text = lessonResponse.text;
        lessonJson = JSON.parse(text || "{}");
    } catch (e: any) {
        throw new Error("Failed to parse lesson JSON: " + e.message);
    }

    // 2. Generate TTS for the dictation script
    const ttsResponse = await ai.models.generateContent({
        model: "gemini-2.0-flash", // Using a stable model with TTS capability if available or just flash
        contents: [{ parts: [{ text: lessonJson.dictation.script }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
            },
        },
    });

    const audioBase64 = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    return {
        id: Math.random().toString(36).substr(2, 9),
        json: lessonJson,
        audioBase64,
        language: language as Language
    };
}
;

export function encodePCM(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

export function decodePCM(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

export async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}
