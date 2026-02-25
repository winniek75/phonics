"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { phonemes, groupColors, getPhonemesByGroup } from "@/data/phonemes";
import { useProgressStore } from "@/store/progressStore";

const GROUP_POSITIONS = [
  { cx: 50, cy: 50 },   // group 1 - top center
  { cx: 20, cy: 30 },   // group 2 - top left
  { cx: 80, cy: 30 },   // group 3 - top right
  { cx: 15, cy: 65 },   // group 4 - mid left
  { cx: 85, cy: 65 },   // group 5 - mid right
  { cx: 30, cy: 88 },   // group 6 - bottom left
  { cx: 70, cy: 88 },   // group 7 - bottom right
];

const PETAL_OFFSETS = [
  { dx: 0, dy: -40 },
  { dx: 38, dy: -20 },
  { dx: 38, dy: 20 },
  { dx: 0, dy: 40 },
  { dx: -38, dy: 20 },
  { dx: -38, dy: -20 },
];

interface PetalProps {
  phoneme: { id: string; letter: string };
  groupColor: string;
  isCompleted: boolean;
  centerX: number;
  centerY: number;
  offset: { dx: number; dy: number };
  index: number;
}

function Petal({ phoneme, groupColor, isCompleted, centerX, centerY, offset, index }: PetalProps) {
  const x = centerX + offset.dx;
  const y = centerY + offset.dy;

  return (
    <Link href={`/phoneme/${phoneme.id}`}>
      <motion.g
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: index * 0.05, type: "spring", stiffness: 200 }}
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.95 }}
        style={{ cursor: "pointer" }}
      >
        <ellipse
          cx={x}
          cy={y}
          rx="16"
          ry="20"
          fill={isCompleted ? groupColor : "#e5e7eb"}
          opacity={isCompleted ? 1 : 0.7}
          stroke={groupColor}
          strokeWidth="2"
          transform={`rotate(${Math.atan2(offset.dy, offset.dx) * (180 / Math.PI) + 90}, ${x}, ${y})`}
          style={{ filter: isCompleted ? `drop-shadow(0 2px 4px ${groupColor}88)` : "none" }}
        />
        <text
          x={x}
          y={y + 4}
          textAnchor="middle"
          fontSize="9"
          fontFamily="Fredoka One"
          fontWeight="bold"
          fill={isCompleted ? "white" : "#6b7280"}
        >
          {phoneme.letter}
        </text>
      </motion.g>
    </Link>
  );
}

interface FlowerProps {
  group: number;
  position: { cx: number; cy: number };
  viewportWidth: number;
  viewportHeight: number;
}

function Flower({ group, position, viewportWidth, viewportHeight }: FlowerProps) {
  const groupPhonemes = getPhonemesByGroup(group);
  const color = groupColors[group];
  const completedPhonemes = useProgressStore((s) => s.completedPhonemes);
  const cx = (position.cx / 100) * viewportWidth;
  const cy = (position.cy / 100) * viewportHeight;

  return (
    <g>
      {/* Stem */}
      <motion.line
        x1={cx}
        y1={cy + 12}
        x2={cx}
        y2={cy + 60}
        stroke="#16a34a"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: group * 0.1, duration: 0.5 }}
      />
      {/* Leaves */}
      <ellipse cx={cx - 12} cy={cy + 40} rx="10" ry="6" fill="#22c55e" opacity="0.8"
        transform={`rotate(-30, ${cx - 12}, ${cy + 40})`} />
      <ellipse cx={cx + 12} cy={cy + 50} rx="10" ry="6" fill="#22c55e" opacity="0.8"
        transform={`rotate(30, ${cx + 12}, ${cy + 50})`} />

      {/* Petals */}
      {groupPhonemes.map((phoneme, i) => (
        <Petal
          key={phoneme.id}
          phoneme={phoneme}
          groupColor={color}
          isCompleted={completedPhonemes.includes(phoneme.id)}
          centerX={cx}
          centerY={cy}
          offset={PETAL_OFFSETS[i]}
          index={group * 6 + i}
        />
      ))}

      {/* Center */}
      <motion.circle
        cx={cx}
        cy={cy}
        r="14"
        fill={color}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: group * 0.1 + 0.3, type: "spring" }}
      />
      <text x={cx} y={cy + 5} textAnchor="middle" fontSize="10" fontFamily="Fredoka One"
        fill="white" fontWeight="bold">
        G{group}
      </text>
    </g>
  );
}

export default function GardenHome() {
  const { completedPhonemes, profileName, profileAvatarId } = useProgressStore();
  const progress = (completedPhonemes.length / phonemes.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 via-green-100 to-green-300">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🌸</span>
          <h1 className="font-display text-2xl text-green-700">Phonics Garden</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <div className="bg-gray-200 rounded-full h-3 w-32 overflow-hidden">
              <motion.div
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${progress}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm font-bold text-green-700">{completedPhonemes.length}/42</span>
          </div>
          <div className="flex items-center gap-1 bg-yellow-50 rounded-full px-3 py-1 border border-yellow-200">
            <span className="text-xl">{profileAvatarId}</span>
            <span className="font-bold text-yellow-800 text-sm">{profileName}</span>
          </div>
        </div>
      </header>

      {/* Garden SVG */}
      <div className="relative w-full" style={{ paddingBottom: "85%" }}>
        <svg
          viewBox="0 0 800 650"
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Sky */}
          <defs>
            <radialGradient id="sunGlow" cx="50%" cy="10%" r="40%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="800" height="650" fill="url(#sunGlow)" />

          {/* Sun */}
          <circle cx="720" cy="60" r="40" fill="#fbbf24" opacity="0.9" />
          {[0,45,90,135,180,225,270,315].map(angle => (
            <line key={angle}
              x1={720 + Math.cos(angle * Math.PI/180) * 45}
              y1={60 + Math.sin(angle * Math.PI/180) * 45}
              x2={720 + Math.cos(angle * Math.PI/180) * 58}
              y2={60 + Math.sin(angle * Math.PI/180) * 58}
              stroke="#fbbf24" strokeWidth="4" strokeLinecap="round"
            />
          ))}

          {/* Clouds */}
          {[[80, 70], [250, 50], [500, 40]].map(([x, y], i) => (
            <g key={i} opacity="0.8">
              <ellipse cx={x} cy={y} rx="40" ry="20" fill="white" />
              <ellipse cx={x+25} cy={y-5} rx="30" ry="18" fill="white" />
              <ellipse cx={x-20} cy={y+2} rx="25" ry="15" fill="white" />
            </g>
          ))}

          {/* Ground */}
          <rect x="0" y="500" width="800" height="150" fill="#4ade80" opacity="0.4" rx="10" />
          <ellipse cx="400" cy="500" rx="420" ry="30" fill="#86efac" opacity="0.5" />

          {/* Flowers */}
          {GROUP_POSITIONS.map((pos, i) => (
            <Flower
              key={i + 1}
              group={i + 1}
              position={pos}
              viewportWidth={800}
              viewportHeight={550}
            />
          ))}

          {/* Butterflies decorative */}
          <text x="620" y="280" fontSize="24">🦋</text>
          <text x="100" y="400" fontSize="20">🐝</text>
          <text x="350" y="480" fontSize="18">🌻</text>
        </svg>
      </div>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-green-200 flex justify-around items-center py-2 px-4 z-20">
        <Link href="/" className="flex flex-col items-center gap-1 text-green-700">
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

      <div className="h-20" /> {/* Bottom nav spacer */}
    </div>
  );
}
