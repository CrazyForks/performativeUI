import {
  forwardRef,
  type ComponentPropsWithoutRef,
} from "react";
import { cn } from "../utils/cn";
import {
  useTokenStream,
  type UseTokenStreamOptions,
} from "../hooks/useTokenStream";

export interface TokenStreamProps
  extends ComponentPropsWithoutRef<"span">,
    UseTokenStreamOptions {
  /** Hide the trailing blinking caret. */
  hideCaret?: boolean;
}

/**
 * Reveals text token-by-token with a trailing blinking caret. The "see it
 * think" pattern, slower on purpose.
 *
 *     <TokenStream text="Reasoning, but visibly." />
 *
 * For full control over the markup, call `useTokenStream()` directly.
 */
export const TokenStream = forwardRef<HTMLSpanElement, TokenStreamProps>(
  (
    {
      text,
      speedMs,
      tokenize,
      loop,
      loopDelayMs,
      onComplete,
      hideCaret,
      className,
      ...rest
    },
    ref,
  ) => {
    const { output, isStreaming } = useTokenStream({
      text,
      speedMs,
      tokenize,
      loop,
      loopDelayMs,
      onComplete,
    });
    return (
      <span ref={ref} className={cn(className)} {...rest}>
        {output}
        {!hideCaret && isStreaming && (
          <span className="pui-bubble__stream-caret" />
        )}
      </span>
    );
  },
);
TokenStream.displayName = "TokenStream";
