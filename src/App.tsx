export interface Subject {
  id: string;
  name: string;
  icon: string;
  questionsCount: number;
  description: string;
}

export interface Question {
  id: string;
  subjectId: string;
  content: string;
  type: 'multiple-choice' | 'pronunciation' | 'fill-blank';
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Session {
  id: string;
  subjectId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number; // in seconds
  date: string; // YYYY-MM-DD
}

export interface WeakTopic {
  topic: string;
  errorCount: number;
}

export interface AppProgress {
  totalAttempts: number;
  averageScore: number;
  streakDays: number;
  weakTopics: WeakTopic[];
  completedPhonicsDays?: number[];
}

export interface PhonicsGroup {
  id: string;
  level: number;
  name: string;
  subtitle: string;
  description: string;
  icon: string;
  badgeColor: string;
}

export interface PhonicsWordItem {
  id: string;
  word: string;
  ipa: string;
  viPhonics: string;
  meaning: string;
  groupId: string;
  exampleSentence: string;
}

export interface DailyPhonicsLesson {
  day: number;
  title: string;
  focusGroupIds: string[];
  targetWords: string[];
  readingPassage: string;
  passageTranslation: string;
  dailyTip: string;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  soundEnabled: boolean;
  autoSave: boolean;
}

export interface StudentProfile {
  name: string;
  grade: string; // "6" | "7" | "8" | "9"
  currentLevel: string; // "lost" | "beginner" | "scared" | "grammar"
  goal: string; // "average" | "good" | "confident"
  surveyCompleted: boolean;
}

// Gamification types
export interface Gift {
  id: string;
  name: string;
  cost: number;
  description: string;
  icon: string;
  type: 'document' | 'physical' | 'badge' | 'voucher';
}

export interface AppDataState {
  subjects: Subject[];
  questions: Question[];
  sessions: Session[];
  progress: AppProgress;
  settings: AppSettings;
  profile: StudentProfile;
  points: number;
  unlockedGifts: string[];
  completedQuestions: string[]; // Question IDs that have been answered correctly
}

export interface PhonicsDecoding {
  brokenSyllables: string[];
  mainStressIndex: number; // 1-indexed
  readingSteps: string[];
  spellingRules: string[];
  ipaDecodingRules?: {
    ipaBrokenSyllables: string[];
    ipaStressRule: string;
    ipaReadingGuide: string;
  };
}

export interface VisionOCRResponse {
  extractedText: string;
  translatedText: string;
  grammarExplanation: string;
  keyVocabulary: Array<{
    word: string;
    ipa: string;
    meaning: string;
    phonicsTip: string;
  }>;
}

export interface ArenaQuestion {
  id: string;
  word: string;
  ipa: string;
  options: string[];
  correct: string;
  hint: string;
}

export interface WritingDoctorResult {
  score: number; // 0-10
  correctedSentence: string;
  errors: Array<{
    errorText: string;
    correction: string;
    explanation: string;
  }>;
  compliment: string;
}

