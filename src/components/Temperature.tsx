import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type MouseEvent,
} from "react";
import { cn } from "../utils/cn";

/** A built-in animated treatment, or any CSS color string for a static tier. */
export type TemperatureColor = "glow" | "rainbow" | "ludicrous" | (string & {});

export interface TemperatureOption {
  /** Stable identity, also the value reported by onChange. */
  key: string;
  /** Text shown for this tier. */
  label: string;
  /**
   * Treatment when this tier is active. The keywords `glow`, `rainbow` and
   * `ludicrous` are animated; anything else is treated as a flat CSS color.
   */
  color?: TemperatureColor;
}

const ANIMATIONS = new Set(["glow", "rainbow", "ludicrous"]);
const isAnimation = (c: string | undefined) => !!c && ANIMATIONS.has(c);

/**
 * The default ladder, lifted from a coding agent's reasoning selector. The
 * first three are flat colors; the last three carry their own animation.
 */
const DEFAULT_OPTIONS: TemperatureOption[] = [
  { key: "low", label: "low", color: "var(--pui-temp-low)" },
  { key: "medium", label: "medium", color: "var(--pui-temp-medium)" },
  { key: "high", label: "high", color: "var(--pui-temp-high)" },
  { key: "xhigh", label: "xhigh", color: "glow" },
  { key: "max", label: "max", color: "rainbow" },
  { key: "ludicrous", label: "ludicrous", color: "ludicrous" },
];

/** Red through violet, the canonical "rainbow" tier, frozen when idle. */
const RAINBOW = [
  "#ff4d4d",
  "#ff9a3d",
  "#ffe24d",
  "#4dff88",
  "#4db8ff",
  "#7c5cff",
  "#c44dff",
];

/* -------------------------------------------------------------------------
   ludicrous background ripple
   -------------------------------------------------------------------------
   In the real terminal, the top tier floods the WHOLE menu rectangle (blank
   space included) with a violet radial cosine wave that emanates from the
   selected triangle column on the track baseline. We reproduce that per-cell
   field on a canvas sized to the whole component, layered behind the text.
   The math mirrors the binary's KHl/VHl: distance is weighted 2x vertically
   (terminal cells are ~2x taller than wide, so the wavefront looks circular),
   and the color is a cosine standing-wave of the lag (dist - travel) sampled
   onto an 8-step gradient.
   ------------------------------------------------------------------------- */

/** Endpoints of the 8-step violet gradient: rgb(62,22,118) -> rgb(140,80,240). */
const RIPPLE_FROM: [number, number, number] = [62, 22, 118];
const RIPPLE_TO: [number, number, number] = [140, 80, 240];
const RIPPLE_STEPS = 8;
/** Spatial wavelength of the standing wave, in distance units (YVn). */
const RIPPLE_WAVELENGTH = 20;
/** Distance units the wavefront advances per 80ms frame (80 * Wum, Wum=0.03). */
const RIPPLE_TRAVEL_PER_FRAME = 80 * 0.03;
/** Frame quantum in ms (jum): re-evaluate travel on this cadence. */
const RIPPLE_FRAME_MS = 80;
/** Vertical-distance weight (rows count double vs columns). */
const RIPPLE_ROW_WEIGHT = 2;
/** Approx terminal-cell width in px, used to bin the component into a grid. */
const RIPPLE_CELL_PX = 9;

type Rgb = [number, number, number];

/** Interpolate the RIPPLE_STEPS-color gradient between two endpoints (I8t). */
function buildGradient(from: Rgb, to: Rgb): Rgb[] {
  return Array.from({ length: RIPPLE_STEPS }, (_, t) => {
    const n = t / (RIPPLE_STEPS - 1);
    return [
      Math.round(from[0] + (to[0] - from[0]) * n),
      Math.round(from[1] + (to[1] - from[1]) * n),
      Math.round(from[2] + (to[2] - from[2]) * n),
    ] as Rgb;
  });
}

/**
 * Parse a bare "r, g, b" CSS custom property into an Rgb tuple, falling
 * back to the supplied default when the var is missing or malformed.
 */
function parseTriplet(raw: string, fallback: Rgb): Rgb {
  const parts = raw.split(",").map((n) => Number(n.trim()));
  return parts.length === 3 && parts.every((n) => Number.isFinite(n))
    ? (parts as Rgb)
    : fallback;
}

/**
 * Gradient index for a cell at radial distance `dist` given the current
 * wavefront radius `travel`, or null if the wavefront has not reached it
 * yet (those cells stay transparent). This is the binary's KHl: a cosine
 * band of period RIPPLE_WAVELENGTH riding outward on the leading edge.
 */
function rippleColorIndex(dist: number, travel: number): number | null {
  if (dist > travel) return null;
  const phase =
    (((dist - travel) % RIPPLE_WAVELENGTH) + RIPPLE_WAVELENGTH) %
    RIPPLE_WAVELENGTH;
  const v = (1 + Math.cos((2 * Math.PI * phase) / RIPPLE_WAVELENGTH)) / 2;
  return Math.min(RIPPLE_STEPS - 1, Math.round(v * (RIPPLE_STEPS - 1)));
}

export interface TemperatureProps
  extends Omit<ComponentPropsWithoutRef<"div">, "onChange" | "defaultValue"> {
  /** The tiers, left to right. Defaults to the low..ludicrous ladder. */
  options?: TemperatureOption[];
  /** Controlled selected key. */
  value?: string;
  /** Initial selected key when uncontrolled. Defaults to the middle tier. */
  defaultValue?: string;
  /** Fires when a tier is committed (clicked anywhere in the widget). */
  onChange?: (key: string) => void;
  /** Left pole caption. Default "Cheaper". */
  labelLow?: string;
  /** Right pole caption. Default "Faster". */
  labelHigh?: string;
}

/**
 * A reasoning-effort slider modeled on a coding agent's `/effort` menu. It
 * fills its container; give the container a height and the top "ludicrous" tier
 * floods the whole thing with a pulsing ripple. Hover to preview the tier
 * nearest the cursor, and click anywhere to commit it.
 */
export const Temperature = forwardRef<HTMLDivElement, TemperatureProps>(
  (
    {
      options = DEFAULT_OPTIONS,
      value,
      defaultValue,
      onChange,
      labelLow = "Cheaper",
      labelHigh = "Faster",
      className,
      ...rest
    },
    ref,
  ) => {
    const initial =
      defaultValue ??
      options[Math.min(2, options.length - 1)]?.key ??
      options[0]?.key;
    const [internal, setInternal] = useState<string>(initial);
    const selected = value ?? internal;
    const selectedIndex = Math.max(
      0,
      options.findIndex((o) => o.key === selected),
    );

    // Index nearest the cursor while the pointer is inside the widget, null
    // otherwise. Drives the "choosing" preview.
    const [hover, setHover] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    // Spans the padded content width (where the columns actually live), so
    // pointer x maps onto tiers even though clicks are caught on the full
    // edge-to-edge container.
    const rowRef = useRef<HTMLDivElement | null>(null);

    const activeIndex = hover ?? selectedIndex;
    const active = options[activeIndex];
    // The widget-wide ripple only floods when a "ludicrous" tier is active
    // (nearest the cursor while hovering, else the committed selection).
    const rippleOn = active?.color === "ludicrous";

    const setRefs = useCallback(
      (node: HTMLDivElement | null) => {
        containerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    const commit = useCallback(
      (index: number) => {
        const next = options[index]?.key;
        if (next === undefined) return;
        if (value === undefined) setInternal(next);
        onChange?.(next);
      },
      [options, value, onChange],
    );

    // Nearest tier to a pointer x. Columns are equal width across the padded
    // content row, so the column the pointer sits over is the closest center.
    // Clicks in the side gutters clamp to the first / last tier.
    const indexFromClientX = useCallback(
      (clientX: number) => {
        const el = rowRef.current ?? containerRef.current;
        if (!el) return 0;
        const rect = el.getBoundingClientRect();
        const idx = Math.floor(((clientX - rect.left) / rect.width) * options.length);
        return Math.min(options.length - 1, Math.max(0, idx));
      },
      [options.length],
    );

    const frac = (i: number) => (i + 0.5) / options.length;

    // The dashed divider marks the first "ludicrous" tier (the part of the
    // menu legal hasn't reviewed). Hidden when there is none.
    const dividerIndex = options.findIndex((o) => o.color === "ludicrous");
    const showDivider = dividerIndex > 0;

    const styleVars = {
      "--pui-temp-pos": frac(activeIndex),
      "--pui-temp-divider": showDivider ? dividerIndex / options.length : 0,
      "--pui-temp-cols": options.length,
    } as CSSProperties;

    return (
      <div
        ref={setRefs}
        className={cn("pui-temperature", className)}
        style={styleVars}
        onMouseMove={(e) => setHover(indexFromClientX(e.clientX))}
        onMouseLeave={() => setHover(null)}
        onClick={(e: MouseEvent<HTMLDivElement>) =>
          commit(indexFromClientX(e.clientX))
        }
        role="group"
        aria-label="Reasoning effort"
        {...rest}
      >
        {/* Behind everything: the violet ripple flood, only for ludicrous.
            Origin column follows the active triangle. Mounting on activation
            (and remounting when the origin column moves) restarts travel from
            0, i.e. a fresh "landing" like the terminal. */}
        {rippleOn && <RippleLayer originFrac={frac(activeIndex)} />}

        <div className="pui-temperature__poles">
          <span>{labelLow}</span>
          <span>{labelHigh}</span>
        </div>

        <div className="pui-temperature__track" ref={rowRef}>
          <div className="pui-temperature__line" aria-hidden="true" />
          {showDivider && (
            <span className="pui-temperature__divider" aria-hidden="true">
              ┆
            </span>
          )}
          <span className="pui-temperature__marker" aria-hidden="true">
            ▲
          </span>
        </div>

        <div className="pui-temperature__levels">
          {options.map((opt, i) => {
            const anim = isAnimation(opt.color);
            return (
              <button
                key={opt.key}
                type="button"
                className={cn(
                  "pui-temperature__level",
                  anim && `pui-temperature__level--${opt.color}`,
                  i === activeIndex && "pui-temperature__level--active",
                  i === selectedIndex && "pui-temperature__level--selected",
                )}
                aria-pressed={i === selectedIndex}
                onClick={(e) => {
                  // Keyboard activation has no useful coordinates, so commit
                  // this button directly and keep the root handler for clicks
                  // that land in the gaps / poles / track.
                  e.stopPropagation();
                  commit(i);
                }}
              >
                <LevelLabel option={opt} animated={anim} />
              </button>
            );
          })}
        </div>
      </div>
    );
  },
);
Temperature.displayName = "Temperature";

/**
 * The full-widget violet ripple, painted on a canvas behind the text. We bin
 * the component into a monospace cell grid, then for every cell compute its
 * radial distance from the origin (the active triangle column on the track
 * baseline row, taken as the vertical middle) and fill it with the cosine-band
 * gradient color, leaving cells the wavefront has not reached transparent.
 * `travel` grows ~2.4 distance units every 80ms from activation; on
 * prefers-reduced-motion we freeze on a single settled frame.
 */
function RippleLayer({ originFrac }: { originFrac: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Read the gradient endpoints from CSS tokens so the flood follows the
    // active theme (dark violet vs the lighter blue-violet on white).
    const cs = getComputedStyle(canvas);
    const gradient = buildGradient(
      parseTriplet(cs.getPropertyValue("--pui-temp-ripple-from"), RIPPLE_FROM),
      parseTriplet(cs.getPropertyValue("--pui-temp-ripple-to"), RIPPLE_TO),
    );

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    // Landing timestamp, quantized to the 80ms frame grid like the binary's
    // _f(jum): travel is elapsed-since-landing measured in whole frames.
    const landing = Math.floor(performance.now() / RIPPLE_FRAME_MS);

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w === 0 || h === 0) {
        raf = requestAnimationFrame(draw);
        return;
      }
      // Resize the backing store to match layout * DPR, only when needed.
      const pxW = Math.round(w * dpr);
      const pxH = Math.round(h * dpr);
      if (canvas.width !== pxW || canvas.height !== pxH) {
        canvas.width = pxW;
        canvas.height = pxH;
      }

      // Bin the component into a whole number of monospace-ish cells. Rows are
      // ~2x taller than columns, matching terminal aspect.
      const cols = Math.max(1, Math.round(w / RIPPLE_CELL_PX));
      const rows = Math.max(1, Math.round(h / (RIPPLE_CELL_PX * 2)));
      const cellW = pxW / cols;
      const cellH = pxH / rows;
      const originCol = originFrac * cols;
      // The track line (and its triangle) sits at the vertical middle.
      const originRow = (rows - 1) / 2;

      const frame = reduced
        ? RIPPLE_WAVELENGTH * 2 // settled, fully-flooded frozen frame
        : Math.floor(performance.now() / RIPPLE_FRAME_MS) - landing;
      const travel = frame * RIPPLE_TRAVEL_PER_FRAME;

      ctx.clearRect(0, 0, pxW, pxH);
      for (let row = 0; row < rows; row++) {
        const dy = (row - originRow) * RIPPLE_ROW_WEIGHT;
        for (let col = 0; col < cols; col++) {
          const dx = col - originCol;
          const dist = Math.hypot(dx, dy);
          const idx = rippleColorIndex(dist, travel);
          if (idx === null) continue;
          const [r, g, b] = gradient[idx];
          // Brighter bands carry more opacity so the wavefront reads clearly
          // while troughs stay subtle behind the text.
          const alpha = 0.22 + 0.5 * (idx / (RIPPLE_STEPS - 1));
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
          ctx.fillRect(
            Math.floor(col * cellW),
            Math.floor(row * cellH),
            Math.ceil(cellW) + 1,
            Math.ceil(cellH) + 1,
          );
        }
      }

      if (!reduced) raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [originFrac]);

  return (
    <canvas
      ref={canvasRef}
      className="pui-temperature__ripple"
      aria-hidden="true"
    />
  );
}

/**
 * Renders a tier's label. Animated tiers split into per-character spans so each
 * glyph can ride its own phase: `rainbow` scrolls hue by hue, `glow` drags a
 * highlight. `ludicrous` renders as a plain run (its motion lives in the
 * widget-wide background ripple). A non-keyword color is a flat CSS color.
 */
function LevelLabel({
  option,
  animated,
}: {
  option: TemperatureOption;
  animated: boolean;
}) {
  // ludicrous and static colors render as a single run.
  if (!animated || option.color === "ludicrous") {
    const style: CSSProperties | undefined =
      option.color && !isAnimation(option.color)
        ? { color: option.color }
        : undefined;
    return (
      <span className="pui-temperature__text" style={style}>
        {option.label}
      </span>
    );
  }

  const chars = [...option.label];
  return (
    <span className="pui-temperature__text">
      {chars.map((ch, i) => {
        // Negative per-char delays make the wave already be travelling on the
        // first frame, one step apart between neighbors.
        const delay = option.color === "rainbow" ? -i * 0.2 : -i * 0.09;
        const style: CSSProperties = { animationDelay: `${delay}s` };
        if (option.color === "rainbow") {
          // Frozen-rainbow base color; the active animation overrides it.
          style.color = RAINBOW[i % RAINBOW.length];
        }
        return (
          <span key={i} className="pui-temperature__char" style={style}>
            {ch}
          </span>
        );
      })}
    </span>
  );
}
