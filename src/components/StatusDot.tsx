import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { cn } from "../utils/cn";

export interface StatusDotProps extends ComponentPropsWithoutRef<"span"> {
  /** CSS color for the dot. Defaults to var(--pui-success). */
  color?: string;
  /** Disable the pulse animation. */
  static?: boolean;
}

/**
 * A pulsing colored dot — the universal "we're live!" indicator.
 */
export const StatusDot = forwardRef<HTMLSpanElement, StatusDotProps>(
  ({ color, static: isStatic, className, style, ...rest }, ref) => (
    <span
      ref={ref}
      aria-hidden="true"
      className={cn("pui-dot", !isStatic && "pui-dot--pulse", className)}
      style={color ? { ...style, background: color, color } : style}
      {...rest}
    />
  ),
);
StatusDot.displayName = "StatusDot";
