import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementType,
} from "react";
import { cn } from "../utils/cn";

export interface GradientTextProps extends ComponentPropsWithoutRef<"span"> {
  /** Disable the slow gradient shift (still gradient-colored, just static). */
  static?: boolean;
  /** Render as a different tag (e.g. h1, em). */
  as?: ElementType;
}

/**
 * Text painted with the consensus AI gradient. Use sparingly — or don't.
 */
export const GradientText = forwardRef<HTMLElement, GradientTextProps>(
  ({ as, static: isStatic, className, children, ...rest }, ref) => {
    const Tag = (as ?? "span") as ElementType;
    return (
      <Tag
        ref={ref}
        className={cn(
          "pui-gradient-text",
          !isStatic && "pui-gradient-text--animate",
          className,
        )}
        {...rest}
      >
        {children}
      </Tag>
    );
  },
);
GradientText.displayName = "GradientText";
