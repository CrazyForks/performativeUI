import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { cn } from "../utils/cn";

export interface SparkleProps extends ComponentPropsWithoutRef<"span"> {
  /** The glyph to render. Default: ✦. */
  glyph?: string;
  /** Skip the gradient fill (renders in currentColor). */
  solid?: boolean;
  /** Stop the twinkle animation. */
  static?: boolean;
}

/**
 * The mandatory ✦. Add liberally to anything that needs to feel AI.
 * Defaults to a twinkling gradient glyph; `solid` keeps it monochrome.
 */
export const Sparkle = forwardRef<HTMLSpanElement, SparkleProps>(
  ({ glyph = "✦", solid, static: isStatic, className, ...rest }, ref) => (
    <span
      ref={ref}
      aria-hidden="true"
      className={cn(
        "pui-sparkle",
        !isStatic && "pui-sparkle--blink",
        solid && "pui-sparkle--solid",
        className,
      )}
      {...rest}
    >
      {glyph}
    </span>
  ),
);
Sparkle.displayName = "Sparkle";
