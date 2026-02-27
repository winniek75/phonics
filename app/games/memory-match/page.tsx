"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { phonemes, Phoneme } from "@/data/phonemes";
import { useProgressStore } from "@/store/progressStore";
import { useAudio } from "@/hooks/useAudio";

// ─── 型 ──────────────────────────────────────────────────────────────────────

type Difficulty = "easy" | "medium" | "hard";

interface CardData {
  id: number;
  pairKey: string;   // ペア識別キー（2枚が同じ値）
  type: "letter" | "word"; // letter カード / word（絵文字）カード
  display: string;   // 画面に表示する内容
  phoneme: Phoneme;
  groupColor: string;
}

type Phase = "menu" | "playing" | "result";

// ─── 定数 ────────────────────────────────────────────────────────────────────

const DIFFICULTY: Record<Difficulty, { cols: number; rows: number; label: string }> = {
  easy:   { cols: 3, rows: 2, label: "3×2 — Easy" },    // 6枚（3ペア）
  medium: { cols: 4, rows: 3, label: "4×3 — Medium" },  // 12枚（6ペア）
  hard:   { cols: 4, rows: 4, label: "4×4 — Hard" },    // 16枚（8ペア）
};

const GROUP_COLORS: Record<number, string> = {
  1: "#EF4444", 2: "#F97316", 3: "#EAB308",
  4: "#22C55E", 5: "#3B82F6", 6: "#A855F7", 7: "#EC4899",
};

// 単語 → 絵文字（完全一致しないものは ❓ フォールバック）
const EMOJI: Record<string, string> = {
  sun:"☀️", sat:"🧘", sock:"🧦", snake:"🐍",
  ant:"🐜", apple:"🍎", at:"🔤", ask:"🙋",
  top:"🔝", tap:"🚰", tin:"🥫", ten:"🔟",
  pig:"🐷", pin:"📌", pan:"🍳", pit:"🕳️",
  net:"🎣", nap:"😴", nut:"🥜", nod:"😌",
  dog:"🐕", dig:"⛏️", den:"🏠", dot:"⚫",
  egg:"🥚", elf:"🧝", end:"🔚",
  hen:"🐔", hat:"🎩", hop:"🦘", hot:"🔥",
  rat:"🐀", rip:"😭", red:"🔴", run:"🏃",
  mug:"☕", mat:"🛏️", map:"🗺️", mud:"🟫",
  cat:"🐱", cup:"🥤", cap:"🧢", cot:"🛏️",
  fog:"🌫️", fan:"💨", fin:"🐟", fit:"💪",
  bug:"🐛", bat:"🦇", bed:"🛏️", big:"⬆️",
  log:"🪵", lip:"💋", leg:"🦵", lid:"🫙",
  gem:"💎", got:"✅", gun:"🔫", gap:"⬜",
  oak:"🌳", oil:"🛢️", owl:"🦉", odd:"🔢",
  zip:"🤐", zoo:"🦁", zap:"⚡",
  web:"🕸️", wig:"👱", win:"🏆", wet:"💧",
  van:"🚐", vet:"👩‍⚕️", vow:"🙏",
  quiz:"❓", queen:"👑",
  out:"⬆️", our:"🏠",
  blue:"🔵", clue:"🔍", due:"📅", glue:"🫙",
  her:"👩", bird:"🐦", fern:"🌿",
  farm:"🚜", car:"🚗", star:"⭐",
  chip:"🍟", chin:"🫶", chat:"💬",
  ship:"🚢", shop:"🛍️", shed:"🛖",
  thin:"🪡", that:"👈", thumb:"👍",
  ring:"💍", sing:"🎵", king:"👑", wing:"🪽",
  foot:"🦶", moon:"🌙", pool:"🏊", cool:"❄️",
  book:"📚", cook:"🧑‍🍳", hook:"🪝", look:"👀",
  jam:"🍓", jet:"✈️", jot:"📝",
  mix:"🧪", fox:"🦊", box:"📦",
  yes:"✅", yam:"🍠", yell:"📣",
};

// ─── ユーティリティ ───────────────────────────────────────────────────────────

let _cardId = 0;

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

function buildDeck(diff: Difficulty, available: Phoneme[]): CardData[] {
  const { cols, rows } = DIFFICULTY[diff];
  const pairCount = (cols * rows) / 2;

  // 音素をランダムに選ぶ（重複なし）
  const selected = shuffle(available).slice(0, pairCount);

  const cards: CardData[] = [];
  selected.forEach((ph) => {
    const word = pickRandom(ph.exampleWords);
    const emoji = EMOJI[word] ?? "❓";
    const color = GROUP_COLORS[ph.group];

    // letter カード
    cards.push({
      id: ++_cardId,
      pairKey: ph.id,
      type: "letter",
      display: ph.letter,
      phoneme: ph,
      groupColor: color,
    });
    // word（絵文字）カード
    cards.push({
      id: ++_cardId,
      pairKey: ph.id,
      type: "word",
      display: emoji,
      phoneme: ph,
      groupColor: color,
    });
  });

  return shuffle(cards);
}

// ─── コンポーネント ───────────────────────────────────────────────────────────

export default function MemoryMatchPage() {
  const { completedPhonemes, updateGameScore, selectedPhonemes } = useProgressStore();
  const { play } = useAudio();

  const [phase, setPhase] = useState<Phase>("menu");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [deck, setDeck] = useState<CardData[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);   // 現在表向きの id
  const [matched, setMatched] = useState<string[]>([]);   // マッチ済み pairKey
  const [moves, setMoves] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [locked, setLocked] = useState(false);

  const available = selectedPhonemes && selectedPhonemes.length > 0
    ? phonemes.filter(p => selectedPhonemes.includes(p.id))
    : getAvailable(completedPhonemes);

  // ゲーム開始
  const startGame = useCallback(
    (diff: Difficulty) => {
      _cardId = 0;
      setDeck(buildDeck(diff, available));
      setFlipped([]);
      setMatched([]);
      setMoves(0);
      setLocked(false);
      setElapsedSec(0);
      setStartTime(Date.now());
      setPhase("playing");
    },
    [available]
  );

  // タイマー
  useEffect(() => {
    if (phase !== "playing") return;
    const id = setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [phase, startTime]);

  // 全ペア完成チェック
  useEffect(() => {
    if (phase !== "playing" || deck.length === 0) return;
    const pairCount = deck.length / 2;
    if (matched.length === pairCount) {
      const score = Math.max(
        10,
        Math.floor(1000 / (moves + elapsedSec / 5))
      );
      updateGameScore("memoryMatch", score);
      setPhase("result");
    }
  }, [matched, deck.length, moves, elapsedSec, phase, updateGameScore]);

  // カードタップ
  const handleFlip = (card: CardData) => {
    if (locked) return;
    if (flipped.includes(card.id)) return;
    if (matched.includes(card.pairKey)) return;

    // 音声再生
    play(card.phoneme.audioFile);

    const newFlipped = [...flipped, card.id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      setLocked(true);

      const [idA, idB] = newFlipped;
      const cardA = deck.find((c) => c.id === idA)!;
      const cardB = deck.find((c) => c.id === idB)!;

      if (cardA.pairKey === cardB.pairKey) {
        // マッチ！
        setTimeout(() => {
          setMatched((prev) => [...prev, cardA.pairKey]);
          setFlipped([]);
          setLocked(false);
        }, 600);
      } else {
        // ミス → 裏返す
        setTimeout(() => {
          setFlipped([]);
          setLocked(false);
        }, 1100);
      }
    }
  };

  const { cols, rows } = DIFFICULTY[difficulty];

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const totalPairs = deck.length / 2;
  const pairsLeft = totalPairs - matched.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 via-purple-50 to-pink-100 flex flex-col select-none">
      {/* ヘッダー */}
      <header className="flex items-center justify-between px-4 py-3 bg-white/60 backdrop-blur-sm sticky top-0 z-10">
        <Link href="/games" className="text-purple-700 font-bold text-lg hover:text-purple-900">
          ← Back
        </Link>
        <h1 className="font-display text-2xl text-purple-800">🃏 Memory Match</h1>
        <div className="w-16" />
      </header>

      {/* ── Menu ───────────────────────────────────────────────────── */}
      {phase === "menu" && (
        <div className="flex-1 flex items-center justify-center p-8">
          <motion.div
            className="bg-white rounded-3xl shadow-2xl p-10 max-w-sm w-full text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
          >
            <motion.div
              className="text-8xl mb-4"
              animate={{ rotateY: [0, 180, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              🃏
            </motion.div>
            <h2 className="font-display text-3xl text-purple-700 mb-3">
              Memory Match!
            </h2>
            <p className="text-gray-600 text-base mb-6">
              Flip cards to match letters with their sounds and words!
            </p>

            {/* 難易度選択 */}
            <div className="mb-6">
              <p className="text-gray-500 font-bold text-sm mb-3 uppercase tracking-wide">
                Difficulty
              </p>
              <div className="flex flex-col gap-2">
                {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`w-full py-3 rounded-2xl font-display text-lg transition-all ${
                      difficulty === d
                        ? "bg-purple-500 text-white shadow-lg scale-105"
                        : "bg-purple-50 text-purple-600 hover:bg-purple-100"
                    }`}
                  >
                    {DIFFICULTY[d].label}
                  </button>
                ))}
              </div>
            </div>

            <motion.button
              onClick={() => startGame(difficulty)}
              className="bg-purple-500 hover:bg-purple-600 text-white font-display text-2xl px-12 py-4 rounded-full shadow-lg"
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
        <div className="flex-1 flex flex-col items-center gap-3 p-3">
          {/* HUD */}
          <div className="w-full max-w-2xl flex items-center justify-between bg-white/70 rounded-2xl px-4 py-2 shadow text-sm font-bold">
            <span className="text-purple-600">⏱ {formatTime(elapsedSec)}</span>
            <span className="text-gray-600">
              🃏 {matched.length}/{totalPairs} matched
            </span>
            <span className="text-indigo-600">👆 {moves} moves</span>
          </div>

          {/* カードグリッド */}
          <div
            className="w-full max-w-2xl grid gap-2 flex-1 content-center"
            style={{
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gridTemplateRows: `repeat(${rows}, 1fr)`,
            }}
          >
            {deck.map((card) => {
              const isFlipped =
                flipped.includes(card.id) || matched.includes(card.pairKey);
              const isMatched = matched.includes(card.pairKey);

              return (
                <motion.button
                  key={card.id}
                  onClick={() => handleFlip(card)}
                  className="relative aspect-[3/4] rounded-2xl cursor-pointer"
                  style={{ perspective: 600 }}
                  whileHover={!isFlipped ? { scale: 1.05 } : {}}
                  whileTap={!isFlipped ? { scale: 0.97 } : {}}
                  aria-label="Memory card"
                >
                  {/* 裏面 */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center shadow-md border-2 border-white"
                    animate={{ rotateY: isFlipped ? 90 : 0 }}
                    transition={{ duration: 0.18 }}
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <span className="text-white text-3xl">★</span>
                  </motion.div>

                  {/* 表面 */}
                  <motion.div
                    className={`absolute inset-0 rounded-2xl flex flex-col items-center justify-center shadow-md border-4 ${
                      isMatched ? "border-green-400 opacity-70" : "border-white"
                    }`}
                    style={{
                      backgroundColor: card.groupColor + "22",
                      borderColor: isMatched ? "#4ade80" : card.groupColor,
                    }}
                    initial={{ rotateY: -90 }}
                    animate={{ rotateY: isFlipped ? 0 : -90 }}
                    transition={{ duration: 0.18, delay: isFlipped ? 0.16 : 0 }}
                  >
                    {card.type === "letter" ? (
                      <>
                        <span
                          className="font-display text-3xl sm:text-4xl font-bold"
                          style={{ color: card.groupColor }}
                        >
                          {card.display}
                        </span>
                        <span
                          className="text-xs font-bold mt-1 opacity-60"
                          style={{ color: card.groupColor }}
                        >
                          {card.phoneme.sound}
                        </span>
                      </>
                    ) : (
                      <span className="text-3xl sm:text-4xl">{card.display}</span>
                    )}
                    {isMatched && (
                      <motion.span
                        className="absolute top-1 right-1 text-green-500 text-lg"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        ✓
                      </motion.span>
                    )}
                  </motion.div>
                </motion.button>
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
            <motion.div
              className="text-7xl mb-4"
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              🎉
            </motion.div>
            <h2 className="font-display text-3xl text-purple-700 mb-6">
              You did it!
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-purple-50 rounded-2xl p-4">
                <div className="font-display text-3xl text-purple-600">
                  {formatTime(elapsedSec)}
                </div>
                <div className="text-sm text-gray-500 font-bold">Time</div>
              </div>
              <div className="bg-indigo-50 rounded-2xl p-4">
                <div className="font-display text-3xl text-indigo-600">
                  {moves}
                </div>
                <div className="text-sm text-gray-500 font-bold">Moves</div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex gap-2 justify-center">
                {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
                  <motion.button
                    key={d}
                    onClick={() => {
                      setDifficulty(d);
                      startGame(d);
                    }}
                    className={`font-display text-base px-4 py-2 rounded-full shadow ${
                      d === difficulty
                        ? "bg-purple-500 text-white"
                        : "bg-purple-100 text-purple-600"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </motion.button>
                ))}
              </div>
              <Link href="/games">
                <motion.button
                  className="w-full bg-gray-100 text-gray-600 font-display text-xl px-8 py-3 rounded-full shadow"
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
