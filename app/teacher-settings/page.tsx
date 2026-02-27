"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { phonemes, groupColors } from "@/data/phonemes";
import { useProgressStore } from "@/store/progressStore";

export default function TeacherSettingsPage() {
  const {
    completedPhonemes,
    setCompletedPhonemes,
    selectedPhonemes,
    setSelectedPhonemes,
    teacherMode,
    setTeacherMode
  } = useProgressStore();

  const [showSuccess, setShowSuccess] = useState(false);

  const handleTogglePhoneme = (id: string) => {
    if (selectedPhonemes.includes(id)) {
      setSelectedPhonemes(selectedPhonemes.filter(p => p !== id));
    } else {
      setSelectedPhonemes([...selectedPhonemes, id]);
    }
  };

  const handleSelectGroup = (groupNum: number) => {
    const groupPhonemes = phonemes.filter(p => p.group === groupNum);
    const groupIds = groupPhonemes.map(p => p.id);
    const allSelected = groupIds.every(id => selectedPhonemes.includes(id));

    if (allSelected) {
      // 全て選択済みなら解除
      setSelectedPhonemes(selectedPhonemes.filter(id => !groupIds.includes(id)));
    } else {
      // 未選択のものを追加
      const newSelection = [...selectedPhonemes];
      groupIds.forEach(id => {
        if (!newSelection.includes(id)) newSelection.push(id);
      });
      setSelectedPhonemes(newSelection);
    }
  };

  const handleSaveSettings = () => {
    // 選択された文字を既習文字として保存
    setCompletedPhonemes(selectedPhonemes);
    setTeacherMode(true);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleResetAll = () => {
    setSelectedPhonemes([]);
    setCompletedPhonemes([]);
    setTeacherMode(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-indigo-50 pb-20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm px-6 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-purple-700 font-bold text-xl hover:text-purple-900">
              ← Back
            </Link>
            <h1 className="font-display text-3xl text-purple-800">🎓 Teacher Settings</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-base text-gray-600">
              Selected: <strong>{selectedPhonemes.length}/42</strong>
            </span>
            <button
              onClick={handleResetAll}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Reset All
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Instructions */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">📚 学習文字の選択</h2>
          <p className="text-gray-600 mb-4">
            生徒が学習する文字を選択してください。選択された文字のみがゲームに出題されます。
          </p>
          <div className="flex items-center gap-2 p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200">
            <span className="text-2xl">💡</span>
            <p className="text-gray-700">
              グループ番号をクリックすると、そのグループ全体を選択/解除できます
            </p>
          </div>
        </div>

        {/* Groups */}
        {[1, 2, 3, 4, 5, 6, 7].map(groupNum => {
          const groupPhonemes = phonemes.filter(p => p.group === groupNum);
          const groupIds = groupPhonemes.map(p => p.id);
          const selectedCount = groupIds.filter(id => selectedPhonemes.includes(id)).length;
          const allSelected = selectedCount === groupIds.length;
          const partialSelected = selectedCount > 0 && selectedCount < groupIds.length;

          return (
            <div key={groupNum} className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => handleSelectGroup(groupNum)}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    allSelected
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : partialSelected
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: groupColors[groupNum] }}
                  >
                    {groupNum}
                  </div>
                  <span className="font-bold text-lg">Group {groupNum}</span>
                  <span className="text-sm">
                    ({selectedCount}/{groupIds.length})
                  </span>
                </button>
              </div>

              <div className="grid grid-cols-6 gap-3">
                {groupPhonemes.map(phoneme => {
                  const isSelected = selectedPhonemes.includes(phoneme.id);
                  return (
                    <motion.button
                      key={phoneme.id}
                      onClick={() => handleTogglePhoneme(phoneme.id)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'bg-gradient-to-br from-green-400 to-green-500 border-green-600 text-white shadow-lg'
                          : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="text-3xl font-bold mb-1">{phoneme.letter}</div>
                      <div className="text-xs opacity-80">
                        {phoneme.examples[0]?.word || ''}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Save Button */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 p-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={teacherMode}
                  onChange={(e) => setTeacherMode(e.target.checked)}
                  className="w-5 h-5"
                />
                <span className="font-bold">講師モード有効</span>
              </label>
            </div>

            <div className="flex items-center gap-4">
              {showSuccess && (
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-green-600 font-bold"
                >
                  ✅ 設定を保存しました！
                </motion.span>
              )}

              <button
                onClick={handleSaveSettings}
                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
                disabled={selectedPhonemes.length === 0}
              >
                設定を保存
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}