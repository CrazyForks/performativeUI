import {
  forwardRef,
  useEffect,
  useRef,
  type ComponentPropsWithoutRef,
} from "react";
import { cn } from "../utils/cn";

export interface NodeGraphBackgroundProps
  extends ComponentPropsWithoutRef<"div"> {
  /** Number of nodes. Default 70. */
  density?: number;
  /** Pixel speed per frame. Default 0.4. */
  speed?: number;
  /** Distance under which two nodes are linked. Default 140. */
  linkDistance?: number;
  /** Node colors (one is picked per node). */
  colors?: string[];
  /** Link color. */
  linkColor?: string;
  /**
   * Radius (px) within which the cursor affects nodes/edges. Controls
   * both the gravity falloff and the opacity-brighten falloff. Set 0
   * to disable both. Default 200.
   */
  hoverDistance?: number;
  /**
   * Strength (0–1) of the cursor's pull on nearby nodes. Default 0.005
   *, very subtle drift. Set 0 to disable gravity entirely.
   */
  hoverGravity?: number;
  /**
   * Strength (0–1) of the opacity boost on nodes/edges near the cursor.
   * Field is dim at rest (baseOpacity), fills in toward 1 near the
   * cursor. Set 0 to disable. Default 0.8.
   */
  hoverBrighten?: number;
  /** Resting opacity (0–1) for nodes and link strokes. Default 0.45. */
  baseOpacity?: number;
  /**
   * px the simulation world extends past the visible viewport. Nodes
   * bounce off the world rectangle, not the viewport, so they appear
   * to drift in and out from off-screen. Default 80.
   */
  overscan?: number;
}

/**
 * A canvas-rendered node graph. Drifting dots connected by lines, the
 * background that signals "neural network, conceptually."
 *
 *     <div style={{position: 'relative'}}>
 *       <NodeGraphBackground density={50} linkColor="hotpink" />
 *       …
 *     </div>
 *
 * Sits absolutely inside its (relative) parent.
 */
export const NodeGraphBackground = forwardRef<
  HTMLDivElement,
  NodeGraphBackgroundProps
>(
  (
    {
      density = 70,
      speed = 0.4,
      linkDistance = 140,
      colors = ["#a78bfa", "#f0abfc", "#67e8f9"],
      linkColor = "#7c3aed",
      hoverDistance = 200,
      hoverGravity = 0.005,
      hoverBrighten = 0.8,
      baseOpacity = 0.45,
      overscan = 80,
      className,
      ...rest
    },
    ref,
  ) => {
    const hostRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
      const host = hostRef.current!;
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      let width = 0;
      let height = 0;
      let dpr = 1;
      const mouse = { x: -9999, y: -9999 };
      let raf = 0;

      type Node = { x: number; y: number; vx: number; vy: number; r: number; color: string };
      let nodes: Node[] = [];

      const seed = () => {
        // Distribute nodes across the WORLD rectangle (viewport + overscan)
        // so some start off-screen and drift in.
        const wMin = -overscan;
        const wMax = width + overscan;
        const hMin = -overscan;
        const hMax = height + overscan;
        nodes = Array.from({ length: density }, () => ({
          x: wMin + Math.random() * (wMax - wMin),
          y: hMin + Math.random() * (hMax - hMin),
          vx: (Math.random() - 0.5) * speed * 2,
          vy: (Math.random() - 0.5) * speed * 2,
          r: 1 + Math.random() * 1.6,
          color: colors[Math.floor(Math.random() * colors.length)],
        }));
      };

      const resize = () => {
        const rect = host.getBoundingClientRect();
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = rect.width;
        height = rect.height;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        seed();
      };

      const tick = () => {
        ctx.clearRect(0, 0, width, height);
        const worldLeft = -overscan;
        const worldRight = width + overscan;
        const worldTop = -overscan;
        const worldBottom = height + overscan;
        const mouseInside = mouse.x > -9000;

        // step
        for (const n of nodes) {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < worldLeft || n.x > worldRight) n.vx *= -1;
          if (n.y < worldTop || n.y > worldBottom) n.vy *= -1;
          if (hoverDistance > 0 && hoverGravity > 0 && mouseInside) {
            const dx = mouse.x - n.x;
            const dy = mouse.y - n.y;
            const d = Math.hypot(dx, dy);
            if (d < hoverDistance) {
              const pull = (1 - d / hoverDistance) * hoverGravity;
              n.x += dx * pull;
              n.y += dy * pull;
            }
          }
        }

        // Per-position brighten helper, returns 0..1 boost factor based
        // on distance from cursor (0 at hoverDistance, 1 at cursor).
        const brighten = (px: number, py: number) => {
          if (!mouseInside || hoverDistance <= 0 || hoverBrighten <= 0) return 0;
          const d = Math.hypot(mouse.x - px, mouse.y - py);
          if (d >= hoverDistance) return 0;
          return (1 - d / hoverDistance) * hoverBrighten;
        };

        // links, base alpha from edge length, opacity-boosted near cursor
        ctx.lineWidth = 1;
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const a = nodes[i];
            const b = nodes[j];
            const dlink = Math.hypot(a.x - b.x, a.y - b.y);
            if (dlink < linkDistance) {
              const lengthAlpha = 1 - dlink / linkDistance;
              const midBoost = brighten((a.x + b.x) / 2, (a.y + b.y) / 2);
              const alpha = Math.min(
                1,
                lengthAlpha * baseOpacity + midBoost * lengthAlpha,
              );
              ctx.strokeStyle = withAlpha(linkColor, alpha);
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }
        }

        // nodes, dim at rest, fill in near cursor
        for (const n of nodes) {
          const boost = brighten(n.x, n.y);
          const alpha = Math.min(1, baseOpacity + boost);
          ctx.fillStyle = withAlpha(n.color, alpha);
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
          ctx.fill();
        }
        raf = requestAnimationFrame(tick);
      };

      const onMove = (e: MouseEvent) => {
        const rect = host.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
      };
      const onLeave = () => {
        mouse.x = -9999;
        mouse.y = -9999;
      };
      const ro = new ResizeObserver(resize);
      ro.observe(host);
      resize();
      host.addEventListener("mousemove", onMove);
      host.addEventListener("mouseleave", onLeave);
      raf = requestAnimationFrame(tick);

      return () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        host.removeEventListener("mousemove", onMove);
        host.removeEventListener("mouseleave", onLeave);
      };
    }, [
      density,
      speed,
      linkDistance,
      hoverDistance,
      hoverGravity,
      hoverBrighten,
      baseOpacity,
      overscan,
      colors,
      linkColor,
    ]);

    // forward outer ref to a slot via callback
    const setRef = (el: HTMLDivElement | null) => {
      hostRef.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
    };

    return (
      <div
        ref={setRef}
        aria-hidden="true"
        className={cn("pui-node-graph", className)}
        {...rest}
      >
        <canvas ref={canvasRef} />
      </div>
    );
  },
);
NodeGraphBackground.displayName = "NodeGraphBackground";

function withAlpha(color: string, a: number): string {
  // Accept "#rrggbb" or "#rgb", fall back to color as-is for named/rgba.
  if (color.startsWith("#")) {
    let r: number, g: number, b: number;
    if (color.length === 4) {
      r = parseInt(color[1] + color[1], 16);
      g = parseInt(color[2] + color[2], 16);
      b = parseInt(color[3] + color[3], 16);
    } else {
      r = parseInt(color.slice(1, 3), 16);
      g = parseInt(color.slice(3, 5), 16);
      b = parseInt(color.slice(5, 7), 16);
    }
    return `rgba(${r},${g},${b},${a})`;
  }
  return color;
}
