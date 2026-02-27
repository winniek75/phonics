"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { phonemes } from "@/data/phonemes";
import { useAudio } from "@/hooks/useAudio";
import { useProgressStore } from "@/store/progressStore";

interface Question {
  word: string;
  phonemeIds: string[];
  sounds: string[];
  audioFile: string;
  choices: string[];
}

function generateQuestions(selectedPhonemes?: string[]): Question[] {
  const wordPool: Question[] = [];
  const phonemeList = selectedPhonemes && selectedPhonemes.length > 0
    ? phonemes.filter(p => selectedPhonemes.includes(p.id))
    : phonemes;

  phonemeList.forEach((p) => {
    p.exampleWords.forEach((word) => {
      if (word.length >= 3 && word.length <= 5) {
        // Split word into rough phoneme segments
        const sounds = word.split("").map((c) => `/${c}/`);
        const choices = [word];
        // Add dummy choices
        const others = phonemes
          .flatMap((ph) => ph.exampleWords)
          .filter((w) => w !== word && w.length === word.length)
          .sort(() => Math.random() - 0.5)
          .slice(0, 2);
        choices.push(...others);

        wordPool.push({
          word,
          phonemeIds: [p.id],
          sounds: sounds.slice(0, 3),
          audioFile: p.wordAudioFiles[word] || `/audio/words/${word}.mp3`,
          choices: choices.sort(() => Math.random() - 0.5),
        });
      }
    });
  });

  return wordPool.sort(() => Math.random() - 0.5).slice(0, 10);
}

export default function BlendingGame() {
  const { play } = useAudio();
  const { updateGameScore, selectedPhonemes } = useProgressStore();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    setQuestions(generateQuestions(selectedPhonemes));
  }, [selectedPhonemes]);

  const question = questions[currentQ];

  const handleAnswer = (choice: string) => {
    if (selected) return;
    setSelected(choice);
    const isCorrect = choice === question.word;

    if (isCorrect) {
      setFeedback("correct");
      setScore((s) => s + 1);
      play("/audio/sfx/correct.mp3");
    } else {
      setFeedback("wrong");
      play("/audio/sfx/wrong.mp3");
    }

    setTimeout(() => {
      setFeedback(null);
      setSelected(null);
      if (currentQ + 1 >= questions.length) {
        setGameOver(true);
        updateGameScore("blending", score + (isCorrect ? 1 : 0));
      } else {
        setCurrentQ((q) => q + 1);
      }
    }, 1500);
  };

  const restart = () => {
    setQuestions(generateQuestions());
    setCurrentQ(0);
    setScore(0);
    setSelected(null);
    setFeedback(null);
    setGameOver(false);
  };

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl font-display text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-100 to-pink-100">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <Link href="/games" className="text-red-600 font-bold hover:text-red-800 flex items-center gap-1">
          ← Games
        </Link>
        <h1 className="font-display text-2xl text-red-700">🎵 Blending</h1>
        <div className="bg-yellow-100 rounded-full px-3 py-1 font-bold text-yellow-700">
          ⭐ {score}/{questions.length}
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-8">
        {gameOver ? (
          <motion.div
            className="text-center py-12"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="text-8xl mb-6">{score >= 7 ? "🏆" : score >= 4 ? "🌟" : "💪"}</div>
            <h2 className="font-display text-4xl text-red-700 mb-4">
              {score >= 7 ? "Amazing!" : score >= 4 ? "Good Job!" : "Keep Trying!"}
            </h2>
            <p className="text-2xl font-bold text-gray-600 mb-8">
              Score: {score} / {questions.length}
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={restart}
                className="px-8 py-4 bg-red-500 text-white rounded-2xl font-display text-xl shadow-lg hover:bg-red-600 active:scale-95 transition-all"
              >
                Play Again! 🎵
              </button>
              <Link href="/games"
                className="px-8 py-4 bg-white text-red-600 rounded-2xl font-display text-xl shadow-lg border-2 border-red-200 hover:bg-red-50 active:scale-95 transition-all">
                Games
              </Link>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm font-bold text-red-600 mb-1">
                <span>Question {currentQ + 1} of {questions.length}</span>
                <span>Score: {score}</span>
              </div>
              <div className="bg-red-200 rounded-full h-3 overflow-hidden">
                <motion.div
                  className="h-full bg-red-500 rounded-full"
                  animate={{ width: `${((currentQ) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentQ}
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
              >
                {/* Sound cards */}
                <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
                  <p className="text-center text-gray-500 font-bold mb-4">Listen to the sounds:</p>
                  <div className="flex justify-center gap-3 mb-6 flex-wrap">
                    {question.sounds.map((sound, i) => (
                      <motion.button
                        key={i}
                        onClick={() => play(`/audio/phonemes/${question.word[i]}.mp3`)}
                        className="w-20 h-20 bg-red-500 text-white rounded-2xl shadow-md font-display text-2xl flex items-center justify-center"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        {sound}
                      </motion.button>
                    ))}
                  </div>
                  <div className="flex justify-center">
                    <button
                      onClick={() => play(question.audioFile)}
                      className="flex items-center gap-2 px-6 py-3 bg-red-100 text-red-700 rounded-2xl font-bold hover:bg-red-200 transition-colors"
                    >
                      🔊 Blend! Hear the word
                    </button>
                  </div>
                </div>

                {/* Choices */}
                <p className="text-center text-gray-600 font-bold mb-4">Which word is it?</p>
                <div className="grid grid-cols-3 gap-3">
                  {question.choices.map((choice) => {
                    const isSelected = selected === choice;
                    const isCorrect = choice === question.word;
                    let bg = "bg-white border-2 border-gray-200";
                    if (isSelected && feedback === "correct") bg = "bg-green-400 border-green-400 text-white";
                    else if (isSelected && feedback === "wrong") bg = "bg-red-400 border-red-400 text-white";
                    else if (!isSelected && feedback && isCorrect) bg = "bg-green-100 border-green-400";

                    return (
                      <motion.button
                        key={choice}
                        onClick={() => handleAnswer(choice)}
                        className={`${bg} rounded-2xl p-4 font-display text-2xl shadow-md transition-all`}
                        whileHover={!selected ? { scale: 1.05 } : {}}
                        whileTap={!selected ? { scale: 0.95 } : {}}
                      >
                        {choice}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </main>
    </div>
  );
}
