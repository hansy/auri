import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const ELEVEN_LABS_API_KEY = process.env.ELEVEN_LABS_API_KEY;

if (!ELEVEN_LABS_API_KEY) {
    console.error("ELEVEN_LABS_API_KEY is not set in environment variables");
}

const client = new ElevenLabsClient({
    apiKey: ELEVEN_LABS_API_KEY,
});

export const textToSpeech = async (text: string): Promise<Buffer> => {
    if (!ELEVEN_LABS_API_KEY) {
        throw new Error('ELEVEN_LABS_API_KEY is not set');
    }

    const response = await client.textToSpeech.convert("jsCq9WUX7vUatWUNeb9o", {
        text,
        modelId: "eleven_multilingual_v2",
        voiceSettings: {
            stability: 0.4,
            similarityBoost: 0.8,
            style: 0.2,
            useSpeakerBoost: true,
        },
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
    if (!ELEVEN_LABS_API_KEY) {
        throw new Error('ELEVEN_LABS_API_KEY is not set');
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
