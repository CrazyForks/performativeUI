import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type CSSProperties,
} from "react";
import { cn } from "../utils/cn";

export type QuestTextAnimation = "wave" | "scroll" | "slide";

export type QuestTextPreset =
  | "flash1"
  | "flash2"
  | "flash3"
  | "glow1"
  | "glow2"
  | "glow3";

/**
 * Accept any CSS color string in addition to the named presets.
 * The `(string & {})` half keeps the union "open" so arbitrary
 * strings type-check while autocomplete still surfaces the preset
 * names. Pass "#ffd700", "gold", "var(--my-color)", whatever.
 */
export type QuestTextColor = QuestTextPreset | (string & {});

const PRESET_NAMES: Set<string> = new Set([
  "flash1",
  "flash2",
  "flash3",
  "glow1",
  "glow2",
  "glow3",
]);

export interface QuestTextProps
  extends Omit<ComponentPropsWithoutRef<"span">, "color"> {
  /** The text to render. Required. */
  text: string;
  /** Motion treatment. Default "wave". */
  animation?: QuestTextAnimation;
  /**
   * Color treatment. flash1-3 hard-cut between two pure colors;
   * glow1-3 smooth-cycle through 3-4 pure colors. Pass any CSS
   * color string (e.g. "#FFFF00", "gold", "var(--brand)") to skip
   * the animated cycle and set a flat color instead. Default
   * "glow1".
   */
  color?: QuestTextColor;
}

export const QuestText = forwardRef<HTMLSpanElement, QuestTextProps>(
  (
    {
      text,
      animation = "wave",
      color = "glow1",
      className,
      style,
      ...rest
    },
    ref,
  ) => {
    const isPreset = PRESET_NAMES.has(color);
    const presetClass = isPreset ? `pui-quest--${color}` : undefined;
    const colorStyle: CSSProperties | undefined = isPreset
      ? undefined
      : ({ color } satisfies CSSProperties);

    // Wave splits into per-char spans so each char can ride its own
    // phase of the wave animation. Negative delays mean every char
    // starts moving on the first frame but at a different point in
    // the cycle, which produces a traveling-wave shape immediately.
    if (animation === "wave") {
      const chars = [...text];
      return (
        <span
          ref={ref}
          className={cn(
            "pui-quest",
            "pui-quest--wave",
            presetClass,
            className,
          )}
          style={{ ...colorStyle, ...style }}
          {...rest}
        >
          {chars.map((ch, i) => (
            <span
              key={i}
              className="pui-quest__char"
              style={{ animationDelay: `${-(i + 1) * 50}ms` }}
            >
              {ch === " " ? " " : ch}
            </span>
          ))}
        </span>
      );
    }

    // Scroll and slide put motion on a nested span so a color
    // preset animation on the parent doesn't collide with the
    // motion animation on the child.
    const motionClass =
      animation === "scroll" ? "pui-quest__scroll" : "pui-quest__slide";

    return (
      <span
        ref={ref}
        className={cn(
          "pui-quest",
          `pui-quest--${animation}`,
          presetClass,
          className,
        )}
        style={{ ...colorStyle, ...style }}
        {...rest}
      >
        <span className={motionClass}>{text}</span>
      </span>
    );
  },
);
QuestText.displayName = "QuestText";
