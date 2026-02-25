export interface LetterSVGPath {
  id: string;
  viewBox: string;
  strokes: {
    d: string;
    order: number;
  }[];
}

// Simplified SVG paths for letter stroke animations
// These are stylized paths suitable for animated writing demonstrations
export const svgPaths: Record<string, LetterSVGPath> = {
  a: {
    id: "a",
    viewBox: "0 0 100 120",
    strokes: [
      { d: "M 65 40 A 25 25 0 1 0 65 80 L 65 90", order: 1 },
    ],
  },
  b: {
    id: "b",
    viewBox: "0 0 100 120",
    strokes: [
      { d: "M 30 10 L 30 90", order: 1 },
      { d: "M 30 40 Q 75 40 75 55 Q 75 70 30 70", order: 2 },
    ],
  },
  c: {
    id: "c",
    viewBox: "0 0 100 120",
    strokes: [
      { d: "M 70 42 A 28 28 0 1 0 70 78", order: 1 },
    ],
  },
  d: {
    id: "d",
    viewBox: "0 0 100 120",
    strokes: [
      { d: "M 60 40 A 25 25 0 1 0 60 80", order: 1 },
      { d: "M 60 10 L 60 90", order: 2 },
    ],
  },
  e: {
    id: "e",
    viewBox: "0 0 100 120",
    strokes: [
      { d: "M 70 60 L 32 60 A 20 20 0 1 1 70 78", order: 1 },
    ],
  },
  f: {
    id: "f",
    viewBox: "0 0 100 120",
    strokes: [
      { d: "M 65 20 Q 70 10 60 10 L 40 15 Q 30 20 30 30 L 30 90", order: 1 },
      { d: "M 25 50 L 60 50", order: 2 },
    ],
  },
  g: {
    id: "g",
    viewBox: "0 0 100 140",
    strokes: [
      { d: "M 65 45 A 25 25 0 1 0 65 75 L 65 100 Q 65 115 40 115 Q 25 115 25 105", order: 1 },
    ],
  },
  h: {
    id: "h",
    viewBox: "0 0 100 120",
    strokes: [
      { d: "M 30 10 L 30 90", order: 1 },
      { d: "M 30 50 Q 50 35 65 50 L 65 90", order: 2 },
    ],
  },
  i: {
    id: "i",
    viewBox: "0 0 100 120",
    strokes: [
      { d: "M 50 45 L 50 90", order: 1 },
      { d: "M 50 28 A 3 3 0 0 0 50 22", order: 2 },
    ],
  },
  j: {
    id: "j",
    viewBox: "0 0 100 140",
    strokes: [
      { d: "M 55 45 L 55 100 Q 55 115 40 115 Q 28 115 28 105", order: 1 },
      { d: "M 55 28 A 3 3 0 0 0 55 22", order: 2 },
    ],
  },
  k: {
    id: "k",
    viewBox: "0 0 100 120",
    strokes: [
      { d: "M 30 10 L 30 90", order: 1 },
      { d: "M 65 45 L 30 65 L 65 90", order: 2 },
    ],
  },
  l: {
    id: "l",
    viewBox: "0 0 100 120",
    strokes: [
      { d: "M 45 15 L 45 85 Q 45 90 55 90", order: 1 },
    ],
  },
  m: {
    id: "m",
    viewBox: "0 0 100 120",
    strokes: [
      { d: "M 20 90 L 20 50 Q 20 38 30 38 Q 40 38 42 50 Q 44 38 55 38 Q 65 38 65 50 L 65 90", order: 1 },
    ],
  },
  n: {
    id: "n",
    viewBox: "0 0 100 120",
    strokes: [
      { d: "M 25 90 L 25 45 Q 25 38 38 38 Q 52 38 55 52 L 55 90", order: 1 },
    ],
  },
  o: {
    id: "o",
    viewBox: "0 0 100 120",
    strokes: [
      { d: "M 65 60 A 25 25 0 1 0 64.9 60", order: 1 },
    ],
  },
  p: {
    id: "p",
    viewBox: "0 0 100 140",
    strokes: [
      { d: "M 30 45 L 30 115", order: 1 },
      { d: "M 30 45 Q 30 38 50 38 Q 68 38 68 60 Q 68 80 30 80", order: 2 },
    ],
  },
  q: {
    id: "q",
    viewBox: "0 0 100 140",
    strokes: [
      { d: "M 60 60 A 25 25 0 1 0 60.1 60", order: 1 },
      { d: "M 60 45 L 60 115", order: 2 },
    ],
  },
  r: {
    id: "r",
    viewBox: "0 0 100 120",
    strokes: [
      { d: "M 28 90 L 28 45 Q 28 38 38 38 Q 52 35 55 48", order: 1 },
    ],
  },
  s: {
    id: "s",
    viewBox: "0 0 100 120",
    strokes: [
      { d: "M 65 45 Q 65 35 50 35 Q 32 35 32 52 Q 32 65 50 65 Q 70 65 70 78 Q 70 92 50 92 Q 32 92 30 80", order: 1 },
    ],
  },
  t: {
    id: "t",
    viewBox: "0 0 100 120",
    strokes: [
      { d: "M 50 15 L 50 90", order: 1 },
      { d: "M 28 42 L 68 42", order: 2 },
    ],
  },
  u: {
    id: "u",
    viewBox: "0 0 100 120",
    strokes: [
      { d: "M 28 40 L 28 70 Q 28 90 50 90 Q 70 90 70 70 L 70 40", order: 1 },
    ],
  },
  v: {
    id: "v",
    viewBox: "0 0 100 120",
    strokes: [
      { d: "M 25 40 L 50 90 L 75 40", order: 1 },
    ],
  },
  w: {
    id: "w",
    viewBox: "0 0 100 120",
    strokes: [
      { d: "M 15 40 L 30 85 L 50 60 L 70 85 L 85 40", order: 1 },
    ],
  },
  x: {
    id: "x",
    viewBox: "0 0 100 120",
    strokes: [
      { d: "M 28 40 L 72 90", order: 1 },
      { d: "M 72 40 L 28 90", order: 2 },
    ],
  },
  y: {
    id: "y",
    viewBox: "0 0 100 140",
    strokes: [
      { d: "M 25 40 L 50 68", order: 1 },
      { d: "M 75 40 L 50 68 L 35 110", order: 2 },
    ],
  },
  z: {
    id: "z",
    viewBox: "0 0 100 120",
    strokes: [
      { d: "M 28 40 L 72 40 L 28 88 L 72 88", order: 1 },
    ],
  },
  // Digraphs
  ai: {
    id: "ai",
    viewBox: "0 0 160 120",
    strokes: [
      { d: "M 15 90 L 40 40 L 65 90", order: 1 },
      { d: "M 25 72 L 55 72", order: 2 },
      { d: "M 90 45 L 90 90", order: 3 },
      { d: "M 90 28 A 3 3 0 0 0 90 22", order: 4 },
    ],
  },
  oa: {
    id: "oa",
    viewBox: "0 0 160 120",
    strokes: [
      { d: "M 115 60 A 25 25 0 1 0 114.9 60", order: 1 },
      { d: "M 65 40 A 25 25 0 1 0 65 80 L 65 90", order: 2 },
    ],
  },
  ie: {
    id: "ie",
    viewBox: "0 0 160 120",
    strokes: [
      { d: "M 25 45 L 25 90", order: 1 },
      { d: "M 25 28 A 3 3 0 0 0 25 22", order: 2 },
      { d: "M 120 60 L 82 60 A 20 20 0 1 1 120 78", order: 3 },
    ],
  },
  ee: {
    id: "ee",
    viewBox: "0 0 160 120",
    strokes: [
      { d: "M 70 60 L 32 60 A 20 20 0 1 1 70 78", order: 1 },
      { d: "M 145 60 L 107 60 A 20 20 0 1 1 145 78", order: 2 },
    ],
  },
  or: {
    id: "or",
    viewBox: "0 0 160 120",
    strokes: [
      { d: "M 60 60 A 25 25 0 1 0 59.9 60", order: 1 },
      { d: "M 103 90 L 103 45 Q 103 38 113 38 Q 127 35 130 48", order: 2 },
    ],
  },
  ng: {
    id: "ng",
    viewBox: "0 0 160 140",
    strokes: [
      { d: "M 20 90 L 20 50 Q 20 38 33 38 Q 47 38 50 52 L 50 90", order: 1 },
      { d: "M 115 60 A 25 25 0 1 0 115 100 L 115 110 Q 115 125 90 125 Q 75 125 75 115", order: 2 },
    ],
  },
  oo: {
    id: "oo",
    viewBox: "0 0 160 120",
    strokes: [
      { d: "M 60 60 A 25 25 0 1 0 59.9 60", order: 1 },
      { d: "M 130 60 A 25 25 0 1 0 129.9 60", order: 2 },
    ],
  },
  ch: {
    id: "ch",
    viewBox: "0 0 170 120",
    strokes: [
      { d: "M 70 42 A 28 28 0 1 0 70 78", order: 1 },
      { d: "M 105 10 L 105 90", order: 2 },
      { d: "M 105 50 Q 125 35 140 50 L 140 90", order: 3 },
    ],
  },
  sh: {
    id: "sh",
    viewBox: "0 0 170 120",
    strokes: [
      { d: "M 65 45 Q 65 35 50 35 Q 32 35 32 52 Q 32 65 50 65 Q 70 65 70 78 Q 70 92 50 92 Q 32 92 30 80", order: 1 },
      { d: "M 100 10 L 100 90", order: 2 },
      { d: "M 100 50 Q 120 35 135 50 L 135 90", order: 3 },
    ],
  },
  th: {
    id: "th",
    viewBox: "0 0 170 120",
    strokes: [
      { d: "M 50 15 L 50 90", order: 1 },
      { d: "M 28 42 L 68 42", order: 2 },
      { d: "M 100 10 L 100 90", order: 3 },
      { d: "M 100 50 Q 120 35 135 50 L 135 90", order: 4 },
    ],
  },
  qu: {
    id: "qu",
    viewBox: "0 0 170 140",
    strokes: [
      { d: "M 60 60 A 25 25 0 1 0 59.9 60", order: 1 },
      { d: "M 55 75 L 70 90", order: 2 },
      { d: "M 103 40 L 103 70 Q 103 90 125 90 Q 145 90 145 70 L 145 40", order: 3 },
    ],
  },
  ou: {
    id: "ou",
    viewBox: "0 0 160 120",
    strokes: [
      { d: "M 60 60 A 25 25 0 1 0 59.9 60", order: 1 },
      { d: "M 103 40 L 103 70 Q 103 90 125 90 Q 145 90 145 70 L 145 40", order: 2 },
    ],
  },
  oi: {
    id: "oi",
    viewBox: "0 0 160 120",
    strokes: [
      { d: "M 60 60 A 25 25 0 1 0 59.9 60", order: 1 },
      { d: "M 110 45 L 110 90", order: 2 },
      { d: "M 110 28 A 3 3 0 0 0 110 22", order: 3 },
    ],
  },
  ue: {
    id: "ue",
    viewBox: "0 0 160 120",
    strokes: [
      { d: "M 28 40 L 28 70 Q 28 90 50 90 Q 70 90 70 70 L 70 40", order: 1 },
      { d: "M 145 60 L 107 60 A 20 20 0 1 1 145 78", order: 2 },
    ],
  },
  er: {
    id: "er",
    viewBox: "0 0 160 120",
    strokes: [
      { d: "M 70 60 L 32 60 A 20 20 0 1 1 70 78", order: 1 },
      { d: "M 103 90 L 103 45 Q 103 38 113 38 Q 127 35 130 48", order: 2 },
    ],
  },
  ar: {
    id: "ar",
    viewBox: "0 0 160 120",
    strokes: [
      { d: "M 15 90 L 40 40 L 65 90", order: 1 },
      { d: "M 25 72 L 55 72", order: 2 },
      { d: "M 103 90 L 103 45 Q 103 38 113 38 Q 127 35 130 48", order: 3 },
    ],
  },
  ck: {
    id: "ck",
    viewBox: "0 0 160 120",
    strokes: [
      { d: "M 70 42 A 28 28 0 1 0 70 78", order: 1 },
      { d: "M 100 10 L 100 90", order: 2 },
      { d: "M 135 45 L 100 65 L 135 90", order: 3 },
    ],
  },
};
