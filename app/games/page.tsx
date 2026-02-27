"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { phonemes, groupColors } from "@/data/phonemes";
import { useProgressStore } from "@/store/progressStore";

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
  const [showCharacterSelection, setShowCharacterSelection] = useState(false);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const { selectedPhonemes, setSelectedPhonemes } = useProgressStore();
  const [tempSelectedPhonemes, setTempSelectedPhonemes] = useState<string[]>(selectedPhonemes || []);

  const handleGameClick = (gameId: string) => {
    setSelectedGame(gameId);
    setShowCharacterSelection(true);
  };

  const handleStartGame = () => {
    if (tempSelectedPhonemes.length === 0) {
      alert("少なくとも1つの文字を選択してください！");
      return;
    }
    setSelectedPhonemes(tempSelectedPhonemes);
    if (selectedGame) {
      window.location.href = `/games/${selectedGame}`;
    }
  };

  const togglePhoneme = (phonemeId: string) => {
    setTempSelectedPhonemes(prev =>
      prev.includes(phonemeId)
        ? prev.filter(id => id !== phonemeId)
        : [...prev, phonemeId]
    );
  };

  const selectAll = () => {
    setTempSelectedPhonemes(phonemes.map(p => p.id));
  };

  const selectNone = () => {
    setTempSelectedPhonemes([]);
  };

  const selectGroup = (group: number) => {
    const groupPhonemes = phonemes.filter(p => p.group === group).map(p => p.id);
    const hasAll = groupPhonemes.every(id => tempSelectedPhonemes.includes(id));
    if (hasAll) {
      setTempSelectedPhonemes(prev => prev.filter(id => !groupPhonemes.includes(id)));
    } else {
      setTempSelectedPhonemes(prev => {
        const combined = [...prev, ...groupPhonemes];
        return combined.filter((id, index) => combined.indexOf(id) === index);
      });
    }
  };

  if (showCharacterSelection) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-100 to-indigo-100">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm shadow-sm px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
          <button
            onClick={() => setShowCharacterSelection(false)}
            className="text-purple-700 font-bold hover:text-purple-900 flex items-center gap-1"
          >
            ← <span className="hidden sm:inline">Back</span>
          </button>
          <h1 className="font-display text-2xl text-purple-700">文字を選択</h1>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-6 pb-32">
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
            <h2 className="font-display text-2xl mb-4 text-purple-800">
              練習する文字を選んでください
            </h2>
            <p className="text-gray-600 mb-4">
              選択された文字: {tempSelectedPhonemes.length} / {phonemes.length}
            </p>

            {/* Quick selection buttons */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={selectAll}
                className="px-4 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600"
              >
                すべて選択
              </button>
              <button
                onClick={selectNone}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg font-bold hover:bg-gray-600"
              >
                選択解除
              </button>
              {[1, 2, 3, 4, 5, 6, 7].map(group => (
                <button
                  key={group}
                  onClick={() => selectGroup(group)}
                  className="px-4 py-2 rounded-lg font-bold text-white transition-colors"
                  style={{ backgroundColor: groupColors[group] }}
                >
                  Group {group}
                </button>
              ))}
            </div>

            {/* Phoneme grid by groups */}
            {[1, 2, 3, 4, 5, 6, 7].map(group => (
              <div key={group} className="mb-6">
                <h3
                  className="font-bold text-lg mb-3 text-white px-3 py-1 rounded-lg inline-block"
                  style={{ backgroundColor: groupColors[group] }}
                >
                  Group {group}
                </h3>
                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                  {phonemes.filter(p => p.group === group).map(phoneme => (
                    <button
                      key={phoneme.id}
                      onClick={() => togglePhoneme(phoneme.id)}
                      className={`
                        aspect-square rounded-lg font-bold text-2xl transition-all
                        ${tempSelectedPhonemes.includes(phoneme.id)
                          ? 'ring-4 ring-offset-2'
                          : 'opacity-50 hover:opacity-75'
                        }
                      `}
                      style={{
                        backgroundColor: tempSelectedPhonemes.includes(phoneme.id)
                          ? groupColors[group]
                          : '#e5e7eb',
                        color: tempSelectedPhonemes.includes(phoneme.id) ? 'white' : '#6b7280',
                        borderColor: groupColors[group],
                        borderWidth: '2px',
                        borderStyle: 'solid'
                      }}
                    >
                      {phoneme.letter}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Start Game Button */}
          <button
            onClick={handleStartGame}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-2xl font-display text-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            ゲームを開始！ 🎮
          </button>
        </main>
      </div>
    );
  }

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
              <button onClick={() => handleGameClick(game.id)} className="w-full text-left">
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
              </button>
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