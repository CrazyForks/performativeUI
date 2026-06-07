import {
  forwardRef,
  type ComponentPropsWithoutRef,
} from "react";
import { cn } from "../utils/cn";
import { useCounter, type UseCounterOptions } from "../hooks/useCounter";

export interface StatCounterProps
  extends ComponentPropsWithoutRef<"span">,
    UseCounterOptions {
  /** Format the displayed number. Default: locale-string with commas. */
  format?: (value: number) => string;
}

/**
 * An animated count-up. Used for "Trusted by 51,842 builders" and friends.
 *
 *     <StatCounter target={51842} />
 *     <StatCounter target={99.99} format={(n) => n.toFixed(2)} />
 *
 * For headless use, call `useCounter()` directly.
 */
export const StatCounter = forwardRef<HTMLSpanElement, StatCounterProps>(
  (
    {
      target,
      durationMs,
      from,
      ease,
      format = (n) => n.toLocaleString(),
      className,
      ...rest
    },
    ref,
  ) => {
    const value = useCounter({ target, durationMs, from, ease });
    return (
      <span ref={ref} className={cn("pui-stat", className)} {...rest}>
        {format(value)}
      </span>
    );
  },
);
StatCounter.displayName = "StatCounter";
