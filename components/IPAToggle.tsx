"use client";

export function IPAToggle({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="text-xs px-3 py-1.5 rounded-full border transition-colors"
      style={{
        background: show ? "#EEF2FF" : "#F3F4F6",
        borderColor: show ? "#A5B4FC" : "#D1D5DB",
        color: show ? "#4338CA" : "#6B7280",
      }}
      title={show ? "発音記号を隠す" : "発音記号を見る"}
    >
      {show ? "/æ/ ON" : "/æ/ OFF"}
    </button>
  );
}
