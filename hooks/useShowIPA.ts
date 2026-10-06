"use client";
import { useState, useEffect, useCallback } from "react";

const KEY = "phonics-show-ipa";

export function useShowIPA() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(localStorage.getItem(KEY) === "1");
  }, []);

  const toggle = useCallback(() => {
    setShow((prev) => {
      const next = !prev;
      localStorage.setItem(KEY, next ? "1" : "0");
      return next;
    });
  }, []);

  return { showIPA: show, toggleIPA: toggle } as const;
}
