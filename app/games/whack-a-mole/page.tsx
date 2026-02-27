"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { phonemes, Phoneme } from "@/data/phonemes";
import { useProgressStore } from "@/store/progressStore";
import { useAudio } from "@/hooks/useAudio";
import { getSoundEffects } from "@/utils/soundEffects";

// ─── 型 ──────────────────────────────────────────────────────────────────────

interface Mole {
  slotIndex: number;  // 0-8
  phoneme: Phoneme;
  hitAt: number | null;
}

type Phase = "ready" | "playing" | "result";

// ─── 定数 ────────────────────────────────────────────────────────────────────

const GAME_DURATION = 60;
const MAX_LIVES = 3;
const HOLES = 9;
const GROUP_COLORS: Record<number, string> = {
  1: "bg-red-400",
  2: "bg-orange-400",
  3: "bg-yellow-400",
  4: "bg-green-400",
  5: "bg-blue-400",
  6: "bg-purple-400",
  7: "bg-pink-400",
};
const GROUP_SHADOW: Record<number, string> = {
  1: "shadow-red-300",
  2: "shadow-orange-300",
  3: "shadow-yellow-300",
  4: "shadow-green-300",
  5: "shadow-blue-300",
  6: "shadow-purple-300",
  7: "shadow-pink-300",
};

// ─── ユーティリティ ───────────────────────────────────────────────────────────

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getAvailable(completedPhonemes: string[]): Phoneme[] {
  const list = phonemes.filter(
    (p) => completedPhonemes.includes(p.id) || p.group === 1
  );
  return list.length > 0 ? list : phonemes.filter((p) => p.group === 1);
}

// ─── コンポーネント ───────────────────────────────────────────────────────────

export default function WhackAMolePage() {
  const { completedPhonemes, updateGameScore, selectedPhonemes } = useProgressStore();
  const { play } = useAudio();
  const soundEffects = getSoundEffects();

  const [phase, setPhase] = useState<Phase>("ready");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [target, setTarget] = useState<Phoneme | null>(null);
  const [moles, setMoles] = useState<(Mole | null)[]>(Array(HOLES).fill(null));
  const [hitEffect, setHitEffect] = useState<number | null>(null);   // slot
  const [missEffect, setMissEffect] = useState<number | null>(null); // slot
  const [popEffect, setPopEffect] = useState<"correct" | "wrong" | null>(null);

  const targetRef = useRef<Phoneme | null>(null);
  const livesRef = useRef(MAX_LIVES);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const spawnRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const speedRef = useRef(1800); // ms per spawn
  const nonTargetCountRef = useRef(0); // ターゲット以外のモグラが連続で出た回数

  const available = selectedPhonemes && selectedPhonemes.length > 0
    ? phonemes.filter(p => selectedPhonemes.includes(p.id))
    : getAvailable(completedPhonemes);

  // フォールバック: availableが空の場合は最初のグループを使用
  const safeAvailable = available.length > 0 ? available : phonemes.filter((p) => p.group === 1);

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

  // ランダムな空スロットに 1 匹モグラを出す
  const spawnMole = useCallback(
    (pool: Phoneme[], targetId: string) => {
      setMoles((prev) => {
        const emptySlots = prev
          .map((m, i) => (m === null ? i : -1))
          .filter((i) => i >= 0);
        if (emptySlots.length === 0) return prev;

        const slotIndex = pickRandom(emptySlots);
        // 連続でターゲット以外が3回出たら強制的にターゲットを出す
        const forceTarget = nonTargetCountRef.current >= 3;
        // 正解モグラを 85% の確率で出す（ターゲットが出やすく）
        const isTarget = forceTarget || Math.random() < 0.85;
        const phoneme = isTarget
          ? pool.find((p) => p.id === targetId) ?? pickRandom(pool)
          : pickRandom(pool.filter((p) => p.id !== targetId)) ?? pickRandom(pool);

        // カウンターを更新
        if (isTarget) {
          nonTargetCountRef.current = 0;
        } else {
          nonTargetCountRef.current += 1;
        }

        const mole: Mole = { slotIndex, phoneme, hitAt: null };
        const next = [...prev];
        next[slotIndex] = mole;

        // 一定時間後に潜る（ゆっくり）
        const hideMs = Math.max(1200, speedRef.current * 1.2);
        setTimeout(() => {
          setMoles((m) =>
            m.map((s, i) => (i === slotIndex && s?.hitAt === null ? null : s))
          );
        }, hideMs);

        return next;
      });
    },
    []
  );

  const endGame = useCallback(() => {
    clearInterval(timerRef.current!);
    clearInterval(spawnRef.current!);
    setPhase("result");
  }, []);

  const startGame = useCallback(() => {
    livesRef.current = MAX_LIVES;
    speedRef.current = 2500; // ゆっくり
    nonTargetCountRef.current = 0; // カウンターリセット
    setScore(0);
    setLives(MAX_LIVES);
    setTimeLeft(GAME_DURATION);
    setMoles(Array(HOLES).fill(null));
    setHitEffect(null);
    setMissEffect(null);
    setPopEffect(null);

    const t = pickTarget(safeAvailable);

    // カウントダウン
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        // 15 秒ごとに加速
        if ((prev - 1) % 15 === 0) {
          speedRef.current = Math.max(700, speedRef.current - 300);
        }
        return prev - 1;
      });
    }, 1000);

    // スポーン（より頻繁に）
    spawnRef.current = setInterval(() => {
      spawnMole(safeAvailable, t.id);
    }, 700);

    setPhase("playing");
  }, [safeAvailable, pickTarget, spawnMole, endGame]);

  // スコア保存
  useEffect(() => {
    if (phase === "result") updateGameScore("whackAMole", score);
  }, [phase, score, updateGameScore]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current!);
      clearInterval(spawnRef.current!);
    };
  }, []);

  const handleWhack = (slotIndex: number) => {
    if (phase !== "playing") return;
    const mole = moles[slotIndex];
    if (!mole || mole.hitAt !== null) return;

    if (mole.phoneme.id === targetRef.current?.id) {
      // 正解！
      soundEffects.playHit(); // ヒット音を再生
      play(mole.phoneme.audioFile);
      setScore((s) => s + 10);
      setHitEffect(slotIndex);
      setPopEffect("correct");
      setMoles((prev) =>
        prev.map((m, i) =>
          i === slotIndex ? { ...m!, hitAt: Date.now() } : m
        )
      );
      // 潜る
      setTimeout(() => {
        setMoles((prev) => prev.map((m, i) => (i === slotIndex ? null : m)));
        setHitEffect(null);
        setPopEffect(null);
        // 35% の確率でターゲット変更
        if (Math.random() < 0.35) pickTarget(safeAvailable);
      }, 350);
    } else {
      // 不正解
      soundEffects.playError(); // エラー音を再生
      setMissEffect(slotIndex);
      setPopEffect("wrong");
      const newLives = livesRef.current - 1;
      livesRef.current = newLives;
      setLives(newLives);
      setTimeout(() => {
        setMissEffect(null);
        setPopEffect(null);
        if (newLives <= 0) endGame();
      }, 500);
    }
  };

  const timerColor =
    timeLeft > 30 ? "text-green-600" : timeLeft > 15 ? "text-yellow-500" : "text-red-500";

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-200 via-lime-100 to-yellow-100 flex flex-col select-none">
      {/* ヘッダー */}
      <header className="flex items-center justify-between px-4 py-3 bg-white/60 backdrop-blur-sm sticky top-0 z-10">
        <Link href="/games" className="text-green-700 font-bold text-lg hover:text-green-900">
          ← Back
        </Link>
        <h1 className="font-display text-2xl text-green-800">🐾 Whack-a-Mole</h1>
        <div className="w-16" />
      </header>

      {/* ── Ready ──────────────────────────────────────────────────── */}
      {phase === "ready" && (
        <div className="flex-1 flex items-center justify-center p-8">
          <motion.div
            className="bg-white rounded-3xl shadow-2xl p-10 max-w-sm w-full text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
          >
            <motion.div
              className="text-8xl mb-4"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              🐾
            </motion.div>
            <h2 className="font-display text-3xl text-green-700 mb-3">
              Whack-a-Mole!
            </h2>
            <p className="text-gray-600 text-base mb-2">
              Listen to the sound and whack the mole with the right letter!
            </p>
            <p className="text-gray-500 text-sm mb-8">
              ⏱ {GAME_DURATION}s · ❤️ {MAX_LIVES} lives · 10 pts per hit
            </p>
            <motion.button
              onClick={startGame}
              className="bg-green-500 hover:bg-green-600 text-white font-display text-2xl px-12 py-4 rounded-full shadow-lg"
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
        <div className="flex-1 flex flex-col items-center gap-3 px-4 py-3">
          {/* HUD */}
          <div className="w-full max-w-lg flex items-center justify-between bg-white/70 rounded-2xl px-4 py-2 shadow">
            {/* ライフ */}
            <div className="flex gap-1">
              {Array.from({ length: MAX_LIVES }).map((_, i) => (
                <motion.span
                  key={i}
                  className="text-2xl"
                  animate={i === lives && lives < MAX_LIVES ? { scale: [1, 1.4, 1] } : {}}
                >
                  {i < lives ? "❤️" : "🖤"}
                </motion.span>
              ))}
            </div>

            {/* ターゲット */}
            <AnimatePresence mode="wait">
              {target && (
                <motion.div
                  key={target.id}
                  className="relative"
                  initial={{ y: -8, opacity: 0, scale: 0.9 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: 8, opacity: 0, scale: 0.9 }}
                >
                  <motion.button
                    onClick={() => play(target.audioFile)}
                    className="flex items-center gap-3 bg-gradient-to-r from-yellow-300 to-yellow-400 rounded-2xl px-6 py-3 shadow-lg border-4 border-yellow-500"
                    whileTap={{ scale: 0.95 }}
                    animate={{
                      boxShadow: [
                        "0 0 20px rgba(250, 204, 21, 0.4)",
                        "0 0 40px rgba(250, 204, 21, 0.8)",
                        "0 0 20px rgba(250, 204, 21, 0.4)",
                      ]
                    }}
                    transition={{
                      boxShadow: {
                        duration: 1.5,
                        repeat: Infinity,
                        repeatType: "loop"
                      }
                    }}
                  >
                    <span className="text-2xl font-bold text-yellow-800">🎯 HIT:</span>
                    <span className="font-display text-6xl text-yellow-900 drop-shadow-md">
                      {target.letter}
                    </span>
                    <span className="text-3xl animate-pulse">🔊</span>
                  </motion.button>
                  <motion.div
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm"
                    animate={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                  >
                    !
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* タイマー & スコア */}
            <div className="text-right">
              <div className={`font-display text-2xl font-bold ${timerColor}`}>
                {timeLeft}s
              </div>
              <div className="text-sm text-gray-500">
                Score:{" "}
                <span className="font-bold text-purple-600">{score}</span>
              </div>
            </div>
          </div>

          {/* フィードバックバナー */}
          <AnimatePresence>
            {popEffect && (
              <motion.div
                className={`font-display text-xl px-6 py-2 rounded-full shadow ${
                  popEffect === "correct"
                    ? "bg-green-400 text-white"
                    : "bg-red-400 text-white"
                }`}
                initial={{ y: -16, opacity: 0, scale: 0.8 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                {popEffect === "correct" ? "✅ Great Hit!" : "❌ Wrong Mole!"}
              </motion.div>
            )}
          </AnimatePresence>

          {/* 3×3 グリッド */}
          <div className="grid grid-cols-3 gap-6 w-full max-w-3xl flex-1 content-center pb-4">
            {Array.from({ length: HOLES }).map((_, i) => {
              const mole = moles[i];
              const isHit = hitEffect === i;
              const isMiss = missEffect === i;
              const color = mole
                ? GROUP_COLORS[mole.phoneme.group]
                : "bg-gray-300";
              const shadow = mole
                ? GROUP_SHADOW[mole.phoneme.group]
                : "shadow-gray-300";

              return (
                <button
                  key={i}
                  onClick={() => handleWhack(i)}
                  className="relative flex flex-col items-center justify-end"
                  style={{ minHeight: 160 }}
                  aria-label={`Hole ${i + 1}`}
                >
                  {/* 穴 */}
                  <div className="w-full h-12 bg-stone-600 rounded-full shadow-inner relative z-0">
                    <div className="absolute inset-x-2 top-1 bottom-0 bg-stone-700 rounded-full opacity-50" />
                  </div>

                  {/* モグラ */}
                  <AnimatePresence>
                    {mole && (
                      <motion.div
                        className={`absolute bottom-8 ${color} shadow-xl z-10`}
                        style={{ width: 140, height: 140 }}
                        initial={{ y: 80, scale: 0.5 }}
                        animate={
                          isHit
                            ? { y: 80, scale: 0.3, opacity: 0 }
                            : isMiss
                            ? { x: [-6, 6, -6, 6, 0] }
                            : { y: -20, scale: 1 }
                        }
                        exit={{ y: 80, scale: 0.4, transition: { duration: 0.2 } }}
                        transition={
                          isMiss
                            ? { duration: 0.3 }
                            : { type: "spring", stiffness: 380, damping: 22 }
                        }
                      >
                        <div className="flex flex-col items-center justify-center rounded-t-full bg-inherit w-full h-full relative">
                          {/* 耳 */}
                          <div className="absolute top-4 flex gap-12">
                            <div className="w-8 h-10 bg-inherit rounded-full opacity-90" />
                            <div className="w-8 h-10 bg-inherit rounded-full opacity-90" />
                          </div>
                          {/* 目 */}
                          <div className="flex gap-3 mb-2 mt-8">
                            {[0, 1].map((e) => (
                              <div
                                key={e}
                                className="w-5 h-5 bg-white rounded-full flex items-center justify-center"
                              >
                                <div className="w-3 h-3 bg-gray-800 rounded-full" />
                              </div>
                            ))}
                          </div>
                          {/* 鼻 */}
                          <div className="w-4 h-3 bg-pink-300 rounded-full mb-2" />
                          {/* 文字 */}
                          <span className="font-display text-white text-4xl font-bold drop-shadow-lg">
                          {mole.phoneme.letter}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Result ─────────────────────────────────────────────────── */}
      {phase === "result" && (
        <div className="flex-1 flex items-center justify-center p-8">
          <motion.div
            className="bg-white rounded-3xl shadow-2xl p-10 max-w-sm w-full text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
          >
            <div className="text-7xl mb-4">
              {score >= 100 ? "🏆" : score >= 50 ? "🎉" : "🐾"}
            </div>
            <h2 className="font-display text-3xl text-green-700 mb-2">
              {lives <= 0 ? "Game Over!" : "Time's Up!"}
            </h2>
            <div className="font-display text-6xl text-purple-600 my-4">
              {score}
            </div>
            <p className="text-gray-400 mb-8 font-bold">points</p>
            <div className="flex gap-3 justify-center">
              <motion.button
                onClick={startGame}
                className="bg-green-500 text-white font-display text-xl px-8 py-3 rounded-full shadow"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Again!
              </motion.button>
              <Link href="/games">
                <motion.button
                  className="bg-gray-100 text-gray-600 font-display text-xl px-8 py-3 rounded-full shadow"
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
