import { Language } from './types';
import languagesData from './languages.json';

export interface LanguageData {
    id: string;
    name: string;
    code: string; // ISO code (e.g. en-US)
    flag: string;
}

export const LANGUAGES_DATA: LanguageData[] = (languagesData as LanguageData[]).sort((a, b) =>
    a.name.localeCompare(b.name)
);

export function getLanguages(): LanguageData[] {
    return LANGUAGES_DATA;
}

/**
 * Checks if the provided string is a valid language name, ID, or ISO code.
 */
export function isValidLanguage(language: string): boolean {
    return LANGUAGES_DATA.some(l => l.name === language || l.id === language || l.code === language);
}

/**
 * Helper to get the Language enum value from a string (name, ID, or ISO code).
 */
export function getLanguageEnum(language: string): Language | undefined {
    const data = LANGUAGES_DATA.find(l => l.name === language || l.id === language || l.code === language);
    if (!data) return undefined;

    // The Language enum values are the ISO codes (data.code)
    return Object.values(Language).find(v => v === data.code) as Language;
}

/**
 * Helper to get the flag for a language.
 */
export function getLanguageFlag(language: string): string | undefined {
    const data = LANGUAGES_DATA.find(l => l.name === language || l.id === language || l.code === language);
    return data?.flag;
}
