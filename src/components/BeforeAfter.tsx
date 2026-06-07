import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import { cn } from "../utils/cn";
import { Sparkle } from "./Sparkle";

export interface BeforeAfterProps extends ComponentPropsWithoutRef<"div"> {
  /** Quick form: pass arrays and get the canonical layout. */
  before?: ReactNode[];
  after?: ReactNode[];
  /** Brand name shown over the arrow ("with Synthetica"). */
  brand?: ReactNode;
  /** Optional override labels. */
  beforeLabel?: ReactNode;
  afterLabel?: ReactNode;
}

interface PanelProps extends ComponentPropsWithoutRef<"div"> {
  label?: ReactNode;
}

/**
 * The Before/After AI split. Pass `before`/`after` arrays for the quick
 * version, or compose `BeforeAfter.Before` + `BeforeAfter.Arrow` +
 * `BeforeAfter.After` for full control.
 */
const Root = forwardRef<HTMLDivElement, BeforeAfterProps>(
  (
    {
      before,
      after,
      brand,
      beforeLabel = "Before",
      afterLabel = "After",
      className,
      children,
      ...rest
    },
    ref,
  ) => (
    <div ref={ref} className={cn("pui-ba", className)} {...rest}>
      {children ?? (
        <>
          <Before label={beforeLabel}>
            <ul>
              {(before ?? []).map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </Before>
          <Arrow brand={brand} />
          <After label={afterLabel}>
            <ul>
              {(after ?? []).map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </After>
        </>
      )}
    </div>
  ),
);
Root.displayName = "BeforeAfter";

const Before = forwardRef<HTMLDivElement, PanelProps>(
  ({ label = "Before", className, children, ...rest }, ref) => (
    <div
      ref={ref}
      className={cn("pui-ba__panel pui-ba__panel--before", className)}
      {...rest}
    >
      <div className="pui-ba__tag">{label}</div>
      {children}
    </div>
  ),
);
Before.displayName = "BeforeAfter.Before";

const After = forwardRef<HTMLDivElement, PanelProps>(
  ({ label = "After", className, children, ...rest }, ref) => (
    <div
      ref={ref}
      className={cn("pui-ba__panel pui-ba__panel--after", className)}
      {...rest}
    >
      <div className="pui-ba__tag">{label}</div>
      {children}
    </div>
  ),
);
After.displayName = "BeforeAfter.After";

interface ArrowProps extends ComponentPropsWithoutRef<"div"> {
  brand?: ReactNode;
}
const Arrow = forwardRef<HTMLDivElement, ArrowProps>(
  ({ brand, className, ...rest }, ref) => (
    <div ref={ref} className={cn("pui-ba__arrow", className)} {...rest}>
      <Sparkle />
      {brand ? <span>with {brand}</span> : <span>after</span>}
      <span>→</span>
    </div>
  ),
);
Arrow.displayName = "BeforeAfter.Arrow";

export const BeforeAfter = Object.assign(Root, { Before, After, Arrow });
