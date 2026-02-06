import { Language } from './types';
import languagesData from './languages.json';

export interface LanguageVariant {
    name: string;
    flag: string;
}

export interface LanguageData {
    id: string;
    name: string;
    flag: string;
    variants: LanguageVariant[];
}

export const LANGUAGES_DATA: LanguageData[] = languagesData as LanguageData[];

export function getLanguages(): LanguageData[] {
    return LANGUAGES_DATA;
}

/**
 * Returns the variants for a given language.
 * Accepts either the Language enum value (e.g., 'English') or the ID (e.g., 'english').
 */
export function getVariantsForLanguage(language: string): LanguageVariant[] {
    const data = LANGUAGES_DATA.find(l => l.name === language || l.id === language);
    return data?.variants || [];
}

/**
 * Checks if the provided string is a valid language name or ID.
 */
export function isValidLanguage(language: string): boolean {
    return LANGUAGES_DATA.some(l => l.name === language || l.id === language);
}

/**
 * Checks if the provided variant is valid for the given language.
 * If the language has no variants defined, any variant (including none) is considered valid.
 * Otherwise, the variant must be in the predefined list.
 */
export function isValidVariant(language: string, variant: string | null | undefined): boolean {
    const data = LANGUAGES_DATA.find(l => l.name === language || l.id === language);
    if (!data) return false;

    if (data.variants.length === 0) {
        return true;
    }

    if (!variant) return false;

    return data.variants.some(v => v.name === variant);
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

/**
 * Helper to get the flag for a specific variant.
 */
export function getVariantFlag(language: string, variant: string): string | undefined {
    const variants = getVariantsForLanguage(language);
    return variants.find(v => v.name === variant)?.flag;
}
