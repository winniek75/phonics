"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { phonemes, Phoneme } from "@/data/phonemes";
import { useProgressStore } from "@/store/progressStore";
import { useAudio } from "@/hooks/useAudio";
import { getSoundEffects } from "@/utils/soundEffects";

// ─── 型 ──────────────────────────────────────────────────────────────────────

interface Bubble {
  id: number;
  phoneme: Phoneme;
  x: number;        // vw % (左端基準)
  y: number;        // vh % (上端基準)
  size: number;     // px
  colorClass: string;
  driftX: number;
  driftY: number;
  duration: number;
  rotateDirection: number; // 回転方向
  scaleVariation: number; // サイズ変動
  floatPattern: 'sine' | 'cosine' | 'zigzag' | 'spiral'; // 浮遊パターン
}

type BubbleEffect = "pop" | "squish" | null;

// ─── 定数 ────────────────────────────────────────────────────────────────────

const GAME_DURATION = 30;
const MAX_BUBBLES = 6;
const MIN_BUBBLES = 4;

const BUBBLE_COLORS = [
  "from-pink-300 to-pink-500 border-pink-200",
  "from-blue-300 to-blue-500 border-blue-200",
  "from-purple-300 to-purple-500 border-purple-200",
  "from-yellow-300 to-yellow-400 border-yellow-200",
  "from-green-300 to-green-500 border-green-200",
  "from-orange-300 to-orange-500 border-orange-200",
  "from-teal-300 to-teal-500 border-teal-200",
  "from-red-300 to-red-500 border-red-200",
];

// ─── ユーティリティ ───────────────────────────────────────────────────────────

let _id = 0;
const nextId = () => ++_id;

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getAvailablePhonemes(completedPhonemes: string[]): Phoneme[] {
  const available = phonemes.filter(
    (p) => completedPhonemes.includes(p.id) || p.group === 1
  );
  return available.length > 0 ? available : phonemes.filter((p) => p.group === 1);
}

function spawnBubble(phoneme: Phoneme): Bubble {
  const patterns: ('sine' | 'cosine' | 'zigzag' | 'spiral')[] = ['sine', 'cosine', 'zigzag', 'spiral'];

  return {
    id: nextId(),
    phoneme,
    x: 5 + Math.random() * 80,   // より広い範囲で配置
    y: 10 + Math.random() * 70,  // より広い範囲で配置
    size: 120 + Math.floor(Math.random() * 80), // 大きくする (120-200px)
    colorClass: pickRandom(BUBBLE_COLORS),
    driftX: (Math.random() - 0.5) * 25, // よりダイナミックに
    driftY: (Math.random() - 0.5) * 20, // よりダイナミックに
    duration: 5 + Math.random() * 4,    // 少し長めに (5-9秒)
    rotateDirection: Math.random() < 0.5 ? 1 : -1, // ランダム回転方向
    scaleVariation: 0.8 + Math.random() * 0.4, // サイズ変動 (0.8-1.2倍)
    floatPattern: pickRandom(patterns), // ランダム浮遊パターン
  };
}

// ─── コンポーネント ───────────────────────────────────────────────────────────

export default function BubblePopPage() {
  const { completedPhonemes, updateGameScore, selectedPhonemes } = useProgressStore();
  const { play } = useAudio();
  const soundEffects = getSoundEffects();

  const [phase, setPhase] = useState<"ready" | "playing" | "result">("ready");
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [target, setTarget] = useState<Phoneme | null>(null);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [effects, setEffects] = useState<Record<number, BubbleEffect>>({});

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const targetRef = useRef<Phoneme | null>(null);

  const available = selectedPhonemes && selectedPhonemes.length > 0
    ? phonemes.filter(p => selectedPhonemes.includes(p.id))
    : getAvailablePhonemes(completedPhonemes);

  // 新しいターゲットを選んで読み上げ
  const pickTarget = useCallback(
    (pool: Phoneme[]) => {
      const t = pickRandom(pool);
      setTarget(t);
      targetRef.current = t;
      play(t.audioFile);
      return t;
    },
    [play]
  );

  // 泡を補充（常に MIN_BUBBLES〜MAX_BUBBLES 維持）
  const replenish = useCallback(
    (current: Bubble[], targetId: string, pool: Phoneme[]): Bubble[] => {
      const needed = MAX_BUBBLES - current.length;
      if (needed <= 0) return current;

      const result = [...current];
      // 正解泡が 1 個以上含まれるよう保証
      const hasCorrect = result.some((b) => b.phoneme.id === targetId);
      for (let i = 0; i < needed; i++) {
        const forceCorrect = !hasCorrect && i === 0;
        const ph = forceCorrect
          ? pool.find((p) => p.id === targetId)!
          : pickRandom(pool);
        result.push(spawnBubble(ph));
      }
      return result;
    },
    []
  );

  // ゲーム開始
  const startGame = useCallback(() => {
    _id = 0;
    setScore(0);
    setMisses(0);
    setTimeLeft(GAME_DURATION);
    setEffects({});

    const t = pickTarget(available);
    const initialBubbles = replenish([], t.id, available);
    setBubbles(initialBubbles);
    setPhase("playing");
  }, [available, pickTarget, replenish]);

  // カウントダウン
  useEffect(() => {
    if (phase !== "playing") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setPhase("result");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [phase]);

  // スコア保存
  useEffect(() => {
    if (phase === "result") updateGameScore("bubblePop", score);
  }, [phase, score, updateGameScore]);

  // 泡タップ
  const handleTap = (bubble: Bubble) => {
    if (phase !== "playing") return;
    const correct = bubble.phoneme.id === targetRef.current?.id;

    if (correct) {
      // ポンッ！エフェクト
      setEffects((e) => ({ ...e, [bubble.id]: "pop" }));
      setScore((s) => s + 10);
      soundEffects.playPop(); // ポップ音を再生
      play(bubble.phoneme.audioFile);

      setTimeout(() => {
        setBubbles((prev) => {
          const filtered = prev.filter((b) => b.id !== bubble.id);
          // たまにターゲット変更
          const currentTarget = targetRef.current!;
          const newTarget =
            Math.random() < 0.35 ? pickTarget(available) : currentTarget;
          return replenish(filtered, newTarget.id, available);
        });
        setEffects((e) => {
          const copy = { ...e };
          delete copy[bubble.id];
          return copy;
        });
      }, 380);
    } else {
      // ぐにゃ！エフェクト
      setEffects((e) => ({ ...e, [bubble.id]: "squish" }));
      setMisses((m) => m + 1);
      soundEffects.playError(); // エラー音を再生
      setTimeout(() => {
        setEffects((e) => {
          const copy = { ...e };
          delete copy[bubble.id];
          return copy;
        });
      }, 450);
    }
  };

  const timerColor =
    timeLeft > 15 ? "text-green-600" : timeLeft > 8 ? "text-yellow-500" : "text-red-500";

  return (
    <div className="h-screen bg-gradient-to-b from-sky-200 via-blue-100 to-indigo-100 flex flex-col select-none overflow-hidden">
      {/* ヘッダー */}
      <header className="flex items-center justify-between px-6 py-4 bg-white/60 backdrop-blur-sm sticky top-0 z-10">
        <Link
          href="/games"
          className="text-blue-700 font-bold text-xl hover:text-blue-900"
        >
          ← Back
        </Link>
        <h1 className="font-display text-3xl text-blue-800">🫧 Bubble Pop</h1>
        <div className="w-20" />
      </header>

      {/* ── Ready ──────────────────────────────────────────────────── */}
      {phase === "ready" && (
        <div className="flex-1 flex items-center justify-center p-8">
          <motion.div
            className="bg-white rounded-3xl shadow-2xl p-12 max-w-lg w-full text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
          >
            <motion.div
              className="text-9xl mb-6"
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              🫧
            </motion.div>
            <h2 className="font-display text-4xl text-blue-700 mb-4">
              Bubble Pop!
            </h2>
            <p className="text-gray-600 text-lg mb-3">
              Listen to the sound, then pop the right bubble!
            </p>
            <p className="text-gray-500 text-base mb-10">
              ⏱ {GAME_DURATION} seconds · 10 pts per correct pop
            </p>
            <motion.button
              onClick={startGame}
              className="bg-blue-500 hover:bg-blue-600 text-white font-display text-3xl px-16 py-6 rounded-full shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Play!
            </motion.button>
          </motion.div>
        </div>
      )}

      {/* ── Playing ────────────────────────────────────────────────── */}
      {phase === "playing" && (
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {/* HUD */}
          <div className="flex items-center justify-between px-6 py-4 bg-white/50 backdrop-blur-sm gap-4 z-10">
            {/* ターゲット */}
            <AnimatePresence mode="wait">
              {target && (
                <motion.button
                  key={target.id}
                  onClick={() => play(target.audioFile)}
                  className="flex items-center gap-3 bg-white rounded-2xl px-6 py-3 shadow font-bold min-w-0"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-gray-500 text-base">Pop:</span>
                  <span className="font-display text-5xl text-blue-700">
                    {target.letter}
                  </span>
                  <span className="text-2xl">🔊</span>
                </motion.button>
              )}
            </AnimatePresence>

            {/* タイマー */}
            <div
              className={`font-display text-5xl font-bold tabular-nums ${timerColor}`}
            >
              {timeLeft}s
            </div>

            {/* スコア */}
            <div className="bg-white rounded-2xl px-6 py-3 shadow text-center">
              <div className="text-sm text-gray-400 font-bold uppercase tracking-wide">
                Score
              </div>
              <div className="font-display text-3xl text-purple-600">{score}</div>
            </div>
          </div>

          {/* 泡フィールド */}
          <div className="flex-1 relative">
            <AnimatePresence>
              {bubbles.map((bubble) => {
                const effect = effects[bubble.id] ?? null;
                return (
                  <motion.button
                    key={bubble.id}
                    onClick={() => handleTap(bubble)}
                    className={`absolute rounded-full bg-gradient-to-br ${bubble.colorClass} border-4 shadow-lg flex items-center justify-center cursor-pointer`}
                    style={{
                      left: `${bubble.x}%`,
                      top: `${bubble.y}%`,
                      width: bubble.size,
                      height: bubble.size,
                    }}
                    // 初期アニメ
                    initial={{ scale: 0, opacity: 0 }}
                    animate={
                      effect === "pop"
                        ? { scale: [1, 1.5, 0], opacity: [1, 0.8, 0] }
                        : effect === "squish"
                        ? {
                            scale: [1, 0.6, 1.1, 1],
                            scaleX: [1, 1.4, 0.9, 1],
                          }
                        : (() => {
                            // 浮遊パターンに基づいたアニメーション
                            switch (bubble.floatPattern) {
                              case 'sine':
                                return {
                                  scale: [bubble.scaleVariation, 1, bubble.scaleVariation],
                                  x: [0, bubble.driftX * 0.8, 0, bubble.driftX * -0.8, 0],
                                  y: [0, bubble.driftY * 0.6, 0, bubble.driftY * -0.6, 0],
                                  rotate: [0, bubble.rotateDirection * 180, 0, bubble.rotateDirection * 360],
                                };
                              case 'cosine':
                                return {
                                  scale: [1, bubble.scaleVariation, 1],
                                  x: [0, bubble.driftX * 0.7, 0, bubble.driftX * -0.7, 0],
                                  y: [0, -bubble.driftY * 0.5, 0, -bubble.driftY * 0.8, 0],
                                  rotate: [0, bubble.rotateDirection * 90, 0, bubble.rotateDirection * 180],
                                };
                              case 'zigzag':
                                return {
                                  scale: [bubble.scaleVariation, 1, bubble.scaleVariation, 1],
                                  x: [0, bubble.driftX, -bubble.driftX * 0.5, bubble.driftX * 0.8, 0],
                                  y: [0, bubble.driftY, -bubble.driftY, bubble.driftY * 0.6, 0],
                                  rotate: [0, bubble.rotateDirection * 45, bubble.rotateDirection * -30, bubble.rotateDirection * 60, 0],
                                };
                              case 'spiral':
                                return {
                                  scale: [1, bubble.scaleVariation, 1.1, bubble.scaleVariation],
                                  x: [0, bubble.driftX * 0.5, bubble.driftX, 0, -bubble.driftX * 0.3],
                                  y: [0, -bubble.driftY * 0.3, bubble.driftY, -bubble.driftY * 0.8, 0],
                                  rotate: [0, bubble.rotateDirection * 120, bubble.rotateDirection * 240, bubble.rotateDirection * 360],
                                };
                              default:
                                return {
                                  scale: 1,
                                  x: [0, bubble.driftX, 0, -bubble.driftX, 0],
                                  y: [0, -bubble.driftY, 0, bubble.driftY, 0],
                                };
                            }
                          })()
                    }
                    transition={
                      effect
                        ? { duration: 0.35, ease: "easeOut" }
                        : {
                            duration: bubble.duration,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }
                    }
                    exit={{ scale: 0, opacity: 0, transition: { duration: 0.2 } }}
                    whileHover={effect ? {} : { scale: 1.1 }}
                    aria-label={`Bubble ${bubble.phoneme.letter}`}
                  >
                    {/* 光沢 */}
                    <span
                      className="absolute bg-white/35 rounded-full"
                      style={{
                        width: bubble.size * 0.32,
                        height: bubble.size * 0.2,
                        top: "16%",
                        left: "16%",
                      }}
                    />
                    <span
                      className="font-display text-white drop-shadow-md select-none z-10"
                      style={{ fontSize: Math.max(bubble.size * 0.4, 32) }}
                    >
                      {bubble.phoneme.letter}
                    </span>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* ── Result ─────────────────────────────────────────────────── */}
      {phase === "result" && (
        <div className="flex-1 flex items-center justify-center p-8">
          <motion.div
            className="bg-white rounded-3xl shadow-2xl p-12 max-w-lg w-full text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
          >
            <div className="text-8xl mb-6">
              {score >= 80 ? "🏆" : score >= 40 ? "🎉" : "🫧"}
            </div>
            <h2 className="font-display text-4xl text-blue-700 mb-8">
              Time&apos;s Up!
            </h2>
            <div className="grid grid-cols-2 gap-6 mb-10">
              <div className="bg-purple-50 rounded-2xl p-6">
                <div className="font-display text-5xl text-purple-600">
                  {score}
                </div>
                <div className="text-base text-gray-500 font-bold">Score</div>
              </div>
              <div className="bg-red-50 rounded-2xl p-6">
                <div className="font-display text-5xl text-red-400">
                  {misses}
                </div>
                <div className="text-base text-gray-500 font-bold">Misses</div>
              </div>
            </div>
            <div className="flex gap-4 justify-center">
              <motion.button
                onClick={startGame}
                className="bg-blue-500 text-white font-display text-2xl px-10 py-4 rounded-full shadow"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Again!
              </motion.button>
              <Link href="/games">
                <motion.button
                  className="bg-gray-100 text-gray-600 font-display text-2xl px-10 py-4 rounded-full shadow"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Games
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}