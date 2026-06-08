import {
  forwardRef,
  useEffect,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
} from "react";
import { cn } from "../utils/cn";

export interface WordRollProps extends ComponentPropsWithoutRef<"span"> {
  /** Words to cycle through. */
  words: string[];
  /** ms each word holds before rolling out. Default 2200. */
  intervalMs?: number;
  /** ms of the slide animation. Default 500. */
  transitionMs?: number;
  /** Direction the active word rolls in from. */
  direction?: "up" | "down";
  /**
   * Paint each word with the AI gradient. Use this instead of nesting
   * inside `<GradientText>`, `background-clip: text` doesn't apply to
   * absolutely-positioned descendants, so the wrapping pattern paints
   * nothing.
   */
  gradient?: boolean;
}

/**
 * Vertical word roll, the active word slides into view while the previous
 * one rolls out, no typing. The "supermemory.ai" / pc-agent-text effect.
 *
 *     <WordRoll words={["doctors", "lawyers", "founders"]} />
 *
 * Container width follows the current word, so it sits naturally inline.
 */
export const WordRoll = forwardRef<HTMLSpanElement, WordRollProps>(
  (
    {
      words,
      intervalMs = 2200,
      transitionMs = 500,
      direction = "up",
      gradient,
      className,
      style,
      ...rest
    },
    ref,
  ) => {
    const [i, setI] = useState(0);

    useEffect(() => {
      if (!words.length) return;
      const t = setInterval(
        () => setI((j) => (j + 1) % words.length),
        intervalMs,
      );
      return () => clearInterval(t);
    }, [intervalMs, words.length]);

    const merged: CSSProperties = {
      ...style,
      ["--pui-roll-ms" as string]: `${transitionMs}ms`,
    };

    const prev = (i - 1 + words.length) % words.length;

    return (
      <span
        ref={ref}
        className={cn(
          "pui-roll",
          direction === "down" && "pui-roll--down",
          gradient && "pui-roll--gradient",
          className,
        )}
        style={merged}
        {...rest}
      >
        {/* Sizer keeps the container width matched to the active word
            (without it, the absolutely-positioned words collapse the box). */}
        <span className="pui-roll__sizer" aria-hidden="true">
          {words[i]}
        </span>
        {words.map((w, idx) => (
          <span
            key={idx}
            className={cn(
              "pui-roll__word",
              idx === i && "pui-roll__word--active",
              idx === prev && i !== prev && "pui-roll__word--past",
            )}
            aria-hidden={idx === i ? undefined : "true"}
          >
            {w}
          </span>
        ))}
      </span>
    );
  },
);
WordRoll.displayName = "WordRoll";
