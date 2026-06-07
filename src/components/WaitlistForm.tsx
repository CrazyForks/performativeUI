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
      ctaLabel = "Join the waitlist",
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
      <form
        ref={ref}
        className={cn("pui-waitlist", className)}
        onSubmit={submit}
        {...rest}
      >
        <input
          className="pui-waitlist__input"
          type="email"
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <Button type="submit" variant="glow" sparkle>
          {ctaLabel}
        </Button>
      </form>
    );
  },
);
WaitlistForm.displayName = "WaitlistForm";
