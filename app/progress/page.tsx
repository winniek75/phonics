"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { phonemes, groupColors, getPhonemesByGroup } from "@/data/phonemes";
import { trickyWords } from "@/data/trickyWords";
import { useProgressStore } from "@/store/progressStore";

const AVATARS = ["🌟", "🦁", "🐸", "🦋", "🐙", "🦕", "🐬", "🦊", "🎠", "🌈"];

export default function ProgressPage() {
  const {
    completedPhonemes,
    gameScores,
    masteredTrickyWords,
    profileName,
    profileAvatarId,
    setProfile,
    resetProgress,
  } = useProgressStore();

  const [showReset, setShowReset] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(profileName);

  const totalPhonemes = phonemes.length;
  const totalTricky = trickyWords.length;
  const progressPct = Math.round((completedPhonemes.length / totalPhonemes) * 100);

  const handleSaveName = () => {
    if (newName.trim()) {
      setProfile(newName.trim(), profileAvatarId);
    }
    setEditingName(false);
  };

  const handleResetConfirm = () => {
    resetProgress();
    setShowReset(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-amber-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <Link href="/" className="text-green-700 font-bold hover:text-green-900 flex items-center gap-1">
          ← Garden
        </Link>
        <h1 className="font-display text-2xl text-yellow-700">⭐ Progress</h1>
        <div />
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
        {/* Profile Section */}
        <motion.section
          className="bg-white rounded-3xl shadow-xl p-6 mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h2 className="font-display text-xl text-gray-600 mb-4">👤 My Profile</h2>
          {/* Avatar selection */}
          <div className="flex flex-wrap gap-2 mb-4">
            {AVATARS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => setProfile(profileName, emoji)}
                className={`text-3xl p-2 rounded-xl transition-all ${
                  profileAvatarId === emoji ? "bg-yellow-200 scale-110" : "hover:bg-gray-100"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
          {editingName ? (
            <div className="flex gap-2">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="flex-1 border-2 border-yellow-300 rounded-xl px-4 py-2 font-bold text-lg focus:outline-none focus:border-yellow-500"
                onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                autoFocus
              />
              <button onClick={handleSaveName}
                className="px-4 py-2 bg-yellow-400 text-yellow-900 rounded-xl font-bold hover:bg-yellow-500">
                Save
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-4xl">{profileAvatarId}</span>
              <span className="font-display text-2xl text-gray-700">{profileName}</span>
              <button onClick={() => setEditingName(true)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold ml-2">
                ✏️ Edit
              </button>
            </div>
          )}
        </motion.section>

        {/* Overall Progress */}
        <motion.section
          className="bg-white rounded-3xl shadow-xl p-6 mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="font-display text-xl text-gray-600 mb-4">📊 Phonemes Learned</h2>
          <div className="flex items-center gap-4 mb-3">
            <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
              <motion.div
                className="h-full bg-green-500 rounded-full flex items-center justify-end pr-2"
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                {progressPct > 10 && <span className="text-white text-xs font-bold">{progressPct}%</span>}
              </motion.div>
            </div>
            <span className="font-display text-2xl text-green-600 whitespace-nowrap">
              {completedPhonemes.length} / {totalPhonemes}
            </span>
          </div>

          {/* Group breakdown */}
          <div className="grid grid-cols-7 gap-1 mt-4">
            {[1, 2, 3, 4, 5, 6, 7].map((g) => {
              const groupPhonemes = getPhonemesByGroup(g);
              const done = groupPhonemes.filter((p) => completedPhonemes.includes(p.id)).length;
              const pct = Math.round((done / groupPhonemes.length) * 100);
              return (
                <div key={g} className="flex flex-col items-center gap-1">
                  <div className="relative w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: groupColors[g] + "33", border: `2px solid ${groupColors[g]}` }}>
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 40 40">
                      <circle cx="20" cy="20" r="16" fill="none" stroke={groupColors[g]} strokeWidth="4"
                        strokeDasharray={`${pct} ${100 - pct}`}
                        strokeDashoffset="0"
                        pathLength="100"
                      />
                    </svg>
                    <span className="text-xs font-bold" style={{ color: groupColors[g] }}>G{g}</span>
                  </div>
                  <span className="text-xs text-gray-500">{done}/{groupPhonemes.length}</span>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* Tricky Words */}
        <motion.section
          className="bg-white rounded-3xl shadow-xl p-6 mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="font-display text-xl text-gray-600 mb-4">🌟 Tricky Words Mastered</h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
              <motion.div
                className="h-full bg-yellow-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(masteredTrickyWords.length / totalTricky) * 100}%` }}
                transition={{ duration: 1 }}
              />
            </div>
            <span className="font-display text-2xl text-yellow-600">
              {masteredTrickyWords.length} / {totalTricky}
            </span>
          </div>
          {masteredTrickyWords.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {masteredTrickyWords.map((word) => (
                <span key={word} className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-bold">
                  {word}
                </span>
              ))}
            </div>
          )}
        </motion.section>

        {/* Game Scores */}
        <motion.section
          className="bg-white rounded-3xl shadow-xl p-6 mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="font-display text-xl text-gray-600 mb-4">🎮 Best Game Scores</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: "blending", label: "Blending", emoji: "🎵", color: "#EF4444" },
              { key: "segmenting", label: "Segmenting", emoji: "🧩", color: "#F97316" },
              { key: "trickyWords", label: "Tricky Words", emoji: "🌟", color: "#22C55E" },
              { key: "letterMatch", label: "Letter Match", emoji: "🔤", color: "#3B82F6" },
            ].map(({ key, label, emoji, color }) => (
              <div key={key} className="p-4 rounded-2xl border-2 text-center" style={{ borderColor: color + "44", backgroundColor: color + "11" }}>
                <div className="text-3xl mb-1">{emoji}</div>
                <div className="font-bold text-gray-600 text-sm">{label}</div>
                <div className="font-display text-3xl" style={{ color }}>
                  {gameScores[key as keyof typeof gameScores]}/10
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Reset */}
        <motion.section
          className="text-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <button
            onClick={() => setShowReset(true)}
            className="px-6 py-3 text-red-500 border-2 border-red-200 rounded-2xl font-bold hover:bg-red-50 transition-colors"
          >
            🗑️ Reset Progress
          </button>
        </motion.section>
      </main>

      {/* Reset confirmation dialog */}
      <AnimatePresence>
        {showReset && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl"
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
            >
              <div className="text-5xl text-center mb-4">⚠️</div>
              <h3 className="font-display text-2xl text-gray-800 text-center mb-3">Reset All Progress?</h3>
              <p className="text-gray-600 text-center mb-6">This will erase all your learning progress, scores, and mastered words.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowReset(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <button onClick={handleResetConfirm}
                  className="flex-1 py-3 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-colors">
                  Yes, Reset
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-green-200 flex justify-around items-center py-2 px-4 z-20">
        <Link href="/" className="flex flex-col items-center gap-1 text-gray-500 hover:text-green-700">
          <span className="text-2xl">🏡</span>
          <span className="text-xs font-bold">Home</span>
        </Link>
        <Link href="/games" className="flex flex-col items-center gap-1 text-gray-500 hover:text-purple-600">
          <span className="text-2xl">🎮</span>
          <span className="text-xs font-bold">Games</span>
        </Link>
        <Link href="/progress" className="flex flex-col items-center gap-1 text-yellow-600">
          <span className="text-2xl">⭐</span>
          <span className="text-xs font-bold">Progress</span>
        </Link>
      </nav>
    </div>
  );
}
