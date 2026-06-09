import {
  forwardRef,
  useEffect,
  useRef,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { cn } from "../utils/cn";

/** A single badge. A bare string is shorthand for `{ label }`. */
export type SlippyWord =
  | string
  | { label: ReactNode; key?: string; gradient?: boolean };

export interface SlippyWordsProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Rows of badges. Each row slides horizontally as the component
   * scrolls through the viewport; consecutive rows travel in opposite
   * directions. Provide more badges than fit so the sliding never
   * exposes an empty edge.
   */
  rows: SlippyWord[][];
  /** Max horizontal travel, in px, from one viewport edge to the other. */
  intensity?: number;
  /** Direction the first row drifts as you scroll down. Rows alternate. */
  startDirection?: "left" | "right";
  /** Gap between badges in px. */
  gap?: number;
  /** Apply an edge-fade mask so badges dissolve at the sides. */
  fade?: boolean;
  /** Render every badge with the mandatory gradient fill. */
  gradient?: boolean;
  /** Disable the scroll coupling (also forced under prefers-reduced-motion). */
  static?: boolean;
}

/**
 * Two-plus rows of word badges that slide in alternating directions,
 * driven by scroll position. The obligatory "kinetic typography" strip
 * that reassures investors your brand has motion design.
 *
 * The scroll progress (0 as the strip enters the bottom of the viewport,
 * 1 as it leaves the top) is written to `--pui-slip` on the host as a px
 * offset; each row multiplies it by its own `--pui-slip-dir` (+1 / -1).
 * One style write per frame, all the movement happens in CSS.
 */
export const SlippyWords = forwardRef<HTMLDivElement, SlippyWordsProps>(
  (
    {
      rows,
      intensity = 240,
      startDirection = "left",
      gap = 12,
      fade = true,
      gradient = false,
      static: isStatic,
      className,
      style,
      ...rest
    },
    ref,
  ) => {
    const hostRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const host = hostRef.current;
      if (!host || isStatic) return;
      const reduce = window.matchMedia?.(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduce) return;

      let raf = 0;
      const update = () => {
        raf = 0;
        const rect = host.getBoundingClientRect();
        const vh = window.innerHeight || document.documentElement.clientHeight;
        // 0 when the strip's top hits the bottom of the viewport,
        // 1 when its bottom passes the top. Centered to [-0.5, 0.5].
        const p = (vh - rect.top) / (vh + rect.height);
        const offset = (Math.min(1, Math.max(0, p)) - 0.5) * intensity;
        host.style.setProperty("--pui-slip", `${offset}px`);
      };
      const onScroll = () => {
        if (!raf) raf = requestAnimationFrame(update);
      };

      update();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
      return () => {
        if (raf) cancelAnimationFrame(raf);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      };
    }, [intensity, isStatic]);

    const setRef = (el: HTMLDivElement | null) => {
      hostRef.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref)
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
    };

    const firstDir = startDirection === "left" ? -1 : 1;
    const cssVars: CSSProperties = {
      ...(style ?? {}),
      ["--pui-slip-gap" as string]: `${gap}px`,
    };

    return (
      <div
        ref={setRef}
        className={cn("pui-slippy", fade && "pui-slippy--fade", className)}
        style={cssVars}
        aria-label="Featured terms"
        {...rest}
      >
        {rows.map((row, ri) => (
          <div
            key={ri}
            className="pui-slippy__row"
            style={{ ["--pui-slip-dir" as string]: ri % 2 === 0 ? firstDir : -firstDir }}
          >
            {row.map((word, wi) => {
              const w =
                typeof word === "string" ? { label: word as ReactNode } : word;
              return (
                <span
                  key={(typeof word === "object" && word.key) || `${ri}-${wi}`}
                  className={cn(
                    "pui-slippy__word",
                    (gradient ||
                      (typeof word === "object" && word.gradient)) &&
                      "pui-slippy__word--gradient",
                  )}
                >
                  {w.label}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    );
  },
);
SlippyWords.displayName = "SlippyWords";
