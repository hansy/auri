import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

if (!ELEVENLABS_API_KEY) {
    console.error("ELEVENLABS_API_KEY is not set in environment variables");
}

const client = new ElevenLabsClient({
    apiKey: ELEVENLABS_API_KEY,
});

interface TextToSpeechOptions {
    voiceId?: string;
    modelId?: string;
    stability?: number;
    similarityBoost?: number;
    style?: number;
    useSpeakerBoost?: boolean;
    languageCode?: string;
}

export const textToSpeech = async (text: string, options: TextToSpeechOptions = {}): Promise<Buffer> => {
    if (!ELEVENLABS_API_KEY) {
        throw new Error('ELEVENLABS_API_KEY is not set');
    }

    const {
        voiceId = "jsCq9WUX7vUatWUNeb9o",
        modelId = "eleven_multilingual_v2",
        stability = 0.5,
        similarityBoost = 0.75,
        style = 0,
        useSpeakerBoost = true,
        languageCode,
    } = options;

    const response = await client.textToSpeech.convert(voiceId, {
        text,
        modelId,
        voiceSettings: {
            stability,
            similarityBoost,
            style,
            useSpeakerBoost,
        },
        languageCode,
    });

    const chunks: Uint8Array[] = [];
    // The response is a ReadableStream<Uint8Array>
    const reader = response.getReader();
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) chunks.push(value);
    }

    // Combine chunks into a single Buffer
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const combined = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
        combined.set(chunk, offset);
        offset += chunk.length;
    }

    return Buffer.from(combined);
};

export const speechToText = async (audioBuffer: Buffer): Promise<string> => {
    if (!ELEVENLABS_API_KEY) {
        throw new Error('ELEVENLABS_API_KEY is not set');
    }

    const blob = new Blob([new Uint8Array(audioBuffer)], { type: "audio/wav" });
    const file = new File([blob], "audio.wav", { type: "audio/wav" });

    const result = await client.speechToText.convert({
        file,
        modelId: "scribe_v1",
    });

    // result can be SpeechToTextChunkResponseModel, MultichannelSpeechToTextResponseModel, etc.
    if ('text' in result) {
        return result.text;
    } else if ('transcripts' in result && result.transcripts.length > 0) {
        return result.transcripts[0].text;
    } else {
        throw new Error("Failed to extract text from ElevenLabs STT response");
    }
};

export interface DialogueSegment {
    text: string;
    voiceId: string;
    break_after_ms?: number;
}

export const generateDialogue = async (segments: DialogueSegment[], languageCode?: string): Promise<Buffer> => {
    if (!ELEVENLABS_API_KEY) {
        throw new Error('ELEVENLABS_API_KEY is not set');
    }

    const inputs = segments.map(seg => {
        let text = seg.text;
        if (seg.break_after_ms && seg.break_after_ms > 0) {
            // Append break tag. ElevenLabs supports <break time="1.5s" />
            const seconds = (seg.break_after_ms / 1000).toFixed(2);
            text += ` <break time="${seconds}s" />`;
        }
        return {
            text,
            voiceId: seg.voiceId,
        };
    });

    const response = await client.textToDialogue.convert({
        inputs,
        languageCode, // Optional: verify if this param is accepted at top level, yes per the d.ts I read
        modelId: "eleven_multilingual_v2", // or turbo_v2_5 if available, but staying safe
        outputFormat: "mp3_44100_128",
    });

    const chunks: Uint8Array[] = [];
    const reader = response.getReader();
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) chunks.push(value);
    }

    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const combined = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
        combined.set(chunk, offset);
        offset += chunk.length;
    }

    return Buffer.from(combined);
};
