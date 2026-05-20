"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { trickyWords } from "@/data/trickyWords";
import { useAudio } from "@/hooks/useAudio";
import { useProgressStore } from "@/store/progressStore";
import { getSoundEffects } from "@/utils/soundEffects";

interface Question {
  word: string;
  audioFile: string;
  choices: string[];
}

function generateQuestions(): Question[] {
  const pool = trickyWords.slice(0, 24).sort(() => Math.random() - 0.5).slice(0, 10);
  return pool.map((tw) => {
    const others = trickyWords
      .filter((w) => w.word !== tw.word)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((w) => w.word);
    return {
      word: tw.word,
      audioFile: tw.audioFile,
      choices: [tw.word, ...others].sort(() => Math.random() - 0.5),
    };
  });
}

export default function TrickyWordsGame() {
  const { play, speakWord } = useAudio();
  const { updateGameScore, masterTrickyWord, masteredTrickyWords, addWrongAnswer } = useProgressStore();
  const soundEffects = getSoundEffects();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    setQuestions(generateQuestions());
  }, []);

  const question = questions[currentQ];

  useEffect(() => {
    if (question) {
      // 音声ファイルが存在しない場合はTTSを使用
      const t = setTimeout(() => {
        speakWord(question.word);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [currentQ, question, speakWord]);

  const handleAnswer = (choice: string) => {
    if (selected) return;
    setSelected(choice);
    const isCorrect = choice === question.word;
    if (isCorrect) {
      setFeedback("correct");
      setScore((s) => s + 1);
      masterTrickyWord(question.word);
      soundEffects.playSuccess();
    } else {
      setFeedback("wrong");
      soundEffects.playError();
      addWrongAnswer("trickyWords", question.word, choice);
    }

    setTimeout(() => {
      setFeedback(null);
      setSelected(null);
      if (currentQ + 1 >= questions.length) {
        setGameOver(true);
        updateGameScore("trickyWords", score + (isCorrect ? 1 : 0));
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

  if (questions.length === 0) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-2xl font-display">Loading...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-emerald-100">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <Link href="/games" className="text-green-600 font-bold hover:text-green-800 flex items-center gap-1">
          ← Games
        </Link>
        <h1 className="font-display text-2xl text-green-700">🌟 Tricky Words</h1>
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
            <h2 className="font-display text-4xl text-green-700 mb-4">
              {score >= 7 ? "Amazing!" : score >= 4 ? "Good Job!" : "Keep Trying!"}
            </h2>
            <p className="text-2xl font-bold text-gray-600 mb-2">Score: {score} / {questions.length}</p>
            <p className="text-gray-500 mb-8">Total mastered: {masteredTrickyWords.length} words!</p>
            <div className="flex gap-4 justify-center">
              <button onClick={restart}
                className="px-8 py-4 bg-green-500 text-white rounded-2xl font-display text-xl shadow-lg hover:bg-green-600 active:scale-95 transition-all">
                Play Again! 🌟
              </button>
              <Link href="/games"
                className="px-8 py-4 bg-white text-green-600 rounded-2xl font-display text-xl shadow-lg border-2 border-green-200 hover:bg-green-50 active:scale-95 transition-all">
                Games
              </Link>
            </div>
          </motion.div>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex justify-between text-sm font-bold text-green-600 mb-1">
                <span>Question {currentQ + 1} of {questions.length}</span>
                <span>Score: {score}</span>
              </div>
              <div className="bg-green-200 rounded-full h-3 overflow-hidden">
                <motion.div className="h-full bg-green-500 rounded-full"
                  animate={{ width: `${(currentQ / questions.length) * 100}%` }} />
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={currentQ} initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }}>
                {/* Audio prompt */}
                <div className="text-center mb-8">
                  <motion.button
                    onClick={() => speakWord(question.word)}
                    className="w-32 h-32 bg-green-500 text-white rounded-full shadow-2xl font-display text-xl flex flex-col items-center justify-center mx-auto"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-5xl">🔊</span>
                    <span className="text-sm mt-1">Listen!</span>
                  </motion.button>
                  <p className="mt-4 text-gray-600 font-bold text-xl">
                    Which word did you hear?
                  </p>
                </div>

                {/* Word choices */}
                <div className="grid grid-cols-2 gap-4">
                  {question.choices.map((choice) => {
                    const isSelected = selected === choice;
                    const isCorrect = choice === question.word;
                    let bg = "bg-white border-gray-200 text-gray-800";
                    if (isSelected && feedback === "correct") bg = "bg-green-400 border-green-400 text-white";
                    else if (isSelected && feedback === "wrong") bg = "bg-red-400 border-red-400 text-white";
                    else if (!isSelected && feedback && isCorrect) bg = "bg-green-100 border-green-400 text-green-800";

                    return (
                      <motion.button
                        key={choice}
                        onClick={() => handleAnswer(choice)}
                        className={`${bg} border-2 rounded-3xl py-8 px-4 font-display text-3xl shadow-lg transition-all`}
                        whileHover={!selected ? { scale: 1.05, y: -2 } : {}}
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
