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
import { getLanguages, getLanguageEnum } from '@auri/shared/language-utils';

interface LanguageSelectorProps {
    selectedLanguage: Language;
    onLanguageChange: (language: Language) => void;
    className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
    selectedLanguage,
    onLanguageChange,
    className
}) => {
    const languages = useMemo(() => getLanguages(), []);

    const handleLanguageChange = (value: string) => {
        const langEnum = getLanguageEnum(value);
        if (langEnum) {
            onLanguageChange(langEnum);
        }
    };

    const selectedLanguageData = useMemo(() =>
        languages.find(l => l.code === selectedLanguage),
        [languages, selectedLanguage]
    );

    return (
        <div className={`flex flex-col gap-4 w-full ${className}`}>
            <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-stone-400 block text-center">
                    Target Language
                </label>
                <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="w-full h-12 rounded-2xl bg-stone-50 border-stone-200 text-stone-800">
                        <SelectValue>
                            {selectedLanguageData ? (
                                <div className="flex items-center gap-2">
                                    <span className="text-lg leading-none">{selectedLanguageData.flag}</span>
                                    <span>{selectedLanguageData.name}</span>
                                </div>
                            ) : (
                                "Select a language"
                            )}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-white border-stone-200 rounded-2xl shadow-xl">
                        <SelectGroup>
                            {languages.map((lang) => (
                                <SelectItem key={lang.id} value={lang.code} className="py-3 rounded-xl focus:bg-stone-50">
                                    <span className="mr-3 text-lg leading-none">{lang.flag}</span>
                                    <span className="font-medium">{lang.name}</span>
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
};
