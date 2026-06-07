import { forwardRef, useRef, type ComponentPropsWithoutRef } from "react";
import { cn } from "../utils/cn";
import {
  useAsciiField,
  type UseAsciiFieldOptions,
} from "../hooks/useAsciiField";

export interface AsciiHeroProps
  extends ComponentPropsWithoutRef<"pre">,
    UseAsciiFieldOptions {}

/**
 * A mouse-reactive ASCII field. Signals "for hackers, by people who follow
 * the right newsletters." Drop in unstyled — defaults are loud.
 *
 *     <AsciiHero cols={84} rows={24} reactive />
 *
 * For headless use, call `useAsciiField()` on your own <pre> ref.
 */
export const AsciiHero = forwardRef<HTMLPreElement, AsciiHeroProps>(
  (
    {
      cols,
      rows,
      charRamp,
      rippleStrength,
      rippleRadius,
      reactive,
      frameMs,
      className,
      ...rest
    },
    ref,
  ) => {
    const localRef = useRef<HTMLPreElement>(null);
    const refToUse = (ref as React.RefObject<HTMLPreElement>) ?? localRef;
    useAsciiField(refToUse, {
      cols,
      rows,
      charRamp,
      rippleStrength,
      rippleRadius,
      reactive,
      frameMs,
    });
    return <pre ref={refToUse} className={cn("pui-ascii", className)} {...rest} />;
  },
);
AsciiHero.displayName = "AsciiHero";
