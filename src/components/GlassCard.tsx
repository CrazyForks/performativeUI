import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import { cn } from "../utils/cn";

export interface GlassCardProps extends ComponentPropsWithoutRef<"article"> {
  /** Apply the slow breathing glow animation. */
  breathing?: boolean;
  /** Show the gradient halo on hover. */
  glowOnHover?: boolean;
}

interface GlassCardIconProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
}
interface GlassCardTitleProps extends ComponentPropsWithoutRef<"h3"> {}
interface GlassCardBodyProps extends ComponentPropsWithoutRef<"p"> {}
interface GlassCardLinkProps extends ComponentPropsWithoutRef<"a"> {}

/**
 * Glassmorphism feature card. Compound: drop the sub-parts wherever.
 *
 *     <GlassCard breathing glowOnHover>
 *       <GlassCard.Icon>✦</GlassCard.Icon>
 *       <GlassCard.Title>Reason</GlassCard.Title>
 *       <GlassCard.Body>Multi-step, multi-modal, multi-vendor.</GlassCard.Body>
 *       <GlassCard.Link href="/learn">Learn more</GlassCard.Link>
 *     </GlassCard>
 */
const GlassCardRoot = forwardRef<HTMLElement, GlassCardProps>(
  ({ breathing, glowOnHover = true, className, children, ...rest }, ref) => (
    <article
      ref={ref as React.Ref<HTMLElement>}
      className={cn(
        "pui-glass-card",
        breathing && "pui-glass-card--breathing",
        glowOnHover && "pui-glass-card--glow-hover",
        className,
      )}
      {...rest}
    >
      {children}
    </article>
  ),
);
GlassCardRoot.displayName = "GlassCard";

const Icon = forwardRef<HTMLDivElement, GlassCardIconProps>(
  ({ className, ...rest }, ref) => (
    <div ref={ref} className={cn("pui-glass-card__icon", className)} {...rest} />
  ),
);
Icon.displayName = "GlassCard.Icon";

const Title = forwardRef<HTMLHeadingElement, GlassCardTitleProps>(
  ({ className, ...rest }, ref) => (
    <h3 ref={ref} className={cn("pui-glass-card__title", className)} {...rest} />
  ),
);
Title.displayName = "GlassCard.Title";

const Body = forwardRef<HTMLParagraphElement, GlassCardBodyProps>(
  ({ className, ...rest }, ref) => (
    <p ref={ref} className={cn("pui-glass-card__body", className)} {...rest} />
  ),
);
Body.displayName = "GlassCard.Body";

const Link = forwardRef<HTMLAnchorElement, GlassCardLinkProps>(
  ({ className, children, ...rest }, ref) => (
    <a ref={ref} className={cn("pui-glass-card__link", className)} {...rest}>
      <span>{children}</span>
      <span className="pui-arrow">→</span>
    </a>
  ),
);
Link.displayName = "GlassCard.Link";

export const GlassCard = Object.assign(GlassCardRoot, {
  Icon,
  Title,
  Body,
  Link,
});
