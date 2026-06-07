import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import { cn } from "../utils/cn";

export type IdeTokenClass = "key" | "str" | "num" | "com" | "fn" | "";
export interface IdeToken {
  /** Raw source text including whitespace. */
  c: string;
  /** Token class for syntax color. Empty string for plain. */
  cls?: IdeTokenClass;
}

export interface MockIDEProps extends ComponentPropsWithoutRef<"div"> {
  /** Filename shown in the tab. */
  filename?: string;
  /** Tokens to type out (in order). If omitted, renders an empty body. */
  tokens?: IdeToken[];
  /** Loop after finishing. */
  loop?: boolean;
  /** ms range per character. */
  charMs?: [number, number];
  /** Label for the "AI is writing…" pill. Pass false to hide. */
  thinkingLabel?: ReactNode | false;
}

/**
 * Mock IDE with token-by-token "AI is writing…" code stream. The compound
 * exposes Chrome, Tab, Thinking, and Body if you want to roll your own
 * arrangement; the default `<MockIDE tokens=…>` form is the lazy path.
 */
const MockIDERoot = forwardRef<HTMLDivElement, MockIDEProps>(
  (
    {
      filename,
      tokens,
      loop = true,
      charMs = [14, 42],
      thinkingLabel = "AI is writing…",
      className,
      children,
      ...rest
    },
    ref,
  ) => (
    <div ref={ref} className={cn("pui-ide", className)} {...rest}>
      {children ?? (
        <>
          <Chrome filename={filename} thinking={thinkingLabel} />
          <Body tokens={tokens ?? []} loop={loop} charMs={charMs} />
        </>
      )}
    </div>
  ),
);
MockIDERoot.displayName = "MockIDE";

interface ChromeProps extends ComponentPropsWithoutRef<"div"> {
  filename?: string;
  thinking?: ReactNode | false;
}
const Chrome = forwardRef<HTMLDivElement, ChromeProps>(
  ({ filename, thinking, className, children, ...rest }, ref) => (
    <div ref={ref} className={cn("pui-ide__chrome", className)} {...rest}>
      <span className="pui-ide__dot pui-ide__dot--red" />
      <span className="pui-ide__dot pui-ide__dot--yellow" />
      <span className="pui-ide__dot pui-ide__dot--green" />
      {filename && <span className="pui-ide__tab">{filename}</span>}
      {children}
      {thinking !== false && (
        <span className="pui-ide__thinking">
          <span className="pui-spinner" />
          <span>{thinking}</span>
        </span>
      )}
    </div>
  ),
);
Chrome.displayName = "MockIDE.Chrome";

interface BodyProps extends ComponentPropsWithoutRef<"pre"> {
  tokens: IdeToken[];
  loop?: boolean;
  charMs?: [number, number];
}
const Body = forwardRef<HTMLPreElement, BodyProps>(
  ({ tokens, loop = true, charMs = [14, 42], className, ...rest }, ref) => {
    const preRef = useRef<HTMLPreElement>(null);
    const refToUse = (ref as React.RefObject<HTMLPreElement>) ?? preRef;
    const [tick, setTick] = useState(0);

    useEffect(() => {
      const el = refToUse.current;
      if (!el || !tokens.length) return;
      let cancelled = false;
      let timer: ReturnType<typeof setTimeout> | null = null;
      let tokenIdx = 0;
      let charIdx = 0;

      const caret = '<span class="pui-caret"></span>';
      const escape = (s: string) =>
        s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

      const run = () => {
        if (cancelled) return;
        if (tokenIdx >= tokens.length) {
          if (loop) {
            timer = setTimeout(() => {
              tokenIdx = 0;
              charIdx = 0;
              el.innerHTML = caret;
              setTick((t) => t + 1);
              run();
            }, 3000);
          }
          return;
        }
        const tok = tokens[tokenIdx];
        charIdx += 1;
        if (charIdx > tok.c.length) {
          tokenIdx += 1;
          charIdx = 0;
          run();
          return;
        }
        let html = "";
        for (let k = 0; k < tokenIdx; k++) {
          const t = tokens[k];
          html += t.cls
            ? `<span class="pui-tok-${t.cls}">${escape(t.c)}</span>`
            : escape(t.c);
        }
        const partial = tok.c.slice(0, charIdx);
        html += tok.cls
          ? `<span class="pui-tok-${tok.cls}">${escape(partial)}</span>`
          : escape(partial);
        html += caret;
        el.innerHTML = html;
        const [lo, hi] = charMs;
        const ms = lo + Math.random() * (hi - lo) + (partial.endsWith("\n") ? 120 : 0);
        timer = setTimeout(run, ms);
      };
      el.innerHTML = caret;
      run();
      return () => {
        cancelled = true;
        if (timer) clearTimeout(timer);
      };
    }, [tokens, loop, charMs, refToUse, tick]);

    return <pre ref={refToUse} className={cn("pui-ide__body", className)} {...rest} />;
  },
);
Body.displayName = "MockIDE.Body";

export const MockIDE = Object.assign(MockIDERoot, { Chrome, Body });
