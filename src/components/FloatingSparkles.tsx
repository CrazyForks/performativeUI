import {
  forwardRef,
  useMemo,
  type ComponentPropsWithoutRef,
} from "react";
import { cn } from "../utils/cn";

export interface FloatingSparklesProps extends ComponentPropsWithoutRef<"div"> {
  /** How many sparkles to render. */
  count?: number;
  /** Pool of glyphs to pick from. */
  glyphs?: string[];
  /** [min, max] seconds for the float-up duration. */
  durationS?: [number, number];
  /** [min, max] px font size. */
  sizeRange?: [number, number];
}

/**
 * A field of ✦ glyphs slowly drifting upward across the parent. Pure CSS
 * animation; sits absolutely inside its `position: relative` parent.
 */
export const FloatingSparkles = forwardRef<HTMLDivElement, FloatingSparklesProps>(
  (
    {
      count = 18,
      glyphs = ["✦", "✧", "✶", "✺", "✹", "·"],
      durationS = [8, 18],
      sizeRange = [8, 20],
      className,
      ...rest
    },
    ref,
  ) => {
    // Stable per-mount randomization (won't reshuffle on every render).
    const items = useMemo(
      () =>
        Array.from({ length: count }, () => ({
          glyph: glyphs[Math.floor(Math.random() * glyphs.length)],
          left: Math.random() * 100,
          duration: durationS[0] + Math.random() * (durationS[1] - durationS[0]),
          delay: Math.random() * durationS[1],
          size: sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0]),
          opacity: 0.4 + Math.random() * 0.5,
        })),
      [count, glyphs, durationS, sizeRange],
    );

    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={cn("pui-sparkle-field", className)}
        {...rest}
      >
        {items.map((it, i) => (
          <span
            key={i}
            className="pui-sparkle-field__item"
            style={{
              left: `${it.left}%`,
              fontSize: `${it.size}px`,
              opacity: it.opacity,
              animationDuration: `${it.duration}s`,
              animationDelay: `${it.delay}s`,
            }}
          >
            {it.glyph}
          </span>
        ))}
      </div>
    );
  },
);
FloatingSparkles.displayName = "FloatingSparkles";
