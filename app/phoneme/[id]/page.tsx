"use client";
import { useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { phonemes, groupColors, getPhonemeById } from "@/data/phonemes";
import { useAudio } from "@/hooks/useAudio";
import { useProgressStore } from "@/store/progressStore";
import LetterAnimation from "@/components/LetterAnimation/LetterAnimation";
import PortalLink from "@/components/PortalLink";
import { IPAToggle } from "@/components/IPAToggle";
import { useShowIPA } from "@/hooks/useShowIPA";
import { actionJa } from "@/data/phonemeJa";

export default function PhonemePage() {
  const params = useParams();
  const id = params.id as string;
  const phoneme = getPhonemeById(id);
  const { play, playPhoneme, speakWord } = useAudio();
  const { showIPA, toggleIPA } = useShowIPA();
  const { completedPhonemes, phonemeActivity, recordPhonemeHeard, recordPhonemeWordHeard } = useProgressStore();
  const [showAnimation, setShowAnimation] = useState(false);
  const [celebrated, setCelebrated] = useState(false);
  const [audioProblem, setAudioProblem] = useState(false);

  // 学習記録は「ページを開いた時間」ではなく、じっさいに音を再生できたときだけ付ける。
  //  ① 音を聞いた（Hear Sound）  ② 例の単語を1つ以上聞いた  → ⭐
  const isCompleted = !!phoneme && completedPhonemes.includes(phoneme.id);
  const activity = phoneme ? phonemeActivity[phoneme.id] : undefined;
  const heardSound = !!activity?.heard;
  const heardWord = (activity?.words.length ?? 0) > 0;

  // ⭐になった瞬間だけお祝いを出す（すでに⭐のページを開いたときは出さない）
  const wasCompleted = useRef<{ id: string; done: boolean } | null>(null);
  useEffect(() => {
    if (!phoneme) return;
    const prev = wasCompleted.current;
    if (prev && prev.id === phoneme.id && !prev.done && isCompleted) {
      setCelebrated(true);
      const timer = setTimeout(() => setCelebrated(false), 2500);
      wasCompleted.current = { id: phoneme.id, done: true };
      return () => clearTimeout(timer);
    }
    wasCompleted.current = { id: phoneme.id, done: isCompleted };
  }, [phoneme?.id, isCompleted]);

  const hearSound = () => {
    if (!phoneme) return;
    const pid = phoneme.id;
    // 音素はTTS代用しない（録音ファイルのみ）
    playPhoneme(phoneme.audioFile, {
      onPlayed: () => { setAudioProblem(false); recordPhonemeHeard(pid); },
      onFailed: () => setAudioProblem(true),
    });
  };

  const hearWord = (word: string) => {
    if (!phoneme) return;
    const pid = phoneme.id;
    play(phoneme.wordAudioFiles[word] || `/audio/words/${word}.mp3`, {
      onPlayed: () => { setAudioProblem(false); recordPhonemeWordHeard(pid, word); },
      onFailed: () => setAudioProblem(true),
    });
  };

  if (!phoneme) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-600">この おとは みつかりません</p>
          <p className="text-sm text-gray-400 mt-1">Phoneme not found</p>
          <Link href="/" className="mt-4 inline-block text-green-600 font-bold">← おにわに もどる</Link>
        </div>
      </div>
    );
  }

  const color = groupColors[phoneme.group];
  const allPhonemes = phonemes;
  const currentIndex = allPhonemes.findIndex((p) => p.id === id);
  const prevPhoneme = currentIndex > 0 ? allPhonemes[currentIndex - 1] : null;
  const nextPhoneme = currentIndex < allPhonemes.length - 1 ? allPhonemes[currentIndex + 1] : null;

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(135deg, ${color}22 0%, #f0fdf4 100%)` }}>
      {/* Celebration */}
      <AnimatePresence>
        {celebrated && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 inset-x-0 mx-auto w-fit z-50 bg-yellow-400 text-yellow-900 font-display px-6 py-3 rounded-full text-xl shadow-xl whitespace-nowrap"
          >
            🌟 よく できました！ Great job!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <Link href="/" className="flex items-center gap-2 text-green-700 font-bold hover:text-green-900 transition-colors">
          <span className="text-xl">←</span>
          <span>おにわ</span>
        </Link>
        <div className="flex items-center gap-2">
          <span
            className="px-3 py-1 rounded-full text-white text-sm font-bold"
            style={{ backgroundColor: color }}
          >
            グループ {phoneme.group}
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
            onClick={hearSound}
            aria-label="おとを きく"
            className="text-9xl font-display cursor-pointer inline-block select-none"
            style={{ color }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {phoneme.letter}
          </motion.button>
          <div className="flex items-center justify-center gap-2 mt-2">
            {showIPA && <p className="text-2xl text-gray-500 font-semibold">{phoneme.sound} の おと</p>}
            <IPAToggle show={showIPA} onToggle={toggleIPA} />
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center mb-4">
          <motion.button
            onClick={hearSound}
            className="flex flex-col items-center px-6 py-3 rounded-2xl text-white font-bold text-lg shadow-lg leading-tight"
            style={{ backgroundColor: color }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>🔊 おとを きく</span>
            <span className="text-xs font-semibold opacity-90">Hear Sound</span>
          </motion.button>
          <motion.button
            onClick={() => setShowAnimation(!showAnimation)}
            className="flex flex-col items-center px-6 py-3 rounded-2xl font-bold text-lg shadow-lg bg-white border-2 leading-tight"
            style={{ borderColor: color, color }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>✏️ かきかた</span>
            <span className="text-xs font-semibold opacity-80">Write It</span>
          </motion.button>
        </div>

        {/* やることリスト：じっさいに聞いたら ✅ になる */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8 text-sm font-bold" data-testid="steps">
          <span className={`px-3 py-1 rounded-full ${heardSound ? "bg-green-100 text-green-700" : "bg-white text-gray-500 border border-gray-200"}`}>
            {heardSound ? "✅" : "①"} おとを きく
          </span>
          <span className={`px-3 py-1 rounded-full ${heardWord ? "bg-green-100 text-green-700" : "bg-white text-gray-500 border border-gray-200"}`}>
            {heardWord ? "✅" : "②"} ことばを きく
          </span>
          <span className={`px-3 py-1 rounded-full ${isCompleted ? "bg-yellow-100 text-yellow-700" : "bg-white text-gray-400 border border-gray-200"}`}>
            {isCompleted ? "⭐ できた！" : "→ ⭐"}
          </span>
        </div>

        {audioProblem && (
          <p className="text-center text-sm font-bold text-orange-700 bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3 mb-8" role="status">
            🔈 おとの ファイルが まだ ないよ。せんせいに きいてね。
            <span className="block text-xs font-semibold text-orange-600 mt-1">
              （先生へ：音素の録音ファイルを public/audio/phonemes/ に配置してください）
            </span>
          </p>
        )}

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
          <h2 className="font-display text-2xl mb-1 text-gray-700">📚 ことば <span className="text-base text-gray-400">Example Words</span></h2>
          <p className="text-sm font-semibold text-gray-500 mb-3">おして きいてみよう。まねして いってみよう。</p>
          <div className="grid grid-cols-2 gap-3">
            {phoneme.exampleWords.map((word, i) => (
              <motion.button
                key={word}
                onClick={() => hearWord(word)}
                className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-md font-bold text-lg border-2 hover:shadow-lg transition-all"
                style={{ borderColor: color, color: "#374151" }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                initial={{ x: i % 2 === 0 ? -20 : 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <span className="text-2xl">{activity?.words.includes(word) ? "✅" : "🔊"}</span>
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
          <h2 className="font-display text-2xl mb-1 text-gray-700">📖 おはなし <span className="text-base text-gray-400">Story</span></h2>
          <p className="text-sm font-semibold text-gray-500 mb-3">えいごの おはなしだよ。おすと よんでくれるよ。</p>
          <button
            type="button"
            onClick={() => speakWord(phoneme.storyText, { rate: 0.8, onFailed: () => setAudioProblem(true) })}
            className="w-full text-left p-5 rounded-3xl text-white text-lg font-semibold leading-relaxed shadow-md"
            style={{ backgroundColor: color }}
          >
            <span className="mr-2">🔊</span>{phoneme.storyText}
          </button>
        </motion.section>

        {/* Action */}
        <motion.section
          className="mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="font-display text-2xl mb-1 text-gray-700">🤸 うごき <span className="text-base text-gray-400">Action</span></h2>
          <p className="text-sm font-semibold text-gray-500 mb-3">おとを いいながら からだを うごかそう。</p>
          <div className="flex items-center gap-4 p-5 bg-white rounded-3xl shadow-md border-2"
            style={{ borderColor: color }}>
            <span className="text-5xl">{phoneme.actionEmoji}</span>
            <div>
              {actionJa[phoneme.id] && (
                <p className="text-lg font-bold text-gray-700">{actionJa[phoneme.id]}</p>
              )}
              <p className="text-sm font-semibold text-gray-400">{phoneme.actionDescription}</p>
            </div>
          </div>
        </motion.section>

        {/* Navigation */}
        <div className="flex justify-between">
          {prevPhoneme ? (
            <Link
              href={`/phoneme/${prevPhoneme.id}`}
              className="flex items-center gap-2 px-5 py-3 bg-white rounded-2xl shadow-md font-bold text-gray-600 hover:shadow-lg transition-all"
            >
              ← まえ {prevPhoneme.letter}
            </Link>
          ) : <div />}

          {nextPhoneme && (
            <Link
              href={`/phoneme/${nextPhoneme.id}`}
              className="flex items-center gap-2 px-5 py-3 text-white rounded-2xl shadow-md font-bold hover:shadow-lg transition-all"
              style={{ backgroundColor: color }}
            >
              つぎ {nextPhoneme.letter} →
            </Link>
          )}
        </div>

        {/* この おとで あそぶ */}
        <div className="mt-8 text-center">
          <a
            href={`/games/letter-match?group=${phoneme.group}`}
            className="inline-block px-5 py-3 bg-white rounded-2xl shadow-md font-bold text-blue-600 border-2 border-blue-200"
          >
            🔤 グループ {phoneme.group} の おとあてゲーム
          </a>
          <div className="mt-4"><PortalLink /></div>
        </div>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-green-200 flex justify-around items-center py-2 px-4 z-20">
        <Link href="/" className="flex flex-col items-center gap-1 text-gray-500 hover:text-green-700 transition-colors">
          <span className="text-2xl">🏡</span>
          <span className="text-xs font-bold">おにわ</span>
        </Link>
        <Link href="/games" className="flex flex-col items-center gap-1 text-gray-500 hover:text-purple-600 transition-colors">
          <span className="text-2xl">🎮</span>
          <span className="text-xs font-bold">ゲーム</span>
        </Link>
        <Link href="/progress" className="flex flex-col items-center gap-1 text-gray-500 hover:text-yellow-600 transition-colors">
          <span className="text-2xl">⭐</span>
          <span className="text-xs font-bold">きろく</span>
        </Link>
      </nav>
    </div>
  );
}
