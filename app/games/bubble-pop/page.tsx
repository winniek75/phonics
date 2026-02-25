"use client";
import { motion } from "framer-motion";
import Link from "next/link";

const games = [
  // ── 既存 ──────────────────────────────────────────────────────────────
  {
    id: "blending",
    title: "Blending",
    emoji: "🎵",
    description: "Listen to sounds and blend them into words!",
    color: "#EF4444",
    bg: "from-red-400 to-red-600",
  },
  {
    id: "segmenting",
    title: "Segmenting",
    emoji: "🧩",
    description: "Break words apart into their sounds!",
    color: "#F97316",
    bg: "from-orange-400 to-orange-600",
  },
  {
    id: "tricky-words",
    title: "Tricky Words",
    emoji: "🌟",
    description: "Read tricky words that can't be sounded out!",
    color: "#22C55E",
    bg: "from-green-400 to-green-600",
  },
  {
    id: "letter-match",
    title: "Letter Match",
    emoji: "🔤",
    description: "Match sounds to their letters!",
    color: "#3B82F6",
    bg: "from-blue-400 to-blue-600",
  },
  // ── 新規追加 ──────────────────────────────────────────────────────────
  {
    id: "bubble-pop",
    title: "Bubble Pop",
    emoji: "🫧",
    description: "Pop the bubbles with the right letter — fast!",
    color: "#06B6D4",
    bg: "from-cyan-400 to-sky-600",
  },
  {
    id: "whack-a-mole",
    title: "Whack-a-Mole",
    emoji: "🐾",
    description: "Whack the mole showing the right sound!",
    color: "#84CC16",
    bg: "from-lime-400 to-green-600",
  },
  {
    id: "word-fishing",
    title: "Word Fishing",
    emoji: "🎣",
    description: "Cast your line and catch the right word fish!",
    color: "#0EA5E9",
    bg: "from-sky-400 to-blue-700",
  },
  {
    id: "memory-match",
    title: "Memory Match",
    emoji: "🃏",
    description: "Flip cards to match letters with their sounds!",
    color: "#A855F7",
    bg: "from-purple-400 to-violet-700",
  },
];

export default function GamesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <Link
          href="/"
          className="text-green-700 font-bold hover:text-green-900 flex items-center gap-1"
        >
          ← <span className="hidden sm:inline">Garden</span>
        </Link>
        <h1 className="font-display text-2xl text-purple-700">🎮 Games</h1>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 pb-24">
        <motion.h2
          className="font-display text-4xl text-center text-purple-800 mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          Choose a Game!
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {games.map((game, i) => (
            <motion.div
              key={game.id}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.07 }}
            >
              <Link href={`/games/${game.id}`}>
                <motion.div
                  className={`bg-gradient-to-br ${game.bg} rounded-3xl p-6 shadow-xl cursor-pointer text-white h-full`}
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-6xl mb-4">{game.emoji}</div>
                  <h3 className="font-display text-3xl mb-2">{game.title}</h3>
                  <p className="text-white/90 font-semibold text-lg mb-6">
                    {game.description}
                  </p>
                  <div className="inline-flex items-center gap-2 bg-white/25 rounded-2xl px-5 py-3 font-bold text-lg">
                    ▶ Play!
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-green-200 flex justify-around items-center py-2 px-4 z-20">
        <Link
          href="/"
          className="flex flex-col items-center gap-1 text-gray-500 hover:text-green-700"
        >
          <span className="text-2xl">🏡</span>
          <span className="text-xs font-bold">Home</span>
        </Link>
        <Link
          href="/games"
          className="flex flex-col items-center gap-1 text-purple-600"
        >
          <span className="text-2xl">🎮</span>
          <span className="text-xs font-bold">Games</span>
        </Link>
        <Link
          href="/progress"
          className="flex flex-col items-center gap-1 text-gray-500 hover:text-yellow-600"
        >
          <span className="text-2xl">⭐</span>
          <span className="text-xs font-bold">Progress</span>
        </Link>
      </nav>
    </div>
  );
}
