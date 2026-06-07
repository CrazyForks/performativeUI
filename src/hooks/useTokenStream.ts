import { useEffect, useRef, useState } from "react";

export interface UseTokenStreamOptions {
  text: string;
  /** [min, max] ms between tokens. Single number → fixed delay. */
  speedMs?: number | [number, number];
  /** Tokenizer: split text into atoms. Default: words+whitespace. */
  tokenize?: (text: string) => string[];
  loop?: boolean;
  /** ms to wait after a full pass before clearing & restarting. */
  loopDelayMs?: number;
  onComplete?: () => void;
}

export interface UseTokenStreamResult {
  output: string;
  isStreaming: boolean;
  isComplete: boolean;
}

const defaultTokenize = (s: string) => s.split(/(\s+)/);

/**
 * Reveals `text` token-by-token. The fake AI-streaming demo.
 */
export function useTokenStream({
  text,
  speedMs = [18, 80],
  tokenize = defaultTokenize,
  loop = false,
  loopDelayMs = 6000,
  onComplete,
}: UseTokenStreamOptions): UseTokenStreamResult {
  const [output, setOutput] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const tokens = tokenize(text);

    const pickDelay = () =>
      Array.isArray(speedMs)
        ? speedMs[0] + Math.random() * (speedMs[1] - speedMs[0])
        : speedMs;

    const run = () => {
      let i = 0;
      let buf = "";
      const tick = () => {
        if (cancelled) return;
        if (i >= tokens.length) {
          setIsComplete(true);
          onCompleteRef.current?.();
          if (loop) {
            timer = setTimeout(() => {
              if (cancelled) return;
              setIsComplete(false);
              setOutput("");
              run();
            }, loopDelayMs);
          }
          return;
        }
        buf += tokens[i];
        i += 1;
        setOutput(buf);
        timer = setTimeout(tick, pickDelay());
      };
      tick();
    };
    run();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { output, isStreaming: !isComplete, isComplete };
}
