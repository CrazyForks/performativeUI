import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import { cn } from "../utils/cn";
import { Sparkle } from "./Sparkle";

export type ChatRole = "user" | "ai";

export interface ChatBubbleProps extends ComponentPropsWithoutRef<"div"> {
  role: ChatRole;
  /** AI-only: the agent name shown in the meta row. */
  agent?: ReactNode;
  /** AI-only: text in the thinking pill (e.g. "reasoning…"). False to hide. */
  thinking?: ReactNode | false;
  /** AI-only: replace the leading sparkle. */
  icon?: ReactNode | false;
}

/**
 * Chat bubbles for fake conversations. AI bubbles ship with a meta row
 * (sparkle + agent name + thinking pill) you can fully replace.
 *
 *     <ChatBubble role="user">Hello.</ChatBubble>
 *     <ChatBubble role="ai" agent="Synthi" thinking="reasoning…">…</ChatBubble>
 */
export const ChatBubble = forwardRef<HTMLDivElement, ChatBubbleProps>(
  ({ role, agent, thinking, icon, className, children, ...rest }, ref) => (
    <div
      ref={ref}
      className={cn(
        "pui-bubble",
        role === "user" ? "pui-bubble--user" : "pui-bubble--ai",
        className,
      )}
      {...rest}
    >
      {role === "ai" && (agent || thinking !== false || icon !== false) && (
        <div className="pui-bubble__meta">
          {icon === false ? null : icon ?? <Sparkle />}
          {agent && <span>{agent}</span>}
          {thinking !== false && (
            <span className="pui-bubble__thinking-pill">
              <span className="pui-spinner pui-spinner--sm" />
              <span>{thinking ?? "thinking…"}</span>
            </span>
          )}
        </div>
      )}
      <div className="pui-bubble__stream">{children}</div>
    </div>
  ),
);
ChatBubble.displayName = "ChatBubble";
