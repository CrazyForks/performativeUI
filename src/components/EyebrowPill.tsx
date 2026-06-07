import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { cn } from "../utils/cn";
import { StatusDot } from "./StatusDot";

export interface EyebrowPillProps extends ComponentPropsWithoutRef<"span"> {
  /** Provide a custom icon, or pass false to hide the dot entirely. */
  icon?: ReactNode | false;
  /** Status dot color (when using the default dot icon). */
  statusColor?: string;
}

/**
 * The mid-page section eyebrow. Houses bullet phrases like "The platform"
 * or "Now with GPT-5.5 Turbo".
 */
export const EyebrowPill = forwardRef<HTMLSpanElement, EyebrowPillProps>(
  ({ icon, statusColor, className, children, ...rest }, ref) => (
    <span ref={ref} className={cn("pui-eyebrow", className)} {...rest}>
      {icon === false ? null : icon ?? <StatusDot color={statusColor} />}
      <span>{children}</span>
    </span>
  ),
);
EyebrowPill.displayName = "EyebrowPill";
