import {
  forwardRef,
  useEffect,
  useRef,
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
  /**
   * Lava-lamp mode. Blobs become independent bubbles that drift around,
   * push each other apart, and softly spring back to their home positions.
   * Overrides the simple CSS drift.
   */
  animated?: boolean;
  /**
   * When `animated`, controls how aggressively blobs push each other away.
   * 0 disables interaction; default 0.18.
   */
  repulsion?: number;
}

const DEFAULT_BLOBS: NonNullable<AuroraProps["blobs"]> = [
  { color: "rgba(124,58,237,0.45)", x: 20, y: 30, size: 60 },
  { color: "rgba(236,72,153,0.35)", x: 80, y: 25, size: 50 },
  { color: "rgba(6,182,212,0.30)",  x: 50, y: 80, size: 50 },
];

/**
 * The three-blob drifting gradient that powers the entire AI hero
 * background trade. Renders inside a `position: relative` parent.
 *
 * Default mode renders the blobs as a composite background-image with
 * a slow translate. Pass `animated` to switch to a JS lava-lamp
 * simulation where the blobs interact like bubbles.
 */
export const Aurora = forwardRef<HTMLDivElement, AuroraProps>(
  (
    {
      blobs = DEFAULT_BLOBS,
      blur = 50,
      static: isStatic,
      animated,
      repulsion = 0.18,
      className,
      style,
      ...rest
    },
    ref,
  ) => {
    const blobRefs = useRef<Array<HTMLDivElement | null>>([]);

    useEffect(() => {
      if (!animated) return;
      // Build per-blob simulation state. The position values are kept
      // as percentages of the host container so layout-independent.
      const state = blobs.map((b) => ({
        x: b.x,
        y: b.y,
        homeX: b.x,
        homeY: b.y,
        size: b.size ?? 50,
        vx: (Math.random() - 0.5) * 0.06,
        vy: (Math.random() - 0.5) * 0.06,
      }));

      let raf = 0;
      const tick = () => {
        for (let i = 0; i < state.length; i++) {
          const b = state[i];

          // velocity damping
          b.vx *= 0.965;
          b.vy *= 0.965;

          // soft spring back toward home (keeps the field roughly composed)
          b.vx += (b.homeX - b.x) * 0.0009;
          b.vy += (b.homeY - b.y) * 0.0009;

          // repulsion from every other blob — pushes them apart when
          // they get too close
          for (let j = 0; j < state.length; j++) {
            if (i === j) continue;
            const o = state[j];
            const dx = b.x - o.x;
            const dy = b.y - o.y;
            const d = Math.hypot(dx, dy);
            const minDist = (b.size + o.size) * 0.4;
            if (d < minDist && d > 0.001) {
              const force = ((minDist - d) / minDist) * repulsion;
              b.vx += (dx / d) * force;
              b.vy += (dy / d) * force;
            }
          }

          // tiny brownian jitter for organic feel
          b.vx += (Math.random() - 0.5) * 0.012;
          b.vy += (Math.random() - 0.5) * 0.012;

          // integrate
          b.x += b.vx;
          b.y += b.vy;

          // soft walls — blobs can wander past the host edges a bit
          // before being nudged back
          const min = -10;
          const max = 110;
          if (b.x < min) { b.x = min; b.vx = Math.abs(b.vx) * 0.6; }
          if (b.x > max) { b.x = max; b.vx = -Math.abs(b.vx) * 0.6; }
          if (b.y < min) { b.y = min; b.vy = Math.abs(b.vy) * 0.6; }
          if (b.y > max) { b.y = max; b.vy = -Math.abs(b.vy) * 0.6; }

          // commit to DOM
          const el = blobRefs.current[i];
          if (el) {
            el.style.left = `${b.x}%`;
            el.style.top = `${b.y}%`;
          }
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }, [animated, blobs, repulsion]);

    const merged: CSSProperties = {
      ...style,
      filter: `blur(${blur}px) saturate(140%)`,
    };

    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={cn(
          "pui-aurora",
          !isStatic && !animated && "pui-aurora--drift",
          className,
        )}
        style={merged}
        {...rest}
      >
        {blobs.map((b, i) => {
          const size = b.size ?? 50;
          return (
            <div
              key={i}
              ref={(el) => {
                blobRefs.current[i] = el;
              }}
              className="pui-aurora__blob"
              style={{
                position: "absolute",
                left: `${b.x}%`,
                top: `${b.y}%`,
                width: `${size}%`,
                height: `${size}%`,
                background: `radial-gradient(circle at center, ${b.color} 0%, transparent 70%)`,
                transform: "translate(-50%, -50%)",
                pointerEvents: "none",
                borderRadius: "50%",
              }}
            />
          );
        })}
      </div>
    );
  },
);
Aurora.displayName = "Aurora";
