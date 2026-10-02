"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { phonemes } from "@/data/phonemes";

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

// 音のページで「じっさいに やったこと」の記録
export interface PhonemeActivity {
  heard: boolean;     // 音（Hear Sound）を再生して聞いた
  words: string[];    // 聞いた例の単語
}

// ⭐（学習済み）になる条件: 音を聞いた ＋ 例の単語を1つ以上聞いた
export function isPhonemeDone(a?: PhonemeActivity): boolean {
  return !!a && a.heard && a.words.length >= 1;
}

interface ProgressState {
  completedPhonemes: string[];
  phonemeActivity: Record<string, PhonemeActivity>;
  gameScores: GameScores;
  masteredTrickyWords: string[];
  profileName: string;
  profileAvatarId: string;
  wrongAnswers: WrongAnswer[];

  // 講師モード用
  teacherMode: boolean;
  selectedPhonemes: string[]; // 講師が選択した学習対象文字

  markPhonemeComplete: (id: string) => void;
  recordPhonemeHeard: (id: string) => void;
  recordPhonemeWordHeard: (id: string, word: string) => void;
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
  phonemeActivity: {} as Record<string, PhonemeActivity>,
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

// 行動を記録し、条件を満たしたら completedPhonemes に追加する
function applyActivity(
  state: { completedPhonemes: string[]; phonemeActivity: Record<string, PhonemeActivity> },
  id: string,
  update: (a: PhonemeActivity) => PhonemeActivity
) {
  const next = update(state.phonemeActivity[id] || { heard: false, words: [] });
  return {
    phonemeActivity: { ...state.phonemeActivity, [id]: next },
    completedPhonemes:
      isPhonemeDone(next) && !state.completedPhonemes.includes(id)
        ? [...state.completedPhonemes, id]
        : state.completedPhonemes,
  };
}

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

      recordPhonemeHeard: (id: string) =>
        set((state) => applyActivity(state, id, (a) => ({ ...a, heard: true }))),

      recordPhonemeWordHeard: (id: string, word: string) =>
        set((state) =>
          applyActivity(state, id, (a) =>
            a.words.includes(word) ? a : { ...a, words: [...a.words, word] }
          )
        ),

      updateGameScore: (game: keyof GameScores, score: number, wrongAnswers?: Array<{q:string;correct:string;chosen:string;tag:string}>) =>
        set((state) => {
          // → MoWISE portal へスコア送信 (WiseGame Bridge)
          // 8ゲーム全ての結果がここを通るため、1箇所で全ゲーム対応
          try {
            const w = window as unknown as {
              WiseGame?: { reportComplete: (d: Record<string, unknown>) => void };
            };
            w.WiseGame?.reportComplete({
              score,
              maxScore: Math.max(score, 100),
              metadata: { subGame: game, wrongAnswers: (wrongAnswers || []).slice(0, 20) },
            });
          } catch {}
          return {
            gameScores: {
              ...state.gameScores,
              [game]: Math.max(state.gameScores[game], score),
            },
          };
        }),

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

/**
 * ディープリンク: /games/<game>?phonemes=s,a,t  または  /games/<game>?group=1
 * ポータル（先生）が指定した音だけでゲームを直接はじめられるようにする。
 * ページ読み込み時に1回だけ、練習対象（selectedPhonemes）を上書きする。
 */
export function parsePhonemeParams(search: string): string[] | null {
  const params = new URLSearchParams(search);
  const ids = new Set<string>();
  (params.get("phonemes") || params.get("phoneme") || "")
    .split(",").map((x) => x.trim()).filter(Boolean)
    .forEach((x) => {
      // "oo" "th" は2種類あるので両方を対象にする
      phonemes.filter((p) => p.id === x || p.id.startsWith(x + "_")).forEach((p) => ids.add(p.id));
    });
  (params.get("group") || "")
    .split(",").map((x) => parseInt(x, 10))
    .forEach((g) => phonemes.filter((p) => p.group === g).forEach((p) => ids.add(p.id)));
  return ids.size > 0 ? phonemes.filter((p) => ids.has(p.id)).map((p) => p.id) : null;
}

if (typeof window !== "undefined" && window.location.pathname.startsWith("/games/")) {
  const fromUrl = parsePhonemeParams(window.location.search);
  if (fromUrl) useProgressStore.setState({ selectedPhonemes: fromUrl });
}
