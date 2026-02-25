"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { svgPaths } from "@/data/svgPaths";
import { groupColors } from "@/data/phonemes";

interface LetterAnimationProps {
  pathId: string;
  groupColor?: string;
  groupNum?: number;
  autoPlay?: boolean;
  size?: number;
}

export default function LetterAnimation({
  pathId,
  groupColor,
  groupNum = 1,
  autoPlay = false,
  size = 160,
}: LetterAnimationProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [speed, setSpeed] = useState(1);
  const [key, setKey] = useState(0);
  const color = groupColor || groupColors[groupNum];
  const pathData = svgPaths[pathId];

  const handlePlay = () => {
    setKey((k) => k + 1);
    setIsPlaying(true);
  };

  const handleReset = () => {
    setKey((k) => k + 1);
    setIsPlaying(false);
  };

  if (!pathData) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl bg-gray-100"
        style={{ width: size, height: size }}
      >
        <span style={{ fontSize: size * 0.6, color, fontFamily: "Fredoka One" }}>
          {pathId}
        </span>
      </div>
    );
  }

  const duration = 2 / speed;

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="bg-white rounded-2xl shadow-lg border-4 flex items-center justify-center overflow-hidden"
        style={{ width: size, height: size, borderColor: color }}
      >
        <svg
          viewBox={pathData.viewBox}
          width={size - 16}
          height={size - 16}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Guide lines */}
          <line x1="0" y1="85" x2="200" y2="85" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4,4" />
          <line x1="0" y1="40" x2="200" y2="40" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4,4" />

          {/* Order numbers */}
          {pathData.strokes.map((stroke, i) => (
            <circle
              key={`dot-${i}`}
              cx={20 + i * 20}
              cy={10}
              r={8}
              fill={color}
              opacity={0.3}
            />
          ))}

          {/* Letter strokes */}
          {pathData.strokes
            .sort((a, b) => a.order - b.order)
            .map((stroke, i) => {
              const delay = pathData.strokes
                .slice(0, i)
                .reduce((acc) => acc + duration, 0);

              return (
                <motion.path
                  key={`${key}-stroke-${i}`}
                  d={stroke.d}
                  stroke={color}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={isPlaying ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                  transition={{
                    pathLength: { delay, duration, ease: "easeInOut" },
                    opacity: { delay, duration: 0.1 },
                  }}
                />
              );
            })}

          {/* Order numbers overlay */}
          {pathData.strokes.map((stroke, i) => (
            <text
              key={`num-${i}`}
              x={20 + i * 20}
              y={14}
              textAnchor="middle"
              fontSize="8"
              fill="white"
              fontWeight="bold"
              fontFamily="Nunito"
            >
              {stroke.order}
            </text>
          ))}
        </svg>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={handlePlay}
          className="px-4 py-2 rounded-full font-bold text-white text-sm shadow-md transition-transform active:scale-95"
          style={{ backgroundColor: color }}
        >
          ▶ Play
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 rounded-full font-bold bg-gray-200 text-gray-700 text-sm shadow-md transition-transform active:scale-95"
        >
          ↺ Reset
        </button>
      </div>

      {/* Speed control */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-500 font-semibold">Speed:</span>
        {[0.5, 1, 2].map((s) => (
          <button
            key={s}
            onClick={() => setSpeed(s)}
            className={`px-3 py-1 rounded-full text-xs font-bold border-2 transition-all ${
              speed === s ? "text-white border-transparent" : "bg-white text-gray-600 border-gray-200"
            }`}
            style={speed === s ? { backgroundColor: color, borderColor: color } : {}}
          >
            {s === 0.5 ? "Slow" : s === 1 ? "Normal" : "Fast"}
          </button>
        ))}
      </div>
    </div>
  );
}
