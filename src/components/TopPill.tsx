import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { cn } from "../utils/cn";
import { Sparkle } from "./Sparkle";

export interface TopPillProps extends ComponentPropsWithoutRef<"div"> {
  /** Hide the leading sparkle. */
  hideSparkle?: boolean;
  /** Optional trailing accessory (e.g. an arrow). */
  trailing?: ReactNode;
}

/**
 * The sticky announcement bar. Houses funding news, beta tags, and
 * whatever else hasn't shipped yet.
 */
export const TopPill = forwardRef<HTMLDivElement, TopPillProps>(
  ({ hideSparkle, trailing, className, children, ...rest }, ref) => (
    <div ref={ref} className={cn("pui-top-pill", className)} {...rest}>
      {!hideSparkle && <Sparkle />}
      <span>{children}</span>
      {trailing}
    </div>
  ),
);
TopPill.displayName = "TopPill";
