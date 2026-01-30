
export enum Language {
  ENGLISH = 'English',
  SPANISH = 'Spanish',
  FRENCH = 'French',
  GERMAN = 'German'
}

export enum CEFR {
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
  question: string;
  intent: 'literal' | 'relational' | 'pragmatic';
}

export interface LessonJSON {
  storySpec: {
    level: CEFR;
    domain: Domain;
    scenario_family: string;
    cast_count: number;
    setting: string;
    communicative_goal: string;
    mild_conflict: string | null;
    discourse_shape: string;
    length_seconds: number;
  };
  dictation: {
    title: string;
    speakers: string[];
    script: string;
    chunking: {
      chunks: string[];
      pause_ms_between_chunks: number;
    };
    audio: {
      target_wpm: number;
      pauses_between_sentences_ms: number;
    };
  };
  questions: {
    script: QuestionSpec[];
  };
  reviewTranscript: {
    story: string;
    questions: string[];
  };
  difficulty: {
    level: CEFR;
    knobs: Record<string, string | number>;
  };
}

export interface LessonContent {
  id: string;
  json: LessonJSON;
  audioBase64?: string;
  language: Language;
}

export interface UserProfile {
  targetLanguage: Language;
  level: CEFR;
  streak: number;
  lastCompletedDate?: string;
  domainIndex: number;
}

export interface ReflectionFeedback {
  difficulty: 'Too easy' | 'About right' | 'Too hard';
  comments?: string;
}
