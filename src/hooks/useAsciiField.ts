import { RefObject, useEffect, useMemo, useRef } from "react";

export interface UseAsciiFieldOptions {
  cols?: number;
  rows?: number;
  /** Characters from sparsest to densest. */
  charRamp?: string;
  /** Strength of the cursor ripple. */
  rippleStrength?: number;
  /** Radius (in cells) of the cursor ripple. */
  rippleRadius?: number;
  /** Disable the cursor reactivity (purely ambient). */
  reactive?: boolean;
  /** ms throttle between frames. */
  frameMs?: number;
}

const DEFAULT_RAMP =
  " .`'\",:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";

/**
 * Drives a <pre> ref with a procedural ASCII field that reacts to the cursor.
 * Returns nothing — the hook owns the DOM textContent + handlers.
 */
export function useAsciiField<T extends HTMLElement>(
  ref: RefObject<T>,
  {
    cols = 78,
    rows = 22,
    charRamp = DEFAULT_RAMP,
    rippleStrength = 1.4,
    rippleRadius = 6,
    reactive = true,
    frameMs = 50,
  }: UseAsciiFieldOptions = {},
): void {
  // Precompute baseline field once per cols/rows.
  const baseField = useMemo(() => {
    const f = new Float32Array(cols * rows);
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const nx = (x / cols) * 2 - 1;
        const ny = (y / rows) * 2 - 1;
        const r = Math.sqrt(nx * nx + ny * ny);
        const stripes = 0.5 + 0.5 * Math.sin(nx * 6 + ny * 2);
        const radial = 1 - Math.min(1, r * 1.2);
        f[y * cols + x] = 0.25 * stripes + 0.55 * radial;
      }
    }
    return f;
  }, [cols, rows]);

  const mouse = useRef({ x: -999, y: -999 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let lastFrame = 0;

    const render = (t: number) => {
      if (t - lastFrame < frameMs) {
        raf = requestAnimationFrame(render);
        return;
      }
      lastFrame = t;
      const time = t * 0.001;
      const rect = el.getBoundingClientRect();
      const cellW = rect.width / cols;
      const cellH = rect.height / rows;
      const cx = (mouse.current.x - rect.left) / cellW;
      const cy = (mouse.current.y - rect.top) / cellH;

      let out = "";
      const rampMax = charRamp.length - 1;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const base = baseField[y * cols + x];
          const wave =
            0.15 *
            Math.sin(x * 0.18 + time * 1.4) *
            Math.cos(y * 0.22 - time * 1.1);
          const dx = x - cx;
          const dy = (y - cy) * 1.8;
          const d = Math.sqrt(dx * dx + dy * dy);
          const ripple =
            reactive && mouse.current.x > 0
              ? rippleStrength * Math.exp(-(d * d) / 80) -
                0.6 *
                  Math.exp(
                    -((d - rippleRadius) * (d - rippleRadius)) / 30,
                  )
              : 0;
          const v = Math.max(0, Math.min(1, base + wave + ripple));
          out += charRamp[Math.floor(v * rampMax)];
        }
        out += "\n";
      }
      el.textContent = out;
      raf = requestAnimationFrame(render);
    };

    const onMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };
    const onLeave = () => {
      mouse.current.x = -999;
      mouse.current.y = -999;
    };
    if (reactive) {
      el.addEventListener("mousemove", onMove);
      el.addEventListener("mouseleave", onLeave);
    }
    raf = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(raf);
      if (reactive) {
        el.removeEventListener("mousemove", onMove);
        el.removeEventListener("mouseleave", onLeave);
      }
    };
  }, [ref, baseField, cols, rows, charRamp, rippleStrength, rippleRadius, reactive, frameMs]);
}
