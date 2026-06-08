import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { cn } from "../utils/cn";

export interface PromptProps
  extends Omit<ComponentPropsWithoutRef<"form">, "onSubmit" | "onChange"> {
  /* ----- text ----- */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Fires when the form submits. Receives the text + a context blob. */
  onSubmit?: (value: string, ctx: { model?: string }) => void;
  placeholder?: string;
  /** Initial textarea height (rows). */
  rows?: number;

  /* ----- model dropdown ----- */
  models?: string[];
  model?: string;
  defaultModel?: string;
  onModelChange?: (model: string) => void;

  /* ----- toolbar callbacks ----- */
  onAddContext?: () => void;
  onVoice?: () => void;

  /* ----- hide bits ----- */
  hideAddContext?: boolean;
  hideModel?: boolean;
  hideVoice?: boolean;
  hideSend?: boolean;

  /** Cmd/Ctrl+Enter inside the textarea submits. Default true. */
  submitOnCmdEnter?: boolean;

  /** Optional node rendered in the right side of the toolbar before the
   *  voice + send buttons (e.g. a "Cmd+↵" keyboard hint). */
  toolbarExtras?: ReactNode;
}

const DEFAULT_MODELS = [
  "GPT-5 Turbo Vision",
  "Claude Opus 4.7",
  "Gemini 3 Pro",
];

/**
 * The multi-line prompt input every AI builder app ships: textarea on
 * top, toolbar on the bottom (+ for context, model dropdown, mic for
 * voice mode, gradient send arrow). Pair it with a gradient hero or
 * drop it standalone.
 *
 *     <Prompt
 *       models={["GPT-5", "Claude 4.7", "Gemini 3"]}
 *       onSubmit={(text, { model }) => generate(text, model)}
 *     />
 */
export const Prompt = forwardRef<HTMLFormElement, PromptProps>(
  (
    {
      value: controlledValue,
      defaultValue = "",
      onChange,
      onSubmit,
      placeholder = "Build me a…",
      rows = 3,
      models = DEFAULT_MODELS,
      model: controlledModel,
      defaultModel,
      onModelChange,
      onAddContext,
      onVoice,
      hideAddContext,
      hideModel,
      hideVoice,
      hideSend,
      submitOnCmdEnter = true,
      toolbarExtras,
      className,
      ...rest
    },
    ref,
  ) => {
    const isControlledValue = controlledValue !== undefined;
    const [internalValue, setInternalValue] = useState(defaultValue);
    const value = isControlledValue ? controlledValue : internalValue;

    const isControlledModel = controlledModel !== undefined;
    const [internalModel, setInternalModel] = useState(
      defaultModel ?? models[0] ?? "",
    );
    const model = isControlledModel ? controlledModel : internalModel;

    const [menuOpen, setMenuOpen] = useState(false);
    const modelWrapRef = useRef<HTMLDivElement>(null);

    // Click-outside to close the model menu.
    useEffect(() => {
      if (!menuOpen) return;
      const onDown = (e: MouseEvent) => {
        if (!modelWrapRef.current?.contains(e.target as Node)) {
          setMenuOpen(false);
        }
      };
      document.addEventListener("mousedown", onDown);
      return () => document.removeEventListener("mousedown", onDown);
    }, [menuOpen]);

    const setValue = (v: string) => {
      if (!isControlledValue) setInternalValue(v);
      onChange?.(v);
    };
    const setModel = (m: string) => {
      if (!isControlledModel) setInternalModel(m);
      onModelChange?.(m);
      setMenuOpen(false);
    };

    const submit = (e?: FormEvent) => {
      e?.preventDefault();
      onSubmit?.(value, { model });
    };
    const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (submitOnCmdEnter && e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        submit();
      }
    };

    return (
      <form
        ref={ref}
        className={cn("pui-promptbox", className)}
        onSubmit={submit}
        {...rest}
      >
        <textarea
          className="pui-promptbox__textarea"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKey}
          placeholder={placeholder}
          rows={rows}
        />
        <div className="pui-promptbox__toolbar">
          {!hideAddContext && (
            <button
              type="button"
              className="pui-promptbox__iconbtn"
              onClick={onAddContext}
              title="Add context"
              aria-label="Add context"
            >
              <IconPlus />
            </button>
          )}
          {!hideModel && models.length > 0 && (
            <div className="pui-promptbox__model-wrap" ref={modelWrapRef}>
              <button
                type="button"
                className="pui-promptbox__model"
                onClick={() => setMenuOpen((v) => !v)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
              >
                <span>{model}</span>
                <IconChevron />
              </button>
              {menuOpen && (
                <div className="pui-promptbox__menu" role="menu">
                  {models.map((m) => (
                    <button
                      key={m}
                      type="button"
                      className={cn(
                        "pui-promptbox__menu-item",
                        m === model && "pui-promptbox__menu-item--active",
                      )}
                      onClick={() => setModel(m)}
                      role="menuitemradio"
                      aria-checked={m === model}
                    >
                      <span>{m}</span>
                      {m === model && <IconCheck />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="pui-promptbox__spacer" />
          {toolbarExtras}
          {!hideVoice && (
            <button
              type="button"
              className="pui-promptbox__iconbtn"
              onClick={onVoice}
              title="Voice mode"
              aria-label="Voice mode"
            >
              <IconMic />
            </button>
          )}
          {!hideSend && (
            <button
              type="submit"
              className="pui-promptbox__iconbtn pui-promptbox__send"
              title="Send"
              aria-label="Send"
            >
              <IconSend />
            </button>
          )}
        </div>
      </form>
    );
  },
);
Prompt.displayName = "Prompt";

/* ---------- Inline SVG icons (no external deps) ---------- */

function IconPlus() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function IconChevron() {
  return (
    <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
function IconMic() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M19 10a7 7 0 0 1-14 0" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  );
}
function IconSend() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
