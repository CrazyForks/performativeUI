/**
 * Minimal classname joiner. Accepts strings, undefined, false, or arrays.
 * Trims, dedupes whitespace, and returns a single string.
 */
export type ClassValue =
  | string
  | number
  | null
  | undefined
  | false
  | ClassValue[];

export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];
  const walk = (v: ClassValue): void => {
    if (!v) return;
    if (typeof v === "string" || typeof v === "number") {
      out.push(String(v));
    } else if (Array.isArray(v)) {
      v.forEach(walk);
    }
  };
  inputs.forEach(walk);
  return out.join(" ");
}
