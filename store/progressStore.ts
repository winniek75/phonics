"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface GameScores {
  blending: number;
  segmenting: number;
  trickyWords: number;
  letterMatch: number;
}

interface ProgressState {
  completedPhonemes: string[];
  gameScores: GameScores;
  masteredTrickyWords: string[];
  profileName: string;
  profileAvatarId: string;

  markPhonemeComplete: (id: string) => void;
  updateGameScore: (game: keyof GameScores, score: number) => void;
  masterTrickyWord: (word: string) => void;
  setProfile: (name: string, avatarId: string) => void;
  resetProgress: () => void;
}

const defaultState = {
  completedPhonemes: [] as string[],
  gameScores: {
    blending: 0,
    segmenting: 0,
    trickyWords: 0,
    letterMatch: 0,
  },
  masteredTrickyWords: [] as string[],
  profileName: "Learner",
  profileAvatarId: "🌟",
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
