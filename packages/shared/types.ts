
export enum Language {
  ENGLISH_UK = 'en-GB',
  ENGLISH_USA = 'en-US',
  SPANISH_SPAIN = 'es-ES',
  SPANISH_LATIN_AMERICA = 'es-419',
  FRENCH = 'fr',
  GERMAN = 'de',
  RUSSIAN = 'ru',
  SWEDISH = 'sv',
  DUTCH = 'nl',
  PORTUGUESE_PORTUGAL = 'pt-PT',
  PORTUGUESE_BRAZIL = 'pt-BR',
  INDONESIAN = 'id',
  ITALIAN = 'it'
}

export enum CEFR {
  A0 = 'A0',
  A1 = 'A1',
  A2 = 'A2',
  B1 = 'B1',
  B2 = 'B2',
  C1 = 'C1'
}

export enum LessonStep {
  LANDING = 'landing',
  CONFIRM = 'confirm',
  DICTATION = 'dictation',
  ORAL_QA = 'oral_qa',
  REVIEW = 'review',
  REFLECTION = 'reflection',
  COMPLETION = 'completion'
}


export type Domain = 'personal' | 'public' | 'occupational';

export interface QuestionSpec {
  id: string;
  text: string;
  intent: 'literal' | 'relational' | 'pragmatic';
  key_points: string[];
}

export interface StorySpeaker {
  id: string;
  gender: 'male' | 'female';
  stability: 'creative' | 'natural' | 'robust';
  voiceId?: string; // Assigned post-generation
}

export interface StorySegment {
  speaker_id: string;
  text: string;
  break_after_ms?: number;
}

export interface LessonJSON {
  title: string;
  pov: 'first' | 'third';
  level: 'A2' | 'B1' | 'B2' | 'C1';
  domain: Domain;
  scenario_family: string;
  is_dialogue: boolean;
  speakers: StorySpeaker[];
  segments: StorySegment[];
  questions: QuestionSpec[];
}

export interface LessonContent {
  id: string;
  json: LessonJSON;
  audioBase64?: string;
  audioUrl?: string;
  language: Language;
  proficiencyLevelGuideline?: string;
}

export interface UserProfile {
  targetLanguage: Language;
  nativeLanguage: Language;
  proficiencyLevel: CEFR;
  streak: number;
  lastCompletedDate?: string;
}

export interface ReflectionFeedback {
  difficulty: 'Too easy' | 'About right' | 'Too hard';
  comments?: string;
}
