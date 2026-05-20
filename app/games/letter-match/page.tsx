"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { phonemes, groupColors } from "@/data/phonemes";
import { useAudio } from "@/hooks/useAudio";
import { useProgressStore } from "@/store/progressStore";
import { getSoundEffects } from "@/utils/soundEffects";

interface Question {
  phonemeId: string;
  letter: string;
  sound: string;
  audioFile: string;
  groupColor: string;
  choices: { letter: string; phonemeId: string }[];
}

function generateQuestions(selectedPhonemes?: string[]): Question[] {
  const allPhonemes = selectedPhonemes && selectedPhonemes.length > 0
    ? phonemes.filter(p => selectedPhonemes.includes(p.id))
    : phonemes;
  const pool = allPhonemes.slice(0, 20); // use first 20 phonemes
  return pool
    .sort(() => Math.random() - 0.5)
    .slice(0, 10)
    .map((p) => {
      const wrong = allPhonemes
        .filter((x) => x.id !== p.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 5);
      const choices = [
        { letter: p.letter, phonemeId: p.id },
        ...wrong.map((w) => ({ letter: w.letter, phonemeId: w.id })),
      ].sort(() => Math.random() - 0.5);
      return {
        phonemeId: p.id,
        letter: p.letter,
        sound: p.sound,
        audioFile: p.audioFile,
        groupColor: groupColors[p.group],
        choices,
      };
    });
}

export default function LetterMatchGame() {
  const { play } = useAudio();
  const { updateGameScore, selectedPhonemes, addWrongAnswer } = useProgressStore();
  const soundEffects = getSoundEffects();
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

  const handlePlay = () => {
    if (question) play(question.audioFile);
  };

  const handleAnswer = (phonemeId: string, letter: string) => {
    if (selected) return;
    setSelected(phonemeId);

    const isCorrect = phonemeId === question.phonemeId;
    if (isCorrect) {
      setFeedback("correct");
      setScore((s) => s + 1);
      soundEffects.playSuccess();
    } else {
      setFeedback("wrong");
      soundEffects.playError();
      addWrongAnswer("letterMatch", question.letter, letter);
    }

    setTimeout(() => {
      setFeedback(null);
      setSelected(null);
      if (currentQ + 1 >= questions.length) {
        setGameOver(true);
        updateGameScore("letterMatch", score + (isCorrect ? 1 : 0));
      } else {
        setCurrentQ((q) => q + 1);
      }
    }, 1500);
  };

  useEffect(() => {
    if (question && !selected) {
      const timer = setTimeout(() => play(question.audioFile), 300);
      return () => clearTimeout(timer);
    }
  }, [currentQ, question]);

  const restart = () => {
    setQuestions(generateQuestions());
    setCurrentQ(0);
    setScore(0);
    setSelected(null);
    setFeedback(null);
    setGameOver(false);
  };

  if (questions.length === 0) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-2xl font-display">Loading...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-indigo-100">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <Link href="/games" className="text-blue-600 font-bold hover:text-blue-800 flex items-center gap-1">
          ← Games
        </Link>
        <h1 className="font-display text-2xl text-blue-700">🔤 Letter Match</h1>
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
            <h2 className="font-display text-4xl text-blue-700 mb-4">
              {score >= 7 ? "Amazing!" : score >= 4 ? "Good Job!" : "Keep Trying!"}
            </h2>
            <p className="text-2xl font-bold text-gray-600 mb-8">
              Score: {score} / {questions.length}
            </p>
            <div className="flex gap-4 justify-center">
              <button onClick={restart}
                className="px-8 py-4 bg-blue-500 text-white rounded-2xl font-display text-xl shadow-lg hover:bg-blue-600 active:scale-95 transition-all">
                Play Again! 🔤
              </button>
              <Link href="/games"
                className="px-8 py-4 bg-white text-blue-600 rounded-2xl font-display text-xl shadow-lg border-2 border-blue-200 hover:bg-blue-50 active:scale-95 transition-all">
                Games
              </Link>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-sm font-bold text-blue-600 mb-1">
                <span>Question {currentQ + 1} of {questions.length}</span>
                <span>Score: {score}</span>
              </div>
              <div className="bg-blue-200 rounded-full h-3 overflow-hidden">
                <motion.div className="h-full bg-blue-500 rounded-full"
                  animate={{ width: `${(currentQ / questions.length) * 100}%` }} />
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={currentQ} initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }}>
                {/* Sound button */}
                <div className="text-center mb-8">
                  <motion.button
                    onClick={handlePlay}
                    className="w-32 h-32 rounded-full shadow-2xl text-white font-display text-xl flex flex-col items-center justify-center mx-auto"
                    style={{ backgroundColor: question.groupColor }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: 2, duration: 0.5 }}
                  >
                    <span className="text-4xl">🔊</span>
                    <span className="text-sm mt-1">Tap to hear!</span>
                  </motion.button>
                  <p className="mt-4 text-gray-600 font-bold text-lg">
                    Which letter makes this sound?
                  </p>
                </div>

                {/* Letter choices */}
                <div className="grid grid-cols-3 gap-3">
                  {question.choices.map(({ letter, phonemeId }) => {
                    const isSelected = selected === phonemeId;
                    const isCorrect = phonemeId === question.phonemeId;
                    let classes = "bg-white border-3 border-gray-200 text-gray-700";
                    if (isSelected && feedback === "correct") classes = "bg-green-400 border-green-500 text-white";
                    else if (isSelected && feedback === "wrong") classes = "bg-red-400 border-red-500 text-white";
                    else if (!isSelected && feedback && isCorrect) classes = "bg-green-100 border-green-400 text-green-700";

                    return (
                      <motion.button
                        key={phonemeId}
                        onClick={() => handleAnswer(phonemeId, letter)}
                        className={`${classes} rounded-3xl shadow-lg font-display text-4xl py-6 transition-all border-2`}
                        whileHover={!selected ? { scale: 1.08, y: -3 } : {}}
                        whileTap={!selected ? { scale: 0.95 } : {}}
                        animate={isSelected && feedback === "correct" ? {
                          scale: [1, 1.2, 1],
                          transition: { duration: 0.3 }
                        } : isSelected && feedback === "wrong" ? {
                          x: [-8, 8, -8, 0],
                          transition: { duration: 0.3 }
                        } : {}}
                      >
                        {letter}
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
