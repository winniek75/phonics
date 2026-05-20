"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { phonemes, groupColors } from "@/data/phonemes";
import { useAudio } from "@/hooks/useAudio";
import { useProgressStore } from "@/store/progressStore";
import { getSoundEffects } from "@/utils/soundEffects";

declare global { interface Window { WiseXP?: any; } }

interface Question {
  word: string;
  audioFile: string;
  segments: string[];
  choices: string[];
}

function generateQuestions(selectedPhonemes?: string[]): Question[] {
  const wordPool: Question[] = [];
  const phonemeList = selectedPhonemes && selectedPhonemes.length > 0
    ? phonemes.filter(p => selectedPhonemes.includes(p.id))
    : phonemes.slice(0, 18);

  phonemeList.forEach((p) => {
    p.exampleWords.forEach((word) => {
      if (word.length >= 3 && word.length <= 4) {
        const segments = word.split("").map((c) => c);
        const others = "bcdfghjklmnprstvwxyz"
          .split("")
          .filter((c) => !segments.includes(c))
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        const choices = [...segments, ...others]
          .filter((v, i, a) => a.indexOf(v) === i) // unique
          .sort(() => Math.random() - 0.5);
        wordPool.push({
          word,
          audioFile: p.wordAudioFiles[word] || `/audio/words/${word}.mp3`,
          segments,
          choices,
        });
      }
    });
  });

  return wordPool.sort(() => Math.random() - 0.5).slice(0, 10);
}

export default function SegmentingGame() {
  const { play } = useAudio();
  const { updateGameScore, selectedPhonemes, addWrongAnswer } = useProgressStore();
  const soundEffects = getSoundEffects();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswer, setUserAnswer] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.WiseXP) window.WiseXP.init('phonics');
  }, []);

  useEffect(() => {
    setQuestions(generateQuestions(selectedPhonemes));
  }, [selectedPhonemes]);

  const question = questions[currentQ];

  useEffect(() => {
    if (question) {
      const t = setTimeout(() => play(question.audioFile), 300);
      return () => clearTimeout(t);
      setUserAnswer([]);
      setChecked(false);
      setFeedback(null);
    }
  }, [currentQ, question]);

  const addLetter = (letter: string) => {
    if (checked) return;
    if (userAnswer.length < question.segments.length) {
      setUserAnswer([...userAnswer, letter]);
    }
  };

  const removeLast = () => {
    if (checked) return;
    setUserAnswer(userAnswer.slice(0, -1));
  };

  const checkAnswer = () => {
    if (userAnswer.length !== question.segments.length) return;
    const isCorrect = userAnswer.join("") === question.word;
    setChecked(true);
    setFeedback(isCorrect ? "correct" : "wrong");
    if (isCorrect) {
      setScore((s) => s + 1);
      soundEffects.playSuccess();
    } else {
      soundEffects.playError();
      addWrongAnswer("segmenting", question.word, userAnswer.join(""));
      if (window.WiseXP) window.WiseXP.reportWrong({ question: question.word, correct: question.word, playerAnswer: userAnswer.join("") });
    }

    setTimeout(() => {
      if (currentQ + 1 >= questions.length) {
        setGameOver(true);
        const finalScore = score + (isCorrect ? 1 : 0);
        updateGameScore("segmenting", finalScore);
        if (window.WiseXP) window.WiseXP.reportGame({ score: finalScore, correct: finalScore, total: questions.length, maxCombo: 0, grade: 'segmenting' });
      } else {
        setCurrentQ((q) => q + 1);
        setUserAnswer([]);
        setChecked(false);
        setFeedback(null);
      }
    }, 1800);
  };

  const restart = () => {
    setQuestions(generateQuestions());
    setCurrentQ(0);
    setScore(0);
    setUserAnswer([]);
    setFeedback(null);
    setGameOver(false);
    setChecked(false);
  };

  if (questions.length === 0) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-2xl font-display">Loading...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-100 to-amber-100">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <Link href="/games" className="text-orange-600 font-bold hover:text-orange-800 flex items-center gap-1">
          ← Games
        </Link>
        <h1 className="font-display text-2xl text-orange-700">🧩 Segmenting</h1>
        <div className="bg-yellow-100 rounded-full px-3 py-1 font-bold text-yellow-700">
          ⭐ {score}/{questions.length}
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-8">
        {gameOver ? (
          <motion.div className="text-center py-12" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <div className="text-8xl mb-6">{score >= 7 ? "🏆" : score >= 4 ? "🌟" : "💪"}</div>
            <h2 className="font-display text-4xl text-orange-700 mb-4">
              {score >= 7 ? "Amazing!" : score >= 4 ? "Good Job!" : "Keep Trying!"}
            </h2>
            <p className="text-2xl font-bold text-gray-600 mb-8">Score: {score} / {questions.length}</p>
            <div className="flex gap-4 justify-center">
              <button onClick={restart}
                className="px-8 py-4 bg-orange-500 text-white rounded-2xl font-display text-xl shadow-lg hover:bg-orange-600 active:scale-95 transition-all">
                Play Again! 🧩
              </button>
              <Link href="/games"
                className="px-8 py-4 bg-white text-orange-600 rounded-2xl font-display text-xl shadow-lg border-2 border-orange-200 hover:bg-orange-50 active:scale-95 transition-all">
                Games
              </Link>
            </div>
          </motion.div>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex justify-between text-sm font-bold text-orange-600 mb-1">
                <span>Question {currentQ + 1} of {questions.length}</span>
                <span>Score: {score}</span>
              </div>
              <div className="bg-orange-200 rounded-full h-3 overflow-hidden">
                <motion.div className="h-full bg-orange-500 rounded-full"
                  animate={{ width: `${(currentQ / questions.length) * 100}%` }} />
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={currentQ} initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }}>
                {/* Word prompt */}
                <div className="text-center mb-6">
                  <button
                    onClick={() => play(question.audioFile)}
                    className="px-8 py-4 bg-orange-500 text-white rounded-2xl font-display text-2xl shadow-lg hover:bg-orange-600 transition-colors"
                  >
                    🔊 {question.word}
                  </button>
                  <p className="mt-3 text-gray-600 font-bold">Break it into sounds!</p>
                </div>

                {/* Answer boxes */}
                <div className="flex justify-center gap-3 mb-8">
                  {Array.from({ length: question.segments.length }).map((_, i) => {
                    const letter = userAnswer[i];
                    let boxStyle = "border-orange-300 bg-white";
                    if (checked && feedback === "correct") boxStyle = "border-green-400 bg-green-50";
                    if (checked && feedback === "wrong") {
                      boxStyle = letter === question.segments[i] ? "border-green-400 bg-green-50" : "border-red-400 bg-red-50";
                    }
                    return (
                      <motion.div
                        key={i}
                        className={`w-16 h-16 border-4 rounded-2xl flex items-center justify-center font-display text-3xl shadow-md ${boxStyle}`}
                        animate={checked && feedback === "correct" && letter ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ delay: i * 0.1 }}
                      >
                        {letter || ""}
                      </motion.div>
                    );
                  })}
                </div>

                {/* Letter choices */}
                <div className="flex flex-wrap gap-2 justify-center mb-6">
                  {question.choices.map((letter) => (
                    <motion.button
                      key={letter}
                      onClick={() => addLetter(letter)}
                      className="w-14 h-14 bg-orange-400 text-white rounded-2xl font-display text-2xl shadow-md hover:bg-orange-500 active:scale-95 transition-all"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {letter}
                    </motion.button>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={removeLast}
                    disabled={userAnswer.length === 0 || checked}
                    className="px-5 py-3 bg-gray-200 text-gray-700 rounded-2xl font-bold disabled:opacity-40"
                  >
                    ← Undo
                  </button>
                  <button
                    onClick={checkAnswer}
                    disabled={userAnswer.length !== question.segments.length || checked}
                    className="px-8 py-3 bg-orange-500 text-white rounded-2xl font-bold shadow-md disabled:opacity-40 hover:bg-orange-600 transition-colors"
                  >
                    ✓ Check!
                  </button>
                </div>

                {/* Feedback */}
                <AnimatePresence>
                  {feedback && (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 20, opacity: 0 }}
                      className={`mt-4 text-center font-display text-2xl ${feedback === "correct" ? "text-green-600" : "text-red-600"}`}
                    >
                      {feedback === "correct" ? "🎉 Correct!" : `❌ It was: ${question.word}`}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </main>
    </div>
  );
}
