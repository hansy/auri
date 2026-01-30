import ElevenLabs from "elevenlabs-node";

const voice = new ElevenLabs({
    apiKey: process.env.ELEVEN_LABS_API_KEY,
});

export const textToSpeech = async (text: string): Promise<Buffer> => {
    if (!process.env.ELEVEN_LABS_API_KEY) {
        throw new Error('ELEVEN_LABS_API_KEY is not set');
    }

    // Using the Eleven Multilingual v2 model for best quality
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/jsCq9WUX7vUatWUNeb9o`, { // Default voice ID, can be parameterized
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "xi-api-key": process.env.ELEVEN_LABS_API_KEY,
        },
        body: JSON.stringify({
            text,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
                stability: 0.4,
                similarity_boost: 0.8,
                style_exaggeration: 0.2, // Subtle emphasis
                use_speaker_boost: true, // Higher quality
            },
        }),
    });


    if (!response.ok) {
        throw new Error(`ElevenLabs TTS failed: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
};

export const speechToText = async (audioBuffer: Buffer): Promise<string> => {
    // ElevenLabs STT implementation if needed for the oral step
    // Note: ElevenLabs STT might require a different endpoint or multipart form data
    const formData = new FormData();
    formData.append('file', new Blob([audioBuffer as any]), 'audio.wav');


    formData.append('model_id', 'scribe_v1'); // Fastest STT model

    const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
        method: 'POST',
        headers: {
            'xi-api-key': process.env.ELEVEN_LABS_API_KEY!,
        },
        body: formData,
    });

    if (!response.ok) {
        throw new Error(`ElevenLabs STT failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.text;
};
