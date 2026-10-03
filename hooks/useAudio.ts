"use client";
import { useCallback, useRef } from "react";
import { speakText } from "@/src/utils/googleTTS";
import { phonemeSpeech } from "@/data/phonemeSpeech";
import audioManifest from "@/data/audioManifest.json";

interface AudioOptions {
  useTTS?: boolean;
  lang?: string;
  rate?: number;
  /** 読み上げで代用するとき、音のあとに続けて言う単語（例: "sun"） */
  keyword?: string;
  /** 実際に音が出はじめたときに呼ばれる（学習記録用） */
  onPlayed?: () => void;
  /** 録音も読み上げも使えず、音を出せなかったときに呼ばれる */
  onFailed?: () => void;
}

// public/audio 内に実在するファイル（scripts/check-audio.mjs がビルド前に生成）
const existingFiles = new Set<string>(audioManifest as string[]);
// 実行中に読み込みに失敗したファイル（次回から最初から読み上げを使う）
const brokenFiles = new Set<string>();

/**
 * 録音ファイルが無いときに読み上げるテキストを決める。
 *  /audio/phonemes/s.mp3  -> "sss"（近い音の綴り。data/phonemeSpeech.ts）
 *  /audio/words/sun.mp3   -> "sun"
 *  /audio/tricky/the.mp3  -> "the"
 */
export function getSpeechFallback(path: string, keyword?: string): { text: string; rate: number } | null {
  const m = path.match(/\/audio\/(phonemes|words|tricky)\/([^/]+)\.mp3$/);
  if (!m) return null;
  const [, kind, name] = m;
  if (kind === "phonemes") {
    const approx = phonemeSpeech[name];
    if (!approx) return keyword ? { text: keyword, rate: 0.8 } : null;
    return { text: keyword ? `${approx}. ${keyword}` : approx, rate: 0.7 };
  }
  return { text: name.replace(/[_-]/g, " "), rate: 0.9 };
}

export function useAudio() {
  const currentRef = useRef<HTMLAudioElement | null>(null);
  const isSpeakingRef = useRef(false);

  const stop = useCallback(() => {
    if (currentRef.current) {
      currentRef.current.pause();
      currentRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window && isSpeakingRef.current) {
      window.speechSynthesis.cancel();
      isSpeakingRef.current = false;
    }
  }, []);

  const speak = useCallback((text: string, options: AudioOptions, rate: number) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      options.onFailed?.();
      return;
    }
    isSpeakingRef.current = true;
    speakText(text, {
      lang: options.lang || "en-US",
      rate: options.rate || rate,
      onStart: options.onPlayed,
    })
      .catch((err) => {
        // 次の音で中断された場合（interrupted / canceled）は失敗ではない
        const reason = (err as { error?: string })?.error;
        if (reason !== "interrupted" && reason !== "canceled") options.onFailed?.();
      })
      .finally(() => {
        isSpeakingRef.current = false;
      });
  }, []);

  /**
   * 音を再生する。
   * 1. 録音ファイルが public/audio に実在すれば、それを再生
   * 2. 無い／読み込めないときは、ブラウザの読み上げ機能で代用（エラーは出さない）
   */
  const play = useCallback((path: string, options: AudioOptions = {}) => {
    if (typeof window === "undefined") return;
    stop();

    const fallback = getSpeechFallback(path, options.keyword);
    const useFallback = () => {
      if (fallback) speak(fallback.text, options, fallback.rate);
      else options.onFailed?.();
    };

    const hasFile = existingFiles.has(path) && !brokenFiles.has(path);
    if (!hasFile || (options.useTTS && fallback)) {
      // タップ直後に同期で読み上げを始める（iOS は操作直後でないと音が出ないため）
      useFallback();
      return;
    }

    const audio = new Audio(path);
    currentRef.current = audio;
    let handled = false;
    const onError = () => {
      if (handled) return;
      handled = true;
      brokenFiles.add(path);
      if (currentRef.current === audio) currentRef.current = null;
      useFallback();
    };
    audio.addEventListener("playing", () => options.onPlayed?.(), { once: true });
    audio.addEventListener("error", onError);
    audio.play().catch((err: Error) => {
      // 自動再生がブロックされただけ／次の音で中断されただけなら何もしない
      if (err?.name === "NotAllowedError" || err?.name === "AbortError") return;
      onError();
    });
  }, [stop, speak]);

  /**
   * 音素の音を再生する（録音ファイル専用・TTS 代用なし）。
   * TTSは a→"ah", t→"tuh" のように不正確な音を出すため、
   * 音素部分は先生が確認した録音を優先する。
   * 録音がなければ onFailed を呼ぶ（「音声ファイルが必要です」表示用）。
   */
  const playPhoneme = useCallback((path: string, options: AudioOptions = {}) => {
    if (typeof window === "undefined") return;
    stop();

    const hasFile = existingFiles.has(path) && !brokenFiles.has(path);
    if (!hasFile) {
      options.onFailed?.();
      return;
    }

    const audio = new Audio(path);
    currentRef.current = audio;
    let handled = false;
    const onError = () => {
      if (handled) return;
      handled = true;
      brokenFiles.add(path);
      if (currentRef.current === audio) currentRef.current = null;
      options.onFailed?.();
    };
    audio.addEventListener("playing", () => options.onPlayed?.(), { once: true });
    audio.addEventListener("error", onError);
    audio.play().catch((err: Error) => {
      if (err?.name === "NotAllowedError" || err?.name === "AbortError") return;
      onError();
    });
  }, [stop]);

  // 単語・文の読み上げ（録音ファイルを使わない）
  const speakWord = useCallback((word: string, options: AudioOptions = {}) => {
    if (typeof window === "undefined") return;
    stop();
    speak(word, options, 0.9);
  }, [stop, speak]);

  return { play, playPhoneme, stop, speakWord };
}
