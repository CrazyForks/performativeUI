import {
  forwardRef,
  useId,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import { cn } from "../utils/cn";

export interface BigBackLink {
  label: ReactNode;
  href?: string;
}

export interface BigBackColumn {
  heading: ReactNode;
  links: BigBackLink[];
}

export interface BigBackProps
  extends Omit<ComponentPropsWithoutRef<"footer">, "title"> {
  /** The company name, rendered as the wall-sized wordmark. Required. */
  company: string;
  /** Footer link columns shown above the wordmark. */
  columns?: BigBackColumn[];
  /** Small links in the baseline row (e.g. social, status). */
  social?: BigBackLink[];
  /** Baseline-row text on the left. Default `"All rights reserved"`. */
  copyright?: ReactNode;
  /** Fill the wordmark with the brand gradient. Default false. */
  gradient?: boolean;
}

/**
 * A footer whose only real content is the company name set wall-sized,
 * the way every well-funded startup signs off now. The wordmark is an
 * SVG that stretches to the full footer width (short names get fat
 * letters, long names get condensed ones), so it always bleeds edge to
 * edge. The link columns up top are the alibi.
 */
export const BigBack = forwardRef<HTMLElement, BigBackProps>(
  (
    {
      company,
      columns,
      social,
      copyright = "All rights reserved",
      gradient = false,
      className,
      ...rest
    },
    ref,
  ) => {
    const gid = useId().replace(/:/g, "");
    const fill = gradient ? `url(#${gid})` : "currentColor";

    const wordmark = (
      <svg
        className="pui-bigback__svg"
        viewBox="0 0 1000 200"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={company}
      >
        {gradient && (
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--pui-grad-from)" />
              <stop offset="50%" stopColor="var(--pui-grad-mid)" />
              <stop offset="100%" stopColor="var(--pui-grad-to)" />
            </linearGradient>
          </defs>
        )}
        <text
          x="500"
          y="100"
          textAnchor="middle"
          dominantBaseline="central"
          textLength="1000"
          lengthAdjust="spacingAndGlyphs"
          fill={fill}
        >
          {company}
        </text>
      </svg>
    );

    return (
      <footer ref={ref} className={cn("pui-bigback", className)} {...rest}>
        {columns && columns.length > 0 && (
          <nav className="pui-bigback__cols" aria-label="Footer">
            {columns.map((col, i) => (
              <div key={i} className="pui-bigback__col">
                <div className="pui-bigback__heading">{col.heading}</div>
                <ul className="pui-bigback__list">
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <a className="pui-bigback__link" href={link.href ?? "#"}>
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        )}

        <div className="pui-bigback__wordmark">{wordmark}</div>

        <div className="pui-bigback__base">
          <span className="pui-bigback__copyright">{copyright}</span>
          {social && social.length > 0 && (
            <span className="pui-bigback__social">
              {social.map((link, i) => (
                <a key={i} className="pui-bigback__link" href={link.href ?? "#"}>
                  {link.label}
                </a>
              ))}
            </span>
          )}
        </div>
      </footer>
    );
  },
);
BigBack.displayName = "BigBack";
