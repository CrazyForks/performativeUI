import {
  forwardRef,
  useMemo,
  type ComponentPropsWithoutRef,
  type CSSProperties,
} from "react";
import { cn } from "../utils/cn";

export interface AuroraProps extends ComponentPropsWithoutRef<"div"> {
  /** Color blobs. Each {color, x, y, size} renders one radial gradient. */
  blobs?: Array<{ color: string; x: number; y: number; size?: number }>;
  /** Blur amount in px. */
  blur?: number;
  /** Disable the slow drift animation. */
  static?: boolean;
}

const DEFAULT_BLOBS: NonNullable<AuroraProps["blobs"]> = [
  { color: "rgba(124,58,237,0.45)", x: 20, y: 30, size: 60 },
  { color: "rgba(236,72,153,0.35)", x: 80, y: 25, size: 50 },
  { color: "rgba(6,182,212,0.30)",  x: 50, y: 80, size: 50 },
];

/**
 * The three-blob drifting gradient that powers the entire AI hero
 * background trade. Renders inside a `position: relative` parent.
 */
export const Aurora = forwardRef<HTMLDivElement, AuroraProps>(
  ({ blobs = DEFAULT_BLOBS, blur = 50, static: isStatic, className, style, ...rest }, ref) => {
    const bg = useMemo(
      () =>
        blobs
          .map(
            (b) =>
              `radial-gradient(${b.size ?? 50}% ${b.size ?? 50}% at ${b.x}% ${b.y}%, ${b.color} 0%, transparent 65%)`,
          )
          .join(","),
      [blobs],
    );
    const merged: CSSProperties = {
      ...style,
      background: bg,
      filter: `blur(${blur}px) saturate(140%)`,
    };
    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={cn("pui-aurora", !isStatic && "pui-aurora--drift", className)}
        style={merged}
        {...rest}
      />
    );
  },
);
Aurora.displayName = "Aurora";
