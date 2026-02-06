import React, { useMemo } from 'react';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue
} from './ui/select';
import { Language } from '@auri/shared/types';
import { getLanguages, getLanguageEnum, getVariantsForLanguage } from '@auri/shared/language-utils';

interface LanguageSelectorProps {
    selectedLanguage: Language;
    onLanguageChange: (language: Language) => void;
    selectedVariant?: string;
    onVariantChange?: (variant: string) => void;
    className?: string;
    hideVariant?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
    selectedLanguage,
    onLanguageChange,
    selectedVariant,
    onVariantChange,
    className,
    hideVariant = false
}) => {
    const languages = useMemo(() => getLanguages(), []);

    const currentLanguageData = useMemo(() => {
        return languages.find(l => l.name === selectedLanguage);
    }, [languages, selectedLanguage]);

    const variants = useMemo(() => {
        if (!currentLanguageData) return [];
        return currentLanguageData.variants;
    }, [currentLanguageData]);

    const handleLanguageChange = (value: string) => {
        const langEnum = getLanguageEnum(value);
        if (langEnum) {
            onLanguageChange(langEnum);

            // If the new language has variants, select the first one by default if callback exists
            const newVariants = getVariantsForLanguage(value);
            if (newVariants.length > 0 && onVariantChange) {
                onVariantChange(newVariants[0].name);
            }
        }
    };

    return (
        <div className={`flex flex-col gap-4 w-full ${className}`}>
            <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-stone-400 block text-center">
                    Target Language
                </label>
                <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="w-full h-12 rounded-2xl bg-stone-50 border-stone-200 text-stone-800">
                        <SelectValue placeholder="Select a language" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-stone-200 rounded-2xl shadow-xl">
                        <SelectGroup>
                            {languages.map((lang) => (
                                <SelectItem key={lang.id} value={lang.name} className="py-3 rounded-xl focus:bg-stone-50">
                                    <span className="mr-3 text-lg leading-none">{lang.flag}</span>
                                    <span className="font-medium">{lang.name}</span>
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>

            {variants.length > 0 && onVariantChange && !hideVariant && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-stone-400 block text-center">
                        Regional Variant
                    </label>
                    <Select value={selectedVariant} onValueChange={onVariantChange}>
                        <SelectTrigger className="w-full h-12 rounded-2xl bg-stone-50 border-stone-200 text-stone-800">
                            <SelectValue placeholder="Select a variant" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-stone-200 rounded-2xl shadow-xl">
                            <SelectGroup>
                                {variants.map((variant) => (
                                    <SelectItem key={variant.name} value={variant.name} className="py-3 rounded-xl focus:bg-stone-50">
                                        <span className="mr-3 text-lg leading-none">{variant.flag}</span>
                                        <span className="font-medium">{variant.name}</span>
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
            )}
        </div>
    );
};
