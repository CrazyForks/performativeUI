import {
  forwardRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import { cn } from "../utils/cn";
import { Sparkle } from "./Sparkle";

export interface ChatFABProps
  extends Omit<ComponentPropsWithoutRef<"button">, "popover"> {
  /** Button label. */
  label?: ReactNode;
  /** Controlled open state. */
  open?: boolean;
  /** Default open state for uncontrolled mode. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Popover contents. Compose ChatFAB.Header / ChatFAB.Body inside. */
  popover?: ReactNode;
}

interface FABHeaderProps extends ComponentPropsWithoutRef<"div"> {
  onClose?: () => void;
}
interface FABBodyProps extends ComponentPropsWithoutRef<"div"> {}

/**
 * The bottom-right "Ask AI" button + its popover. Compound parts:
 *   `<ChatFAB.Header onClose={…}>` for the title bar
 *   `<ChatFAB.Body>` for the content
 *
 *     <ChatFAB
 *       popover={<>
 *         <ChatFAB.Header>Hi, I'm Synthi.</ChatFAB.Header>
 *         <ChatFAB.Body>Ask me anything.</ChatFAB.Body>
 *       </>}
 *     />
 */
const ChatFABRoot = forwardRef<HTMLButtonElement, ChatFABProps>(
  (
    {
      label = "Ask AI",
      open,
      defaultOpen,
      onOpenChange,
      popover,
      className,
      onClick,
      ...rest
    },
    ref,
  ) => {
    const controlled = open !== undefined;
    const [internal, setInternal] = useState(defaultOpen ?? false);
    const isOpen = controlled ? !!open : internal;

    const toggle = () => {
      const next = !isOpen;
      if (!controlled) setInternal(next);
      onOpenChange?.(next);
    };
    const close = () => {
      if (!controlled) setInternal(false);
      onOpenChange?.(false);
    };

    return (
      <>
        <button
          ref={ref}
          className={cn("pui-fab", className)}
          onClick={(e) => {
            onClick?.(e);
            toggle();
          }}
          aria-expanded={isOpen}
          {...rest}
        >
          <Sparkle />
          <span>{label}</span>
        </button>
        {isOpen && (
          <div role="dialog" className="pui-fab-popover">
            <CloseContext.Provider value={close}>
              {popover}
            </CloseContext.Provider>
          </div>
        )}
      </>
    );
  },
);
ChatFABRoot.displayName = "ChatFAB";

import { createContext, useContext } from "react";
const CloseContext = createContext<() => void>(() => {});

const Header = forwardRef<HTMLDivElement, FABHeaderProps>(
  ({ onClose, className, children, ...rest }, ref) => {
    const ctxClose = useContext(CloseContext);
    return (
      <div ref={ref} className={cn("pui-fab-popover__header", className)} {...rest}>
        <Sparkle />
        <span>{children}</span>
        <button
          type="button"
          aria-label="Close"
          className="pui-fab-popover__close"
          onClick={onClose ?? ctxClose}
        >
          ×
        </button>
      </div>
    );
  },
);
Header.displayName = "ChatFAB.Header";

const Body = forwardRef<HTMLDivElement, FABBodyProps>(
  ({ className, ...rest }, ref) => (
    <div ref={ref} className={cn("pui-fab-popover__body", className)} {...rest} />
  ),
);
Body.displayName = "ChatFAB.Body";

export const ChatFAB = Object.assign(ChatFABRoot, { Header, Body });
