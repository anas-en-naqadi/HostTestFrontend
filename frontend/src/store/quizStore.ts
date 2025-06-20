import { create } from 'zustand';

interface QuizState {
  isQuizActive: boolean;
  setQuizActive: (active: boolean) => void;
}

export const useQuizStore = create<QuizState>((set) => ({
  isQuizActive: false,
  setQuizActive: (active) => set({ isQuizActive: active }),
}));