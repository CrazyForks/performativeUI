import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { cn } from "../utils/cn";

export type MarqueeItem =
  | { kind: "img"; src: string; alt?: string }
  /** Inline node for "text logos" (Bloomberg, NASA, Harvard, etc.). */
  | { kind: "node"; node: ReactNode; key?: string };

export interface LogoMarqueeProps extends ComponentPropsWithoutRef<"div"> {
  logos: MarqueeItem[];
  /** Seconds for one full loop. */
  speed?: number;
  /** Gap between logos in px. */
  gap?: number;
  /** Apply edge-fade mask. */
  fade?: boolean;
  /** Pause animation on hover. */
  pauseOnHover?: boolean;
}

/**
 * The infinite-scroll customer logo wall. Duplicates the track for a
 * seamless loop. Pair `img` and `node` entries to mix real logos with
 * "text logos" like Bloomberg / Harvard / NASA.
 */
export const LogoMarquee = forwardRef<HTMLDivElement, LogoMarqueeProps>(
  (
    { logos, speed = 40, gap = 56, fade = true, pauseOnHover, className, style, ...rest },
    ref,
  ) => {
    const cssVars: CSSProperties = {
      ...(style ?? {}),
      // CSS reads these vars for animation-duration and item gap.
      ["--pui-marquee-speed" as string]: `${speed}s`,
      ["--pui-marquee-gap" as string]: `${gap}px`,
    };
    const renderItem = (it: MarqueeItem, i: number) =>
      it.kind === "img" ? (
        <span key={`a${i}`} className="pui-marquee__item">
          <img src={it.src} alt={it.alt ?? ""} />
        </span>
      ) : (
        <span key={it.key ?? `b${i}`} className="pui-marquee__item">
          {it.node}
        </span>
      );

    return (
      <div
        ref={ref}
        className={cn(
          "pui-marquee",
          fade && "pui-marquee--fade",
          pauseOnHover && "pui-marquee--paused-on-hover",
          className,
        )}
        style={cssVars}
        aria-label="Trusted by"
        {...rest}
      >
        <div className="pui-marquee__track">
          {logos.map(renderItem)}
          {logos.map((it, i) => renderItem(it, i + logos.length))}
        </div>
      </div>
    );
  },
);
LogoMarquee.displayName = "LogoMarquee";
