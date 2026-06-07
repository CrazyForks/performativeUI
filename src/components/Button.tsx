import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import { cn } from "../utils/cn";
import { Sparkle } from "./Sparkle";

export type ButtonVariant =
  | "glow"
  | "shimmer"
  | "ghost"
  | "solid"
  /** Borderless, no background. The MUI-style "text" / "edit in chat" variant. */
  | "text";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonOwnProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Render a ✦ to the right of the label. */
  sparkle?: boolean;
  /** Show a spinner and disable. */
  loading?: boolean;
  /** Full-width. */
  block?: boolean;
  children?: ReactNode;
}

export type ButtonProps<E extends ElementType = "button"> = ButtonOwnProps & {
  /** Override the rendered tag (e.g. 'a' or a routed link component). */
  as?: E;
} & Omit<ComponentPropsWithoutRef<E>, keyof ButtonOwnProps | "as">;

/**
 * Polymorphic button with four variants. Pass `as` to render an anchor
 * or routed link instead of <button>.
 *
 *    <Button>Default</Button>
 *    <Button variant="glow" sparkle>Generate</Button>
 *    <Button as="a" href="/x" variant="ghost">Talk to sales</Button>
 */
function ButtonImpl<E extends ElementType = "button">(
  {
    variant = "glow",
    size = "md",
    sparkle,
    loading,
    block,
    as,
    className,
    children,
    disabled,
    ...rest
  }: ButtonProps<E>,
  ref: Ref<Element>,
) {
  const Tag = (as ?? "button") as ElementType;
  return (
    <Tag
      ref={ref}
      className={cn(
        "pui-btn",
        `pui-btn--${variant}`,
        size !== "md" && `pui-btn--${size}`,
        block && "pui-btn--block",
        className,
      )}
      disabled={Tag === "button" ? disabled || loading : undefined}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <span className="pui-btn__spinner" aria-hidden /> : null}
      <span>{children}</span>
      {sparkle ? <Sparkle /> : null}
    </Tag>
  );
}

type PolymorphicButton = <E extends ElementType = "button">(
  props: ButtonProps<E> & { ref?: Ref<Element> },
) => ReactElement | null;

// forwardRef's typing isn't generic-friendly; the cast is the standard
// Radix/Chakra workaround for polymorphic refs.
export const Button = forwardRef(
  ButtonImpl as never,
) as unknown as PolymorphicButton;
