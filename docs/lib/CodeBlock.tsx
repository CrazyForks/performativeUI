import { useState } from "react";

export function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked, fail silently */
    }
  };
  return (
    <div className="example__code">
      <button className="code-copy" onClick={copy} type="button">
        {copied ? "copied" : "copy"}
      </button>
      <pre className="code-block">{code.trim()}</pre>
    </div>
  );
}
