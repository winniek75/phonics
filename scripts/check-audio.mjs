#!/usr/bin/env node
/**
 * 音声ファイル網羅チェック
 *  - data/phonemes.ts / data/trickyWords.ts とゲームが参照する /audio/... を全て列挙
 *  - public/ に実在するか（大文字小文字の違いも含めて）確認
 *  - 実在するファイル一覧を data/audioManifest.json に書き出す
 *    （hooks/useAudio.ts が「ファイルがあれば再生、無ければ読み上げ」に使う）
 *
 * 使い方: node scripts/check-audio.mjs          （npm run build の前に自動実行）
 *         node scripts/check-audio.mjs --list   （欠落ファイルを全件表示）
 *         node scripts/check-audio.mjs --strict （欠落があれば exit 1）
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pub = path.join(root, "public");
const read = (f) => fs.readFileSync(path.join(root, f), "utf8");

const refs = new Map(); // path -> where
const add = (p, where) => { if (!refs.has(p)) refs.set(p, where); };

// 1) データに直接書かれているパス
for (const f of ["data/phonemes.ts", "data/trickyWords.ts"]) {
  for (const m of read(f).matchAll(/["'`](\/audio\/[^"'`$]+\.mp3)["'`]/g)) add(m[1], f);
}
// 2) exampleWords（wordAudioFiles に無い語は `/audio/words/${word}.mp3` で参照される）
const src = read("data/phonemes.ts");
const words = new Set();
for (const m of src.matchAll(/exampleWords:\s*\[([^\]]*)\]/g)) {
  for (const w of m[1].matchAll(/["']([^"']+)["']/g)) {
    words.add(w[1]);
    add(`/audio/words/${w[1]}.mp3`, "data/phonemes.ts (exampleWords)");
  }
}
// 3) Blending ゲーム: 単語の1文字ずつ `/audio/phonemes/${letter}.mp3`
for (const w of words) {
  if (w.length >= 3 && w.length <= 5) {
    for (const c of w) add(`/audio/phonemes/${c}.mp3`, "app/games/blending (1文字ずつ)");
  }
}

// public 内の実ファイル
const existing = [];
(function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full);
    else existing.push("/" + path.relative(pub, full).split(path.sep).join("/"));
  }
})(path.join(pub, "audio"));
existing.sort();
const lower = new Map(existing.map((p) => [p.toLowerCase(), p]));

const ok = [], caseMismatch = [], missing = [];
for (const p of [...refs.keys()].sort()) {
  if (existing.includes(p)) ok.push(p);
  else if (lower.has(p.toLowerCase())) caseMismatch.push([p, lower.get(p.toLowerCase())]);
  else missing.push(p);
}
const unused = existing.filter((p) => !refs.has(p));

fs.writeFileSync(path.join(root, "data/audioManifest.json"), JSON.stringify(existing, null, 2) + "\n");

const byDir = (list) => list.reduce((a, p) => { const d = path.posix.dirname(p); a[d] = (a[d] || 0) + 1; return a; }, {});
console.log(`[check-audio] 参照 ${refs.size} 件 / 実在 ${ok.length} / 大文字小文字違い ${caseMismatch.length} / 欠落 ${missing.length}`);
if (caseMismatch.length) {
  console.log("  大文字小文字が違うファイル（Vercel では 404 になります）:");
  for (const [want, got] of caseMismatch) console.log(`    参照 ${want}  ←→  実ファイル ${got}`);
}
if (missing.length) {
  console.log("  欠落（読み上げ機能で代用されます）:", JSON.stringify(byDir(missing)));
  if (process.argv.includes("--list")) for (const p of missing) console.log(`    ${p}   (${refs.get(p)})`);
  else console.log("  全件表示: node scripts/check-audio.mjs --list");
}
if (unused.length) console.log(`  参照されていないファイル: ${unused.length} 件`, unused.slice(0, 10));
if (process.argv.includes("--strict") && (missing.length || caseMismatch.length)) process.exit(1);
