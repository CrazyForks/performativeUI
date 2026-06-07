import { useEffect, useState } from "react";

export interface UseCounterOptions {
  target: number;
  /** ms of total animation. */
  durationMs?: number;
  /** Starting value. Defaults to 0. */
  from?: number;
  /** Easing fn (t∈[0,1]). Default ease-out-cubic. */
  ease?: (t: number) => number;
}

/**
 * Animates a number from `from` to `target` over `durationMs` and returns
 * the current integer value. Restarts on mount only.
 */
export function useCounter({
  target,
  durationMs = 1800,
  from = 0,
  ease = (t) => 1 - Math.pow(1 - t, 3),
}: UseCounterOptions): number {
  const [value, setValue] = useState(from);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      setValue(Math.floor(from + (target - from) * ease(t)));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return value;
}
