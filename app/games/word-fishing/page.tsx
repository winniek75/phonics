"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { phonemes, Phoneme } from "@/data/phonemes";
import { useProgressStore } from "@/store/progressStore";
import { useAudio } from "@/hooks/useAudio";
import { getSoundEffects } from "@/utils/soundEffects";

// ─── 型 ──────────────────────────────────────────────────────────────────────

interface Fish {
  id: number;
  word: string;
  phoneme: Phoneme;
  isTarget: boolean;
  color: string;
  size: number;
  direction: 1 | -1;   // 1=左→右, -1=右→左
  swimDuration: number; // アニメーション秒数
  laneY: number;        // 縦位置 %（river内）
}

type Phase = "ready" | "playing" | "result";

// ─── 定数 ────────────────────────────────────────────────────────────────────

const TOTAL_ROUNDS = 10;
const FISH_PER_ROUND = 4; // 少なくして大きく

const FISH_COLORS = [
  "#f87171", "#60a5fa", "#4ade80",
  "#facc15", "#c084fc", "#fb923c", "#34d399",
];

// ─── ユーティリティ ───────────────────────────────────────────────────────────

let _fishId = 0;

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getAvailable(completedPhonemes: string[]): Phoneme[] {
  const list = phonemes.filter(
    (p) => completedPhonemes.includes(p.id) || p.group === 1
  );
  return list.length > 0 ? list : phonemes.filter((p) => p.group === 1);
}

function makeFish(
  word: string,
  phoneme: Phoneme,
  isTarget: boolean,
  laneY: number
): Fish {
  const dir = Math.random() < 0.5 ? 1 : -1;
  return {
    id: ++_fishId,
    word,
    phoneme,
    isTarget,
    color: pickRandom(FISH_COLORS),
    size: 90 + Math.floor(Math.random() * 40), // 大きく (90-130)
    direction: dir as 1 | -1,
    swimDuration: 10 + Math.random() * 8, // ゆっくり (10-18秒)
    laneY,
  };
}

// ─── 魚 SVG ──────────────────────────────────────────────────────────────────

function FishShape({
  color,
  size,
  direction,
  label,
}: {
  color: string;
  size: number;
  direction: 1 | -1;
  label: string;
}) {
  const W = size * 1.9;
  const H = size;
  // direction=1 → 右向き(デフォルト), -1 → 左向き（scaleX反転）
  return (
    <div
      style={{
        width: W,
        height: H,
        position: "relative",
        transform: direction === -1 ? "scaleX(-1)" : undefined,
      }}
    >
      <svg viewBox="0 0 95 52" width={W} height={H} style={{ display: "block" }}>
        {/* 尾 */}
        <polygon points="14,10 0,2 0,50 14,40" fill={color} opacity={0.75} />
        {/* 胴体 */}
        <ellipse cx="50" cy="26" rx="35" ry="20" fill={color} />
        {/* 背びれ */}
        <ellipse cx="50" cy="11" rx="14" ry="7" fill={color} opacity={0.65} />
        {/* 目 */}
        <circle cx="73" cy="22" r="4.5" fill="white" />
        <circle cx="74" cy="22" r="2.5" fill="#1e293b" />
        {/* 光沢 */}
        <ellipse cx="45" cy="17" rx="10" ry="5" fill="white" opacity={0.22} />
      </svg>
      {/* 単語ラベル（魚が反転してもテキストは正向きに） */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: direction === -1 ? "scaleX(-1)" : undefined,
          paddingLeft: size * 0.12,
        }}
      >
        <span
          className="font-display text-white drop-shadow-lg select-none font-bold"
          style={{ fontSize: Math.max(20, size * 0.35) }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

// ─── コンポーネント ───────────────────────────────────────────────────────────

export default function WordFishingPage() {
  const { completedPhonemes, updateGameScore, selectedPhonemes, addWrongAnswer } = useProgressStore();
  const { play } = useAudio();
  const soundEffects = getSoundEffects();

  const [phase, setPhase] = useState<Phase>("ready");
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [fish, setFish] = useState<Fish[]>([]);
  const [currentPhoneme, setCurrentPhoneme] = useState<Phoneme | null>(null);
  const [targetWord, setTargetWord] = useState("");
  const [caughtWords, setCaughtWords] = useState<string[]>([]);
  const [poppingId, setPoppingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ ok: boolean; word: string } | null>(null);
  const [roundLocked, setRoundLocked] = useState(false);

  const available = selectedPhonemes && selectedPhonemes.length > 0
    ? phonemes.filter(p => selectedPhonemes.includes(p.id))
    : getAvailable(completedPhonemes);

  const setupRound = useCallback(
    (roundNum: number) => {
      if (roundNum >= TOTAL_ROUNDS) {
        setPhase("result");
        return;
      }
      setRoundLocked(false);
      setFeedback(null);
      setPoppingId(null);

      // ターゲット音素 & 単語を選ぶ
      const ph = pickRandom(available);
      const word = pickRandom(ph.exampleWords);
      setCurrentPhoneme(ph);
      setTargetWord(word);

      // 音声再生（音素 → 単語）
      play(ph.audioFile);
      const wordAudio = ph.wordAudioFiles?.[word];
      if (wordAudio) setTimeout(() => play(wordAudio), 850);

      // デコイを作成（別音素の単語）
      const decoys: { word: string; phoneme: Phoneme }[] = [];
      const decoyPool = available.filter((p) => p.id !== ph.id);
      const decoyCount = FISH_PER_ROUND - 1;
      for (let i = 0; i < decoyCount; i++) {
        const dp = pickRandom(decoyPool.length > 0 ? decoyPool : available);
        decoys.push({ word: pickRandom(dp.exampleWords), phoneme: dp });
      }

      // ランダムな縦位置（重ならないよう分割）
      const lanes = shuffle([15, 32, 50, 68, 85]).slice(0, FISH_PER_ROUND);

      const newFish: Fish[] = shuffle([
        makeFish(word, ph, true, lanes[0]),
        ...decoys.map(({ word: w, phoneme: p }, idx) =>
          makeFish(w, p, false, lanes[idx + 1])
        ),
      ]);
      setFish(newFish);
    },
    [available, play]
  );

  const startGame = () => {
    _fishId = 0;
    setScore(0);
    setCaughtWords([]);
    setRound(0);
    setPhase("playing");
    setupRound(0);
  };

  useEffect(() => {
    if (phase === "result") updateGameScore("wordFishing", score);
  }, [phase, score, updateGameScore]);

  const handleFishTap = (f: Fish) => {
    if (phase !== "playing" || roundLocked) return;
    setRoundLocked(true);
    setPoppingId(f.id);

    if (f.isTarget) {
      soundEffects.playSplash(); // スプラッシュ音を再生
      setScore((s) => s + 10);
      setCaughtWords((prev) => [...prev, f.word]);
      setFeedback({ ok: true, word: f.word });
      const wa = f.phoneme.wordAudioFiles?.[f.word];
      if (wa) play(wa);
    } else {
      soundEffects.playError(); // エラー音を再生
      addWrongAnswer("wordFishing", targetWord, f.word);
      setFeedback({ ok: false, word: f.word });
    }

    setTimeout(() => {
      const nextRound = round + 1;
      setRound(nextRound);
      setupRound(nextRound);
    }, 1700);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 via-sky-300 to-blue-600 flex flex-col overflow-hidden select-none">
      {/* ヘッダー */}
      <header className="flex items-center justify-between px-4 py-3 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <Link href="/games" className="text-blue-900 font-bold text-lg hover:text-blue-950">
          ← Back
        </Link>
        <h1 className="font-display text-2xl text-blue-900">🎣 Word Fishing</h1>
        <div className="font-bold text-blue-800 text-sm">
          {round}/{TOTAL_ROUNDS}
        </div>
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
              animate={{ rotate: [-8, 8, -8] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              🎣
            </motion.div>
            <h2 className="font-display text-3xl text-blue-700 mb-3">
              Word Fishing!
            </h2>
            <p className="text-gray-600 text-base mb-2">
              Listen to the sound, then tap the right fish!
            </p>
            <p className="text-gray-500 text-sm mb-8">
              🐟 Catch {TOTAL_ROUNDS} fish · 10 pts each
            </p>
            <motion.button
              onClick={startGame}
              className="bg-blue-500 hover:bg-blue-600 text-white font-display text-2xl px-12 py-4 rounded-full shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Cast Off!
            </motion.button>
          </motion.div>
        </div>
      )}

      {/* ── Playing ────────────────────────────────────────────────── */}
      {phase === "playing" && (
        <div className="flex-1 flex flex-col relative">
          {/* 空・岸エリア */}
          <div className="h-28 flex flex-col items-center justify-center gap-2 px-4 shrink-0">
            {/* ターゲット表示 */}
            <AnimatePresence mode="wait">
              {currentPhoneme && (
                <motion.button
                  key={round}
                  onClick={() => {
                    play(currentPhoneme.audioFile);
                    const wa = currentPhoneme.wordAudioFiles?.[targetWord];
                    if (wa) setTimeout(() => play(wa), 700);
                  }}
                  className="bg-white/85 backdrop-blur-sm rounded-2xl px-5 py-2 shadow flex items-center gap-3"
                  initial={{ y: -16, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 16, opacity: 0 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-gray-500 font-bold text-sm">Listen & find the</span>
                  <span className="font-display text-3xl text-blue-700">
                    {currentPhoneme.letter}
                  </span>
                  <span className="text-gray-500 font-bold text-sm">word:</span>
                  <span className="font-display text-2xl text-gray-400 bg-gray-200 px-3 py-1 rounded-lg">
                    ???
                  </span>
                  <span className="text-xl animate-pulse">🔊</span>
                </motion.button>
              )}
            </AnimatePresence>

            {/* スコア */}
            <div className="text-white font-bold text-sm">
              Score: {score} &nbsp;|&nbsp; 🪣 {caughtWords.length} caught
            </div>
          </div>

          {/* フィードバック */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                className={`absolute top-32 left-1/2 -translate-x-1/2 z-30 font-display text-lg px-6 py-2 rounded-full shadow-lg whitespace-nowrap ${
                  feedback.ok
                    ? "bg-green-400 text-white"
                    : "bg-red-400 text-white"
                }`}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                {feedback.ok
                  ? `✅ "${feedback.word}" — nice catch!`
                  : `❌ That was "${feedback.word}"!`}
              </motion.div>
            )}
          </AnimatePresence>

          {/* 川エリア */}
          <div
            className="flex-1 relative overflow-hidden"
            style={{
              background:
                "linear-gradient(180deg,#38bdf8 0%,#0ea5e9 40%,#0369a1 100%)",
            }}
          >
            {/* さざ波 */}
            {[18, 42, 65].map((y) => (
              <motion.div
                key={y}
                className="absolute left-0 right-0 h-px bg-white/30"
                style={{ top: `${y}%` }}
                animate={{ x: ["-5%", "5%", "-5%"] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              />
            ))}

            {/* 魚 */}
            <AnimatePresence>
              {fish.map((f) => {
                const fromX = f.direction === 1 ? "-18%" : "110%";
                const toX = f.direction === 1 ? "110%" : "-18%";
                const isPopping = poppingId === f.id;

                return (
                  <motion.button
                    key={f.id}
                    onClick={() => handleFishTap(f)}
                    className="absolute"
                    style={{ top: `${f.laneY}%`, left: 0, right: 0 }}
                    initial={{ x: fromX, opacity: 0 }}
                    animate={
                      isPopping
                        ? { scale: [1, 1.35, 0], opacity: [1, 1, 0] }
                        : { x: toX, opacity: 1 }
                    }
                    transition={
                      isPopping
                        ? { duration: 0.38, ease: "easeOut" }
                        : {
                            x: {
                              duration: f.swimDuration,
                              ease: "linear",
                              repeat: Infinity,
                            },
                            opacity: { duration: 0.3 },
                          }
                    }
                    exit={{ opacity: 0, scale: 0, transition: { duration: 0.2 } }}
                    whileHover={isPopping ? {} : { scale: 1.08 }}
                    aria-label={`Fish: ${f.word}`}
                  >
                    <FishShape
                      color={f.color}
                      size={f.size}
                      direction={f.direction}
                      label={f.word}
                    />
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>

          {/* バケツ */}
          <div className="h-12 bg-amber-800 flex items-center px-4 gap-2 shrink-0">
            <span className="text-2xl">🪣</span>
            <div className="flex gap-2 overflow-x-auto py-1">
              {caughtWords.map((w, i) => (
                <motion.span
                  key={i}
                  className="text-xs font-bold text-white bg-white/25 rounded px-2 py-0.5 whitespace-nowrap"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  {w}
                </motion.span>
              ))}
            </div>
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
            <div className="text-7xl mb-4">🏆</div>
            <h2 className="font-display text-3xl text-blue-700 mb-4">
              Great Fishing!
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 rounded-2xl p-4">
                <div className="font-display text-4xl text-blue-600">{score}</div>
                <div className="text-sm text-gray-500 font-bold">Score</div>
              </div>
              <div className="bg-green-50 rounded-2xl p-4">
                <div className="font-display text-4xl text-green-600">
                  {caughtWords.length}
                </div>
                <div className="text-sm text-gray-500 font-bold">Caught</div>
              </div>
            </div>
            {/* 釣った単語 */}
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {caughtWords.map((w, i) => (
                <span
                  key={i}
                  className="bg-blue-100 text-blue-700 font-bold text-sm px-3 py-1 rounded-full"
                >
                  {w}
                </span>
              ))}
            </div>
            <div className="flex gap-3 justify-center">
              <motion.button
                onClick={startGame}
                className="bg-blue-500 text-white font-display text-xl px-8 py-3 rounded-full shadow"
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
