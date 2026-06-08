import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import { cn } from "../utils/cn";

export type LogoRowItem =
  | { kind: "img"; src: string; alt?: string }
  | { kind: "node"; node: ReactNode; key?: string };

export interface LogoRowProps extends ComponentPropsWithoutRef<"div"> {
  /** Header copy ("Backed by", "From alumni of", "As seen in"). */
  heading?: ReactNode;
  logos: LogoRowItem[];
}

/**
 * A static row of logos for backers / press / universities, anywhere
 * you'd put a "Backed by" or "As seen in" caption.
 */
export const LogoRow = forwardRef<HTMLDivElement, LogoRowProps>(
  ({ heading, logos, className, ...rest }, ref) => (
    <div ref={ref} className={cn("pui-logo-row", className)} {...rest}>
      {heading && <p className="pui-logo-row__heading">{heading}</p>}
      <div className="pui-logo-row__items">
        {logos.map((it, i) =>
          it.kind === "img" ? (
            <img key={i} src={it.src} alt={it.alt ?? ""} />
          ) : (
            <span key={it.key ?? i} className="pui-logo-row__text">
              {it.node}
            </span>
          ),
        )}
      </div>
    </div>
  ),
);
LogoRow.displayName = "LogoRow";
