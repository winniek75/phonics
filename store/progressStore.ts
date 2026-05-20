"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface GameScores {
  blending: number;
  segmenting: number;
  trickyWords: number;
  letterMatch: number;
  // ── 新規追加ゲーム ──
  bubblePop: number;
  whackAMole: number;
  wordFishing: number;
  memoryMatch: number;
}

interface WrongAnswer {
  game: string;
  question: string;       // the correct answer / question context
  userAnswer: string;     // what the user chose
  timestamp: number;
}

interface ProgressState {
  completedPhonemes: string[];
  gameScores: GameScores;
  masteredTrickyWords: string[];
  profileName: string;
  profileAvatarId: string;
  wrongAnswers: WrongAnswer[];

  // 講師モード用
  teacherMode: boolean;
  selectedPhonemes: string[]; // 講師が選択した学習対象文字

  markPhonemeComplete: (id: string) => void;
  updateGameScore: (game: keyof GameScores, score: number) => void;
  masterTrickyWord: (word: string) => void;
  setProfile: (name: string, avatarId: string) => void;
  resetProgress: () => void;
  addWrongAnswer: (game: string, question: string, userAnswer: string) => void;
  clearWrongAnswers: () => void;

  // 講師モード用
  setTeacherMode: (enabled: boolean) => void;
  setSelectedPhonemes: (phonemes: string[]) => void;
  setCompletedPhonemes: (phonemes: string[]) => void;
}

const defaultState = {
  completedPhonemes: [] as string[],
  gameScores: {
    blending: 0,
    segmenting: 0,
    trickyWords: 0,
    letterMatch: 0,
    bubblePop: 0,
    whackAMole: 0,
    wordFishing: 0,
    memoryMatch: 0,
  },
  masteredTrickyWords: [] as string[],
  profileName: "Learner",
  profileAvatarId: "🌟",
  wrongAnswers: [] as WrongAnswer[],
  teacherMode: false,
  selectedPhonemes: [] as string[],
};

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      ...defaultState,

      markPhonemeComplete: (id: string) =>
        set((state) => ({
          completedPhonemes: state.completedPhonemes.includes(id)
            ? state.completedPhonemes
            : [...state.completedPhonemes, id],
        })),

      updateGameScore: (game: keyof GameScores, score: number) =>
        set((state) => ({
          gameScores: {
            ...state.gameScores,
            [game]: Math.max(state.gameScores[game], score),
          },
        })),

      masterTrickyWord: (word: string) =>
        set((state) => ({
          masteredTrickyWords: state.masteredTrickyWords.includes(word)
            ? state.masteredTrickyWords
            : [...state.masteredTrickyWords, word],
        })),

      setProfile: (name: string, avatarId: string) =>
        set({ profileName: name, profileAvatarId: avatarId }),

      resetProgress: () => set({ ...defaultState }),

      addWrongAnswer: (game: string, question: string, userAnswer: string) =>
        set((state) => ({
          wrongAnswers: [
            ...state.wrongAnswers.slice(-99), // keep last 100 entries
            { game, question, userAnswer, timestamp: Date.now() },
          ],
        })),

      clearWrongAnswers: () => set({ wrongAnswers: [] }),

      // 講師モード用
      setTeacherMode: (enabled: boolean) => set({ teacherMode: enabled }),

      setSelectedPhonemes: (phonemes: string[]) => set({ selectedPhonemes: phonemes }),

      setCompletedPhonemes: (phonemes: string[]) => set({ completedPhonemes: phonemes }),
    }),
    {
      name: "jolly-phonics-progress",
      storage: createJSONStorage(() => {
        if (typeof window !== "undefined") return localStorage;
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
    }
  )
);
