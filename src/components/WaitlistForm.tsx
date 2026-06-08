import {
  forwardRef,
  useState,
  type ComponentPropsWithoutRef,
  type FormEvent,
  type ReactNode,
} from "react";
import { cn } from "../utils/cn";
import { Button } from "./Button";

export interface WaitlistFormProps
  extends Omit<ComponentPropsWithoutRef<"form">, "onSubmit"> {
  placeholder?: string;
  defaultValue?: string;
  ctaLabel?: ReactNode;
  /** Leading icon. Pass false to remove. Default: envelope. */
  leading?: ReactNode | false;
  /** Tiny line of text rendered below the form (e.g. "We email weekly."). */
  footnote?: ReactNode;
  /** Fires with the email value on submit. */
  onSubmit?: (email: string) => void;
}

/**
 * Inline email-capture waitlist form. Pair with a `<StatCounter>` for the
 * "Join 8,247 builders" headline above it.
 */
export const WaitlistForm = forwardRef<HTMLFormElement, WaitlistFormProps>(
  (
    {
      placeholder = "you@startup.ai",
      defaultValue = "",
      ctaLabel = "Notify me",
      leading,
      footnote,
      onSubmit,
      className,
      ...rest
    },
    ref,
  ) => {
    const [value, setValue] = useState(defaultValue);
    const submit = (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      onSubmit?.(value);
    };
    return (
      <div className={cn("pui-waitlist-wrap", className)}>
        <form
          ref={ref}
          className="pui-waitlist"
          onSubmit={submit}
          {...rest}
        >
          {leading === false ? null : (
            <span className="pui-waitlist__icon" aria-hidden="true">
              {leading ?? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  width="18"
                  height="18"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M3 7l9 6 9-6" />
                </svg>
              )}
            </span>
          )}
          <input
            className="pui-waitlist__input"
            type="email"
            placeholder={placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <Button type="submit" variant="solid">
            {ctaLabel}
          </Button>
        </form>
        {footnote && (
          <div className="pui-waitlist__footnote">{footnote}</div>
        )}
      </div>
    );
  },
);
WaitlistForm.displayName = "WaitlistForm";
