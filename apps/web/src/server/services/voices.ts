import voicesData from "@auri/shared/voices.json";

interface Voice {
    voiceId: string;
    gender: string;
}

export class VoiceService {
    static getVoicesForLanguage(languageCode: string): Voice[] {
        // Cast to any to access by key since JSON import might not be strictly typed as Record<string, ...>
        const voices = (voicesData as any)[languageCode];
        return voices || [];
    }

    static assignVoicesToSpeakers(languageCode: string, speakers: { id: string; gender?: string }[]): Map<string, string> {
        const availableVoices = [...this.getVoicesForLanguage(languageCode)];
        const assignedVoices = new Map<string, string>();

        // Shuffle available voices to ensure randomness
        for (let i = availableVoices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [availableVoices[i], availableVoices[j]] = [availableVoices[j], availableVoices[i]];
        }

        for (const speaker of speakers) {
            // Try to find a voice that matches gender and hasn't been used (though we popped them so they are unique by definition if we don't put them back)
            // If we run out of voices, we might need to reuse or just pick random. 
            // The requirement is "should not be repeated". If we have more characters than voices, we must repeat or fail. 
            // For now, let's just try to match gender.

            const gender = speaker.gender?.toLowerCase();
            let voiceIndex = -1;

            if (gender) {
                voiceIndex = availableVoices.findIndex(v => v.gender === gender);
            }

            // If no gender match or no gender specified, just pick the first available
            if (voiceIndex === -1) {
                voiceIndex = 0; // Just pick the first one
            }

            if (voiceIndex !== -1 && availableVoices.length > 0) {
                const voice = availableVoices[voiceIndex];
                assignedVoices.set(speaker.id, voice.voiceId);
                availableVoices.splice(voiceIndex, 1); // Remove used voice to ensure uniqueness
            } else {
                // Fallback: If we ran out of unique voices, we might have to reuse from original list (user said "should not", but better than crashing?)
                // Or maybe we can't satisfy uniqueness.
                // For MVP, let's reuse if we run out.
                const originalVoices = this.getVoicesForLanguage(languageCode);
                // Try to match gender again from full list
                const fallbackVoice = originalVoices.find(v => v.gender === gender) || originalVoices[0];
                if (fallbackVoice) {
                    assignedVoices.set(speaker.id, fallbackVoice.voiceId);
                }
            }
        }

        return assignedVoices;
    }
}
