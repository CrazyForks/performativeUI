import {
  forwardRef,
  useState,
  type ComponentPropsWithoutRef,
  type FormEvent,
  type ReactNode,
} from "react";
import { cn } from "../utils/cn";
import { Sparkle } from "./Sparkle";
import { Button } from "./Button";

export interface PromptHeroProps
  extends Omit<ComponentPropsWithoutRef<"form">, "onSubmit" | "onChange"> {
  placeholder?: string;
  /** Initial value of the input. */
  defaultValue?: string;
  /** Controlled value. If set, parent must pair with onChange. */
  value?: string;
  onChange?: (value: string) => void;
  /** Fires with the current value when the form submits. */
  onSubmit?: (value: string) => void;
  /** Replace the leading ✦ with a custom node, or pass `false` to remove. */
  leading?: ReactNode | false;
  /** CTA label. Default: "Generate". */
  ctaLabel?: ReactNode;
  /** Hide the trailing CTA. */
  hideCta?: boolean;
}

/**
 * The ChatGPT-box-as-CTA. Replace your value proposition with a text input.
 *
 *     <PromptHero onSubmit={(text) => navigate(`/build?q=${text}`)} />
 */
export const PromptHero = forwardRef<HTMLFormElement, PromptHeroProps>(
  (
    {
      placeholder = "Describe what you want to build…",
      defaultValue,
      value,
      onChange,
      onSubmit,
      leading,
      ctaLabel = "Generate",
      hideCta,
      className,
      ...rest
    },
    ref,
  ) => {
    const isControlled = value !== undefined;
    const [internal, setInternal] = useState(defaultValue ?? "");
    const v = isControlled ? value : internal;

    const handle = (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      onSubmit?.(v);
    };

    return (
      <form
        ref={ref}
        className={cn("pui-prompt", className)}
        onSubmit={handle}
        {...rest}
      >
        {leading === false ? null : (
          <span className="pui-prompt__icon">{leading ?? <Sparkle />}</span>
        )}
        <input
          className="pui-prompt__input"
          type="text"
          placeholder={placeholder}
          value={v}
          onChange={(e) => {
            const next = e.target.value;
            if (!isControlled) setInternal(next);
            onChange?.(next);
          }}
          autoComplete="off"
        />
        {!hideCta && (
          <Button type="submit" variant="glow" sparkle>
            {ctaLabel}
          </Button>
        )}
      </form>
    );
  },
);
PromptHero.displayName = "PromptHero";
