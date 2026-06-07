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
  /** Hover-attract distance. 0 disables interactivity. */
  hoverDistance?: number;
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
      hoverDistance = 180,
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
        nodes = Array.from({ length: density }, () => ({
          x: Math.random() * width,
          y: Math.random() * height,
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
        // step
        for (const n of nodes) {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < 0 || n.x > width) n.vx *= -1;
          if (n.y < 0 || n.y > height) n.vy *= -1;
          if (hoverDistance > 0) {
            const dx = mouse.x - n.x;
            const dy = mouse.y - n.y;
            const d = Math.hypot(dx, dy);
            if (d < hoverDistance) {
              const pull = (1 - d / hoverDistance) * 0.04;
              n.x += dx * pull;
              n.y += dy * pull;
            }
          }
        }
        // links
        ctx.lineWidth = 1;
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const a = nodes[i];
            const b = nodes[j];
            const d = Math.hypot(a.x - b.x, a.y - b.y);
            if (d < linkDistance) {
              const alpha = 1 - d / linkDistance;
              ctx.strokeStyle = withAlpha(linkColor, alpha * 0.6);
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }
        }
        // nodes
        for (const n of nodes) {
          ctx.fillStyle = n.color;
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
    }, [density, speed, linkDistance, hoverDistance, colors, linkColor]);

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
  // Accept "#rrggbb" or "#rgb" — fall back to color as-is for named/rgba.
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
