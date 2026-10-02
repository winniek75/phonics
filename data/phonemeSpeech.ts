/**
 * 録音ファイル（public/audio/phonemes/*.mp3）が無いときの「読み上げ機能」用テキスト。
 *
 * ブラウザの読み上げ（speechSynthesis）は音素を単独で正確に発音できないため、
 * ここにあるのは「近い音になる綴り」の代用です。正式な教材としては
 * 録音ファイルを public/audio/phonemes/ に置いてください（置けば自動でそちらが使われます）。
 */
export const phonemeSpeech: Record<string, string> = {
  // Group 1
  s: "sss", a: "ah", t: "tuh", i: "ih", p: "puh", n: "nnn",
  // Group 2
  ck: "kuh", e: "eh", h: "huh", r: "rrr", m: "mmm", d: "duh",
  // Group 3
  g: "guh", o: "aw", u: "uh", l: "lll", f: "fff", b: "buh",
  // Group 4
  ai: "ay", j: "juh", oa: "oh", ie: "eye", ee: "ee", or: "or",
  // Group 5
  z: "zzz", w: "wuh", ng: "ing", v: "vvv", oo_short: "oo", oo_long: "ooh",
  // Group 6
  y: "yuh", x: "ks", ch: "chuh", sh: "shh", th_voiced: "the", th_unvoiced: "th",
  // Group 7
  qu: "kwuh", ou: "ow", oi: "oy", ue: "you", er: "er", ar: "are",
  // Blending ゲームが1文字ずつ再生するときに使う（音素IDに無い文字）
  c: "kuh", k: "kuh", q: "kwuh",
};
