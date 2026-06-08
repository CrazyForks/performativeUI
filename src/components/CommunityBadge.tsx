import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import { cn } from "../utils/cn";

export interface CommunityBadgeProps
  extends Omit<ComponentPropsWithoutRef<"a">, "title"> {
  /** Icon src (svg). Apply your own filter if needed. */
  icon?: string;
  /** Render any node in place of <img>. */
  iconNode?: ReactNode;
  title: ReactNode;
  subtitle: ReactNode;
}

/**
 * "Star us on GitHub" / "Join the Discord", the social-proof tile.
 *
 *     <CommunityBadge
 *       icon="https://cdn.jsdelivr.net/npm/simple-icons@11/icons/github.svg"
 *       title="Star us on GitHub"
 *       subtitle={<><b>12,847</b> stars · +184 this week</>}
 *       href="https://github.com/…"
 *     />
 */
export const CommunityBadge = forwardRef<HTMLAnchorElement, CommunityBadgeProps>(
  ({ icon, iconNode, title, subtitle, className, ...rest }, ref) => (
    <a ref={ref} className={cn("pui-community", className)} {...rest}>
      {iconNode ?? (icon && <img className="pui-community__icon" src={icon} alt="" />)}
      <div>
        <div className="pui-community__top">{title}</div>
        <div className="pui-community__bottom">{subtitle}</div>
      </div>
    </a>
  ),
);
CommunityBadge.displayName = "CommunityBadge";
