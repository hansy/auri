import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { streamToBuffer } from "../utils/streams";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

if (!ELEVENLABS_API_KEY) {
    console.error("ELEVENLABS_API_KEY is not set in environment variables");
}

const client = new ElevenLabsClient({
    apiKey: ELEVENLABS_API_KEY,
});

/**
 * Strips dialect from BCP 47 language code to ISO 639-1.
 * e.g., "es-419" -> "es", "en-US" -> "en"
 */
export const toISO6391 = (code?: string): string | undefined => {
    if (!code) return undefined;
    return code.split('-')[0];
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

/**
 * Generates audio from dialogue segments using ElevenLabs text-to-dialogue API.
 * For single-speaker narration, pass all segments with the same voiceId.
 * Each segment can have a break_after_ms to add pauses between lines.
 */
const createDialogue = async (segments: DialogueSegment[], languageCode: string): Promise<ReadableStream<Uint8Array>> => {
    if (!ELEVENLABS_API_KEY) {
        throw new Error('ELEVENLABS_API_KEY is not set');
    }

    const inputs = segments.map(seg => {
        // let text = seg.text;
        // // Always add break after each segment (default 1s if not specified)
        // const breakMs = seg.break_after_ms ?? 1000;
        // if (breakMs > 0) {
        //     const seconds = (breakMs / 1000).toFixed(1);
        //     text += ` ${'-'.repeat(Number(seconds) * 4)}`;
        // }
        return {
            text: seg.text,
            voiceId: seg.voiceId,
        };
    });

    return await client.textToDialogue.convert({
        inputs,
        languageCode: toISO6391(languageCode),
        modelId: "eleven_v3",
        outputFormat: "mp3_44100_128",
    });
};

export const generateDialogueStream = async (segments: DialogueSegment[], languageCode: string): Promise<ReadableStream<Uint8Array>> => {
    return await createDialogue(segments, languageCode);
};

export const generateDialogue = async (segments: DialogueSegment[], languageCode: string): Promise<Buffer> => {
    const stream = await createDialogue(segments, languageCode);

    return streamToBuffer(stream);
};

export const getConversationToken = async (): Promise<string> => {
    if (!ELEVENLABS_API_KEY) {
        throw new Error('ELEVENLABS_API_KEY is not set');
    }

    try {
        const response = await fetch(`https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${process.env.ELEVENLABS_AGENT_ID}`, {
            headers: {
                "xi-api-key": process.env.ELEVENLABS_API_KEY as string,
            },
        })
        const json = await response.json()

        return json.signed_url;
    } catch (error) {
        console.error('Error generating conversation token:', error);
        throw error;
    }
};

