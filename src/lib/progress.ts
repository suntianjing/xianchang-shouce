import { create } from "zustand";
import { persist } from "zustand/middleware";

export type LastLesson = { track: string; slug: string };

type ProgressState = {
  completed: Record<string, boolean>;
  quizCorrect: Record<string, boolean>;
  quizWrong: Record<string, boolean>;
  lastLesson: LastLesson | null;
  markComplete: (id: string) => void;
  markIncomplete: (id: string) => void;
  setLastLesson: (lesson: LastLesson) => void;
  markQuiz: (id: string, correct: boolean) => void;
  resetQuiz: () => void;
  resetAll: () => void;
};

export const lessonId = (track: string, slug: string) => `${track}:${slug}`;

export const useProgress = create<ProgressState>()(
  persist(
    (set) => ({
      completed: {},
      quizCorrect: {},
      quizWrong: {},
      lastLesson: null,
      markComplete: (id) =>
        set((s) => ({ completed: { ...s.completed, [id]: true } })),
      markIncomplete: (id) =>
        set((s) => {
          const next = { ...s.completed };
          delete next[id];
          return { completed: next };
        }),
      setLastLesson: (lesson) => set({ lastLesson: lesson }),
      markQuiz: (id, correct) =>
        set((s) => ({
          quizCorrect: { ...s.quizCorrect, [id]: correct },
          quizWrong: { ...s.quizWrong, [id]: !correct },
        })),
      resetQuiz: () => set({ quizCorrect: {}, quizWrong: {} }),
      resetAll: () =>
        set({ completed: {}, quizCorrect: {}, quizWrong: {}, lastLesson: null }),
    }),
    { name: "vue-field-manual-progress", skipHydration: true },
  ),
);
