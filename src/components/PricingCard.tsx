import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import { cn } from "../utils/cn";
import { Sparkle } from "./Sparkle";

export interface PricingCardProps extends ComponentPropsWithoutRef<"article"> {
  /** Apply the "Pro" tier glow + lift. */
  featured?: boolean;
}

interface FlagProps extends ComponentPropsWithoutRef<"div"> {
  /** Hide the leading sparkle. */
  hideSparkle?: boolean;
}
interface TierProps extends ComponentPropsWithoutRef<"div"> {}
interface AmountProps extends ComponentPropsWithoutRef<"div"> {
  /** Suffix like "/mo". Renders smaller, dimmer. */
  unit?: ReactNode;
}
interface BlurbProps extends ComponentPropsWithoutRef<"p"> {}
interface FeaturesProps extends ComponentPropsWithoutRef<"ul"> {}
interface CTAProps extends ComponentPropsWithoutRef<"a"> {}

/**
 * Pricing card. Compose any subset of subcomponents in any order.
 *
 *     <PricingCard featured>
 *       <PricingCard.Flag>Most popular</PricingCard.Flag>
 *       <PricingCard.Tier>Pro</PricingCard.Tier>
 *       <PricingCard.Amount unit="/mo">$49</PricingCard.Amount>
 *       <PricingCard.Blurb>For serious builders.</PricingCard.Blurb>
 *       <PricingCard.Features>
 *         <li>Unlimited projects</li>
 *       </PricingCard.Features>
 *       <PricingCard.CTA href="/upgrade">Upgrade</PricingCard.CTA>
 *     </PricingCard>
 */
const PricingRoot = forwardRef<HTMLElement, PricingCardProps>(
  ({ featured, className, ...rest }, ref) => (
    <article
      ref={ref as React.Ref<HTMLElement>}
      className={cn("pui-price", featured && "pui-price--featured", className)}
      {...rest}
    />
  ),
);
PricingRoot.displayName = "PricingCard";

const Flag = forwardRef<HTMLDivElement, FlagProps>(
  ({ hideSparkle, className, children, ...rest }, ref) => (
    <div ref={ref} className={cn("pui-price__flag", className)} {...rest}>
      {!hideSparkle && <Sparkle solid />}
      <span>{children}</span>
    </div>
  ),
);
Flag.displayName = "PricingCard.Flag";

const Tier = forwardRef<HTMLDivElement, TierProps>(
  ({ className, ...rest }, ref) => (
    <div ref={ref} className={cn("pui-price__tier", className)} {...rest} />
  ),
);
Tier.displayName = "PricingCard.Tier";

const Amount = forwardRef<HTMLDivElement, AmountProps>(
  ({ unit, className, children, ...rest }, ref) => (
    <div ref={ref} className={cn("pui-price__amount", className)} {...rest}>
      {children}
      {unit && <span className="pui-price__amount-unit">{unit}</span>}
    </div>
  ),
);
Amount.displayName = "PricingCard.Amount";

const Blurb = forwardRef<HTMLParagraphElement, BlurbProps>(
  ({ className, ...rest }, ref) => (
    <p ref={ref} className={cn("pui-price__blurb", className)} {...rest} />
  ),
);
Blurb.displayName = "PricingCard.Blurb";

const Features = forwardRef<HTMLUListElement, FeaturesProps>(
  ({ className, ...rest }, ref) => (
    <ul ref={ref} className={cn("pui-price__features", className)} {...rest} />
  ),
);
Features.displayName = "PricingCard.Features";

const CTA = forwardRef<HTMLAnchorElement, CTAProps>(
  ({ className, children, ...rest }, ref) => (
    <a ref={ref} className={cn("pui-btn pui-btn--glow pui-btn--block", className)} {...rest}>
      <span>{children}</span>
    </a>
  ),
);
CTA.displayName = "PricingCard.CTA";

export const PricingCard = Object.assign(PricingRoot, {
  Flag,
  Tier,
  Amount,
  Blurb,
  Features,
  CTA,
});
