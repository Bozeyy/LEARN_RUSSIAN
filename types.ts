
export interface RussianWord {
  id: string;
  russian: string;
  french: string;
  phonetic: string;
  category: 'verbs' | 'nouns' | 'numbers';
  example?: string;
}

export type AppStep = 'select-activity' | 'select-category' | 'select-range' | 'game';
export type Activity = 'flashcards' | 'quiz';
export type Category = 'verbs' | 'nouns' | 'numbers' | 'both';
export type Direction = 'RU_FR' | 'FR_RU';

export interface QuizQuestion {
  word: RussianWord;
  options: string[];
  correctAnswer: string;
}
