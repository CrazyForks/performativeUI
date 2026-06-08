import { useEffect, useRef, useState } from "react";

export interface UseTypewriterOptions {
  words: string[];
  /** ms per character while typing */
  typeMs?: number;
  /** ms per character while deleting */
  deleteMs?: number;
  /** ms to hold the fully-typed word before deleting */
  holdMs?: number;
  /** stop after a single pass through `words` */
  loop?: boolean;
  /** fired each time a full word is displayed (end of type) */
  onWordReached?: (word: string, index: number) => void;
}

export interface UseTypewriterResult {
  word: string;
  /** index of the *target* word (the one currently being typed/deleted) */
  index: number;
  isDeleting: boolean;
  isComplete: boolean;
}

/**
 * Headless typewriter. Returns the in-progress text on every tick;
 * pair with any UI you like.
 */
export function useTypewriter({
  words,
  typeMs = 70,
  deleteMs = 32,
  holdMs = 1500,
  loop = true,
  onWordReached,
}: UseTypewriterOptions): UseTypewriterResult {
  const [word, setWord] = useState("");
  const [index, setIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Latest values via ref so the recursive timer doesn't capture stale state.
  const stateRef = useRef({ word, index, isDeleting });
  stateRef.current = { word, index, isDeleting };

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;
    if (!words.length) return;

    const tick = () => {
      if (cancelled) return;
      const { word: curWord, index: curIdx, isDeleting: curDel } = stateRef.current;
      const target = words[curIdx];
      const next = curDel
        ? target.slice(0, curWord.length - 1)
        : target.slice(0, curWord.length + 1);
      setWord(next);

      if (!curDel && next === target) {
        onWordReached?.(target, curIdx);
        if (!loop && curIdx === words.length - 1) {
          setIsComplete(true);
          return;
        }
        timer = setTimeout(() => {
          if (cancelled) return;
          setIsDeleting(true);
          timer = setTimeout(tick, deleteMs);
        }, holdMs);
        return;
      }
      if (curDel && next === "") {
        setIsDeleting(false);
        setIndex((i) => (i + 1) % words.length);
      }
      timer = setTimeout(tick, curDel ? deleteMs : typeMs);
    };

    timer = setTimeout(tick, typeMs);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
    // We deliberately don't depend on words/typeMs/etc, the effect resets
    // the loop only on mount. Consumers wanting to swap word lists should
    // remount the host component (key=...).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { word, index, isDeleting, isComplete };
}
