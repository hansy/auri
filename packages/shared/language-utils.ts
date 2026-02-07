import { Language } from './types';
import languagesData from './languages.json';

export interface LanguageData {
    id: string;
    name: string;
    flag: string;
}

export const LANGUAGES_DATA: LanguageData[] = (languagesData as LanguageData[]).sort((a, b) =>
    a.name.localeCompare(b.name)
);

export function getLanguages(): LanguageData[] {
    return LANGUAGES_DATA;
}

/**
 * Checks if the provided string is a valid language name or ID.
 */
export function isValidLanguage(language: string): boolean {
    return LANGUAGES_DATA.some(l => l.name === language || l.id === language);
}

/**
 * Helper to get the Language enum value from a string (name or ID).
 */
export function getLanguageEnum(language: string): Language | undefined {
    const data = LANGUAGES_DATA.find(l => l.name === language || l.id === language);
    if (!data) return undefined;

    return Object.values(Language).find(v => v === data.name) as Language;
}

/**
 * Helper to get the flag for a language.
 */
export function getLanguageFlag(language: string): string | undefined {
    const data = LANGUAGES_DATA.find(l => l.name === language || l.id === language);
    return data?.flag;
}
