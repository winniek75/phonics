"use client";
import { useState } from "react";
import { useAudio } from "@/hooks/useAudio";
import { motion } from "framer-motion";

// テスト用の単語リスト
const testWords = [
  "sun", "cat", "dog", "red", "big", "run", "jump", "play",
  "apple", "banana", "orange", "happy", "school", "friend",
  "rainbow", "butterfly", "elephant", "computer"
];

// Tricky words
const trickyWords = [
  "the", "to", "I", "no", "go", "into", "he", "she", "we", "me", "be",
  "was", "you", "they", "all", "are", "my", "her", "what", "said"
];

export default function TestTTSPage() {
  const { play, speakWord, stop } = useAudio();
  const [customWord, setCustomWord] = useState("");
  const [rate, setRate] = useState(0.9);

  const handlePlayWord = (word: string) => {
    // まず音声ファイルを試して、なければTTSフォールバック
    play(`/audio/words/${word}.mp3`, { useTTS: true, rate });
  };

  const handleSpeakDirectly = (word: string) => {
    // 直接TTSで読み上げ
    speakWord(word, { rate });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <motion.h1
          className="text-4xl font-bold text-center mb-8 text-purple-800"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          🔊 Text-to-Speech テスト
        </motion.h1>

        {/* Speed Control */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-700">読み上げ速度</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm">遅い</span>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm">速い</span>
            <span className="font-mono bg-gray-100 px-2 py-1 rounded">
              {rate.toFixed(1)}x
            </span>
          </div>
        </div>

        {/* Custom Word Input */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-700">カスタム単語</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={customWord}
              onChange={(e) => setCustomWord(e.target.value)}
              placeholder="読み上げたい単語を入力..."
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && customWord) {
                  handleSpeakDirectly(customWord);
                }
              }}
            />
            <button
              onClick={() => customWord && handleSpeakDirectly(customWord)}
              disabled={!customWord}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              読み上げ
            </button>
            <button
              onClick={stop}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              停止
            </button>
          </div>
        </div>

        {/* Regular Words */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-700">📚 通常の単語</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {testWords.map((word) => (
              <motion.button
                key={word}
                onClick={() => handlePlayWord(word)}
                className="p-3 bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-lg hover:from-blue-500 hover:to-blue-600 font-medium shadow-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {word}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Tricky Words */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-700">🌟 Tricky Words</h2>
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 gap-3">
            {trickyWords.map((word) => (
              <motion.button
                key={word}
                onClick={() => handleSpeakDirectly(word)}
                className="p-3 bg-gradient-to-r from-purple-400 to-purple-500 text-white rounded-lg hover:from-purple-500 hover:to-purple-600 font-medium shadow-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {word}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-blue-800 mb-2">💡 動作説明</h3>
          <ul className="space-y-1 text-sm text-blue-700">
            <li>• ブラウザのWeb Speech API（speechSynthesis）を使用</li>
            <li>• 音声ファイルが存在しない場合、自動的にTTSで読み上げ</li>
            <li>• 通常の単語は `/audio/words/` から音声ファイルを探し、なければTTS</li>
            <li>• Tricky Wordsは直接TTSで読み上げ</li>
            <li>• 速度調整可能（0.5x - 1.5x）</li>
          </ul>
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-block px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            ← ホームに戻る
          </a>
        </div>
      </div>
    </div>
  );
}