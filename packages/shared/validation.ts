import { z } from 'zod';
import { Language, CEFR } from './types';

export const normalizeEmail = (email: string): string => {
    return email.trim().toLowerCase();
};

export const isValidEmail = (email: string): boolean => {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const SubscriptionSchema = z.object({
    email: z.string().email('Please enter a valid email'),
    language: z.nativeEnum(Language, {
        errorMap: () => ({ message: 'Please select a valid target language' })
    }),
    proficiencyLevel: z.nativeEnum(CEFR, {
        errorMap: () => ({ message: 'Please select a valid proficiency level' })
    })
});
