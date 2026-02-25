"use client";
import { useCallback, useRef } from "react";

export function useAudio() {
  const currentRef = useRef<HTMLAudioElement | null>(null);

  const play = useCallback((path: string) => {
    // Stop current audio
    if (currentRef.current) {
      currentRef.current.pause();
      currentRef.current = null;
    }

    if (typeof window === "undefined") return;

    const audio = new Audio(path);
    currentRef.current = audio;

    audio.addEventListener("error", () => {
      console.warn(`Audio not found: ${path}`);
    });

    audio.play().catch(() => {
      console.warn(`Could not play audio: ${path}`);
    });

    return () => {
      audio.pause();
    };
  }, []);

  const stop = useCallback(() => {
    if (currentRef.current) {
      currentRef.current.pause();
      currentRef.current = null;
    }
  }, []);

  return { play, stop };
}
