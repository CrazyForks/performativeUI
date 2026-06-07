import type { ReactNode } from "react";

export interface Source {
  name: string;
  url: string;
}

export function Attribution({
  sources,
  extra,
}: {
  sources: Source[];
  /** "and N others who think they're snowflakes" */
  extra?: number;
}) {
  const parts: ReactNode[] = [];
  sources.forEach((s, i) => {
    if (i > 0) parts.push(<span key={`sep${i}`}>, </span>);
    parts.push(
      <a key={s.url} href={s.url} target="_blank" rel="noreferrer">
        {s.name}
      </a>,
    );
  });
  return (
    <p className="cp-attribution">
      As seen on {parts}
      {extra && extra > 0
        ? `, and ${extra.toLocaleString()} others who think they're snowflakes.`
        : "."}
    </p>
  );
}
