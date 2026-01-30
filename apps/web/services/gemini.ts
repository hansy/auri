
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Language, CEFR, LessonContent, LessonJSON, Domain } from "../types";
import { FRAMEWORK_SYSTEM_PROMPT, LESSON_DEVELOPER_PROMPT } from "../constants";

// Always use the direct process.env.API_KEY for initialization as per guidelines
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateDailyLesson = async (language: Language, level: CEFR, domain: Domain): Promise<LessonContent> => {
  const ai = getAI();
  
  // 1. Generate Structured Lesson Content
  const lessonResponse = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: LESSON_DEVELOPER_PROMPT
      .replace('{language}', language)
      .replace('{level}', level)
      .replace('{domain}', domain),
    config: {
      systemInstruction: FRAMEWORK_SYSTEM_PROMPT,
      responseMimeType: "application/json"
    }
  });
  
  let lessonJson: LessonJSON;
  try {
    // response.text is a getter, do not use text()
    lessonJson = JSON.parse(lessonResponse.text || "{}");
  } catch (e) {
    throw new Error("Failed to parse lesson JSON: " + e.message);
  }

  // 2. Generate TTS for the dictation script
  const ttsResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
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
    language
  };
};

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
