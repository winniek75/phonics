"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { phonemes, groupColors, getPhonemeById } from "@/data/phonemes";
import { useAudio } from "@/hooks/useAudio";
import { useProgressStore } from "@/store/progressStore";
import LetterAnimation from "@/components/LetterAnimation/LetterAnimation";

export default function PhonemePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const phoneme = getPhonemeById(id);
  const { play } = useAudio();
  const { completedPhonemes, markPhonemeComplete } = useProgressStore();
  const [showAnimation, setShowAnimation] = useState(false);
  const [celebrated, setCelebrated] = useState(false);

  useEffect(() => {
    if (phoneme && !completedPhonemes.includes(phoneme.id)) {
      const timer = setTimeout(() => {
        markPhonemeComplete(phoneme.id);
        setCelebrated(true);
        setTimeout(() => setCelebrated(false), 2000);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [phoneme?.id]);

  if (!phoneme) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-600">Phoneme not found</p>
          <Link href="/" className="mt-4 inline-block text-green-600 font-bold">← Back to Garden</Link>
        </div>
      </div>
    );
  }

  const color = groupColors[phoneme.group];
  const allPhonemes = phonemes;
  const currentIndex = allPhonemes.findIndex((p) => p.id === id);
  const prevPhoneme = currentIndex > 0 ? allPhonemes[currentIndex - 1] : null;
  const nextPhoneme = currentIndex < allPhonemes.length - 1 ? allPhonemes[currentIndex + 1] : null;
  const isCompleted = completedPhonemes.includes(phoneme.id);

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(135deg, ${color}22 0%, #f0fdf4 100%)` }}>
      {/* Celebration */}
      <AnimatePresence>
        {celebrated && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-yellow-400 text-yellow-900 font-display px-6 py-3 rounded-full text-xl shadow-xl"
          >
            🌟 Phoneme learned! Great job!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <Link href="/" className="flex items-center gap-2 text-green-700 font-bold hover:text-green-900 transition-colors">
          <span className="text-xl">←</span>
          <span className="hidden sm:inline">Back to Garden</span>
        </Link>
        <div className="flex items-center gap-2">
          <span
            className="px-3 py-1 rounded-full text-white text-sm font-bold"
            style={{ backgroundColor: color }}
          >
            Group {phoneme.group}
          </span>
          {isCompleted && (
            <span className="text-yellow-500 text-xl">⭐</span>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
        {/* Big Letter Display */}
        <motion.div
          className="text-center mb-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <motion.button
            onClick={() => play(phoneme.audioFile)}
            className="text-9xl font-display cursor-pointer inline-block select-none"
            style={{ color }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {phoneme.letter}
          </motion.button>
          <p className="text-2xl text-gray-500 font-semibold mt-2">{phoneme.sound} sound</p>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center mb-8">
          <motion.button
            onClick={() => play(phoneme.audioFile)}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-bold text-lg shadow-lg"
            style={{ backgroundColor: color }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🔊 Hear Sound
          </motion.button>
          <motion.button
            onClick={() => setShowAnimation(!showAnimation)}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-lg shadow-lg bg-white border-2"
            style={{ borderColor: color, color }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ✏️ Write It
          </motion.button>
        </div>

        {/* Letter Animation */}
        <AnimatePresence>
          {showAnimation && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-8 overflow-hidden"
            >
              <div className="flex justify-center p-4 bg-white rounded-3xl shadow-md">
                <LetterAnimation
                  pathId={phoneme.svgPathId}
                  groupNum={phoneme.group}
                  size={180}
                  autoPlay={true}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Example Words */}
        <motion.section
          className="mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="font-display text-2xl mb-4 text-gray-700">📚 Example Words</h2>
          <div className="grid grid-cols-2 gap-3">
            {phoneme.exampleWords.map((word, i) => (
              <motion.button
                key={word}
                onClick={() => play(phoneme.wordAudioFiles[word] || `/audio/words/${word}.mp3`)}
                className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-md font-bold text-lg border-2 hover:shadow-lg transition-all"
                style={{ borderColor: color, color: "#374151" }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                initial={{ x: i % 2 === 0 ? -20 : 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <span className="text-2xl">🔊</span>
                <span className="font-display text-xl">{word}</span>
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* Story */}
        <motion.section
          className="mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="font-display text-2xl mb-4 text-gray-700">📖 Story</h2>
          <div
            className="p-5 rounded-3xl text-white text-lg font-semibold leading-relaxed shadow-md"
            style={{ backgroundColor: color }}
          >
            {phoneme.storyText}
          </div>
        </motion.section>

        {/* Action */}
        <motion.section
          className="mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="font-display text-2xl mb-4 text-gray-700">🤸 Action</h2>
          <div className="flex items-center gap-4 p-5 bg-white rounded-3xl shadow-md border-2"
            style={{ borderColor: color }}>
            <span className="text-5xl">{phoneme.actionEmoji}</span>
            <p className="text-lg font-semibold text-gray-700">{phoneme.actionDescription}</p>
          </div>
        </motion.section>

        {/* Navigation */}
        <div className="flex justify-between">
          {prevPhoneme ? (
            <Link
              href={`/phoneme/${prevPhoneme.id}`}
              className="flex items-center gap-2 px-5 py-3 bg-white rounded-2xl shadow-md font-bold text-gray-600 hover:shadow-lg transition-all"
            >
              ← {prevPhoneme.letter}
            </Link>
          ) : <div />}

          {nextPhoneme && (
            <Link
              href={`/phoneme/${nextPhoneme.id}`}
              className="flex items-center gap-2 px-5 py-3 text-white rounded-2xl shadow-md font-bold hover:shadow-lg transition-all"
              style={{ backgroundColor: color }}
            >
              {nextPhoneme.letter} →
            </Link>
          )}
        </div>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-green-200 flex justify-around items-center py-2 px-4 z-20">
        <Link href="/" className="flex flex-col items-center gap-1 text-gray-500 hover:text-green-700 transition-colors">
          <span className="text-2xl">🏡</span>
          <span className="text-xs font-bold">Home</span>
        </Link>
        <Link href="/games" className="flex flex-col items-center gap-1 text-gray-500 hover:text-purple-600 transition-colors">
          <span className="text-2xl">🎮</span>
          <span className="text-xs font-bold">Games</span>
        </Link>
        <Link href="/progress" className="flex flex-col items-center gap-1 text-gray-500 hover:text-yellow-600 transition-colors">
          <span className="text-2xl">⭐</span>
          <span className="text-xs font-bold">Progress</span>
        </Link>
      </nav>
    </div>
  );
}
