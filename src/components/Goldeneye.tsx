import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  type ComponentPropsWithoutRef,
  type CSSProperties,
} from "react";
import { cn } from "../utils/cn";

export interface GoldeneyeProps extends ComponentPropsWithoutRef<"div"> {
  /** Big headline shown on the page, outside the scope. Required. */
  text_default: string;
  /** Big headline revealed inside the scope. Required. */
  text_reveal: string;
  /**
   * The tiled-letter pattern that fills the background. Repeated
   * to cover the hero. Even rows are offset by half a tile so the
   * grid reads as a diamond lattice. Default: `"0 1 0 1 "`.
   */
  pattern?: string;
  /** Pattern font size (px) outside the scope. Default 14. */
  pattern_size_default?: number;
  /** Pattern font size (px) inside the scope. Default 22. */
  pattern_size_reveal?: number;
  /** Diameter of the scope, in px. Default 320. */
  scopeSize?: number;
  /**
   * Font size for the big headline. A bare number is treated as px;
   * a string is used as-is (so you can pass a `clamp()`, `vw`, etc.).
   * Defaults to a responsive `clamp(48px, 11vw, 160px)`.
   */
  fontSize?: number | string;
  /**
   * Font family for the big headline. Defaults to the library's
   * display sans. The pattern uses the mono face regardless.
   */
  fontFamily?: string;
}

const PARKED = "circle(0px at -9999px -9999px)";

/**
 * A reveal-on-hover headline over a tiled-letter background. The
 * scope follows the cursor, swaps `text_default` for `text_reveal`,
 * and resizes the background pattern. Polarity flips with the page
 * theme automatically.
 */
export const Goldeneye = forwardRef<HTMLDivElement, GoldeneyeProps>(
  (
    {
      text_default,
      text_reveal,
      pattern = "0 1 0 1 ",
      pattern_size_default = 14,
      pattern_size_reveal = 22,
      scopeSize = 320,
      fontSize,
      fontFamily,
      className,
      style,
      ...rest
    },
    ref,
  ) => {
    const wrapRef = useRef<HTMLDivElement | null>(null);
    const scopeRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      const node = wrapRef.current;
      const scope = scopeRef.current;
      if (!node || !scope) return;

      const r = scopeSize / 2;
      let raf = 0;
      let pendingX = 0;
      let pendingY = 0;
      let dirty = false;

      const flush = () => {
        raf = 0;
        if (!dirty) return;
        dirty = false;
        const clip = `circle(${r}px at ${pendingX}px ${pendingY}px)`;
        scope.style.clipPath = clip;
        (scope.style as unknown as { webkitClipPath: string }).webkitClipPath =
          clip;
      };

      const onMove = (e: PointerEvent) => {
        const rect = node.getBoundingClientRect();
        pendingX = e.clientX - rect.left;
        pendingY = e.clientY - rect.top;
        dirty = true;
        if (!raf) raf = requestAnimationFrame(flush);
      };

      const park = () => {
        if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
          dirty = false;
        }
        scope.style.clipPath = PARKED;
        (scope.style as unknown as { webkitClipPath: string }).webkitClipPath =
          PARKED;
      };

      node.addEventListener("pointermove", onMove);
      node.addEventListener("pointerleave", park);
      node.addEventListener("pointercancel", park);
      return () => {
        node.removeEventListener("pointermove", onMove);
        node.removeEventListener("pointerleave", park);
        node.removeEventListener("pointercancel", park);
        if (raf) cancelAnimationFrame(raf);
      };
    }, [scopeSize]);

    const setBoth = (el: HTMLDivElement | null) => {
      wrapRef.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) ref.current = el;
    };

    // Render the pattern as discrete rows so we can offset even
    // rows for the diamond lattice. ROW_COUNT * row chars covers
    // any reasonable hero size at either pattern font size.
    const ROW_COUNT = 40;
    const REPS_PER_ROW = 40;
    const rowText = useMemo(() => pattern.repeat(REPS_PER_ROW), [pattern]);
    const rows = useMemo(
      () => Array.from({ length: ROW_COUNT }, (_, i) => i),
      [],
    );

    const renderPattern = (sizePx: number) => (
      <div
        className="pui-goldeneye__pattern"
        style={{ fontSize: `${sizePx}px` }}
      >
        {rows.map((i) => (
          <div key={i} className="pui-goldeneye__pattern-row">
            {rowText}
          </div>
        ))}
      </div>
    );

    const cssVars: CSSProperties = {
      ...(fontFamily ? { "--pui-goldeneye-font": fontFamily } : {}),
      ...(fontSize != null
        ? {
            "--pui-goldeneye-headline-size":
              typeof fontSize === "number" ? `${fontSize}px` : fontSize,
          }
        : {}),
    } as CSSProperties;

    return (
      <div
        ref={setBoth}
        className={cn("pui-goldeneye", className)}
        style={{ ...cssVars, ...style }}
        {...rest}
      >
        <div className="pui-goldeneye__base">
          {renderPattern(pattern_size_default)}
          <div className="pui-goldeneye__headline">{text_default}</div>
        </div>
        <div
          ref={scopeRef}
          className="pui-goldeneye__scope"
          aria-hidden="true"
          style={{
            clipPath: PARKED,
            WebkitClipPath: PARKED,
          }}
        >
          {renderPattern(pattern_size_reveal)}
          <div className="pui-goldeneye__headline">{text_reveal}</div>
        </div>
      </div>
    );
  },
);
Goldeneye.displayName = "Goldeneye";
