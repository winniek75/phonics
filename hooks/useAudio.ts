"use client";
import { useCallback, useRef } from "react";
import { speakText, isWord } from "@/src/utils/googleTTS";

interface AudioOptions {
  useTTS?: boolean;
  lang?: string;
  rate?: number;
}

export function useAudio() {
  const currentRef = useRef<HTMLAudioElement | null>(null);
  const isSpeakingRef = useRef(false);

  const play = useCallback((path: string, options: AudioOptions = {}) => {
    // Stop current audio
    if (currentRef.current) {
      currentRef.current.pause();
      currentRef.current = null;
    }

    // Stop current speech synthesis
    if (isSpeakingRef.current && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      isSpeakingRef.current = false;
    }

    if (typeof window === "undefined") return;

    // パスから単語を抽出（例: "/audio/words/sun.mp3" -> "sun"）
    const wordMatch = path.match(/\/words\/([^/]+)\.mp3$/);
    const shouldUseTTS = options.useTTS || wordMatch !== null;

    if (shouldUseTTS && wordMatch) {
      const word = wordMatch[1];

      // Web Speech APIを使用して単語を読み上げ
      if ('speechSynthesis' in window && isWord(word)) {
        isSpeakingRef.current = true;
        speakText(word, {
          lang: options.lang || 'en-US',
          rate: options.rate || 0.9
        })
        .catch(err => {
          console.warn(`TTS failed for word "${word}":`, err);
          // フォールバック: オーディオファイルを再生
          playAudioFile(path);
        })
        .finally(() => {
          isSpeakingRef.current = false;
        });
        return;
      }
    }

    // 通常のオーディオファイル再生
    playAudioFile(path);

    function playAudioFile(audioPath: string) {
      const audio = new Audio(audioPath);
      currentRef.current = audio;

      audio.addEventListener("error", () => {
        // 音声ファイルが見つからない場合、単語ならTTSで読み上げ
        if (wordMatch && wordMatch[1]) {
          const word = wordMatch[1];
          if ('speechSynthesis' in window && isWord(word)) {
            console.info(`Audio file not found, using TTS for: ${word}`);
            isSpeakingRef.current = true;
            speakText(word, {
              lang: options.lang || 'en-US',
              rate: options.rate || 0.9
            })
            .catch(err => console.warn(`TTS also failed:`, err))
            .finally(() => {
              isSpeakingRef.current = false;
            });
          } else {
            console.warn(`Audio not found and TTS not available: ${audioPath}`);
          }
        } else {
          console.warn(`Audio not found: ${audioPath}`);
        }
      });

      audio.play().catch(() => {
        console.warn(`Could not play audio: ${audioPath}`);
      });
    }

    return () => {
      if (currentRef.current) {
        currentRef.current.pause();
      }
      if (isSpeakingRef.current && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        isSpeakingRef.current = false;
      }
    };
  }, []);

  const stop = useCallback(() => {
    if (currentRef.current) {
      currentRef.current.pause();
      currentRef.current = null;
    }
    if (isSpeakingRef.current && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      isSpeakingRef.current = false;
    }
  }, []);

  // 単語専用の読み上げ関数
  const speakWord = useCallback((word: string, options: AudioOptions = {}) => {
    if (typeof window === "undefined" || !('speechSynthesis' in window)) {
      console.warn('Speech synthesis not available');
      return;
    }

    // 既存の音声を停止
    stop();

    isSpeakingRef.current = true;
    speakText(word, {
      lang: options.lang || 'en-US',
      rate: options.rate || 0.9
    })
    .catch(err => {
      console.warn(`Failed to speak word "${word}":`, err);
    })
    .finally(() => {
      isSpeakingRef.current = false;
    });
  }, [stop]);

  return { play, stop, speakWord };
}