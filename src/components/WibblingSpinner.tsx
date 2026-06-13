import {
  forwardRef,
  useEffect,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import { cn } from "../utils/cn";

/** The macOS glyph cycle used by Claude Code. */
export const DEFAULT_GLYPHS = ["·", "✢", "✳", "✶", "✻", "✽"];

/**
 * The full 186-entry verb pool from Claude Code's spinner. We ship it
 * inline so consumers don't have to wire up their own list to get the
 * canonical feel.
 */
export const DEFAULT_VERBS = [
  "Accomplishing","Actioning","Actualizing","Architecting","Baking","Beaming",
  "Befuddling","Billowing","Blanching","Bloviating","Boogieing","Boondoggling",
  "Booping","Bootstrapping","Brewing","Bunning","Burrowing","Calculating",
  "Canoodling","Caramelizing","Cascading","Catapulting","Cerebrating",
  "Channeling","Channelling","Choreographing","Churning","Clauding","Coalescing",
  "Cogitating","Combobulating","Composing","Computing","Concocting",
  "Considering","Contemplating","Cooking","Crafting","Creating","Crunching",
  "Crystallizing","Cultivating","Deciphering","Deliberating","Determining",
  "Dilly-dallying","Discombobulating","Doing","Doodling","Drizzling","Ebbing",
  "Effecting","Elucidating","Embellishing","Enchanting","Envisioning",
  "Evaporating","Fermenting","Fiddle-faddling","Finagling","Flambéing",
  "Flibbertigibbeting","Flowing","Flummoxing","Fluttering","Forging","Forming",
  "Frolicking","Frosting","Gallivanting","Galloping","Garnishing","Generating",
  "Gesticulating","Germinating","Gitifying","Grooving","Gusting","Harmonizing",
  "Hashing","Hatching","Herding","Honking","Hullaballooing","Hyperspacing",
  "Ideating","Imagining","Improvising","Incubating","Inferring","Infusing",
  "Ionizing","Jitterbugging","Julienning","Kneading","Leavening","Levitating",
  "Lollygagging","Manifesting","Marinating","Meandering","Metamorphosing",
  "Misting","Moonwalking","Moseying","Mulling","Mustering","Musing",
  "Nebulizing","Nesting","Newspapering","Noodling","Nucleating","Orbiting",
  "Orchestrating","Osmosing","Perambulating","Percolating","Perusing",
  "Philosophising","Photosynthesizing","Pollinating","Pondering","Pontificating",
  "Pouncing","Precipitating","Prestidigitating","Processing","Proofing",
  "Propagating","Puttering","Puzzling","Quantumizing","Razzle-dazzling",
  "Razzmatazzing","Recombobulating","Reticulating","Roosting","Ruminating",
  "Sautéing","Scampering","Schlepping","Scurrying","Seasoning","Shenaniganing",
  "Shimmying","Simmering","Skedaddling","Sketching","Slithering","Smooshing",
  "Sock-hopping","Spelunking","Spinning","Sprouting","Stewing","Sublimating",
  "Swirling","Swooping","Symbioting","Synthesizing","Tempering","Thinking",
  "Thundering","Tinkering","Tomfoolering","Topsy-turvying","Transfiguring",
  "Transmuting","Twisting","Undulating","Unfurling","Unravelling","Vibing",
  "Waddling","Wandering","Warping","Whatchamacalliting","Whirlpooling","Whirring",
  "Whisking","Wibbling","Working","Wrangling","Zesting","Zigzagging",
];

export interface WibblingSpinnerProps
  extends ComponentPropsWithoutRef<"span"> {
  /**
   * Verb pool. Defaults to the full 186-word Claude Code list.
   * Pass `["Hardcoding"]` to pin a single verb.
   */
  verbs?: string[];
  /** Cycle of glyphs to rotate through. */
  glyphs?: string[];
  /** ms between glyph frames. Default 250. */
  glyphInterval?: number;
  /**
   * ms between verb re-rolls. If omitted, the spinner picks one
   * verb at mount and doesn't change it. Pass a number to cycle
   * (e.g. 3000 for the real Claude Code feel).
   */
  verbInterval?: number;
  /** Suffix glyph after the verb. Default an ellipsis. */
  ellipsis?: string;
  /**
   * Parenthetical content rendered after the verb (e.g. "10s · ↓ 193
   * tokens"). React's default reconciliation already isolates state
   * inside child components, so passing a stateful child here (a live
   * counter, a token tally) will update without re-rendering the
   * spinner or resetting its verb / glyph.
   */
  info?: ReactNode;
  /** CSS color for the rotating glyph. Defaults to var(--pui-warn). */
  glyphColor?: string;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * The Claude Code loading spinner, faithfully. Cycles a glyph through
 * `· ✢ ✳ ✶ ✻ ✽` every 120ms and re-rolls the verb every 3 seconds.
 * Pass `info` for the trailing parenthetical (e.g. "10s · ↓ 193 tokens").
 *
 *     <WibblingSpinner info="10s · ↓ 193 tokens" />
 */
export const WibblingSpinner = forwardRef<HTMLSpanElement, WibblingSpinnerProps>(
  (
    {
      verbs = DEFAULT_VERBS,
      glyphs = DEFAULT_GLYPHS,
      glyphInterval = 250,
      verbInterval,
      ellipsis = "…",
      info,
      glyphColor,
      className,
      ...rest
    },
    ref,
  ) => {
    const [glyphIdx, setGlyphIdx] = useState(0);
    const [rolled, setRolled] = useState<string>(() =>
      verbs.length ? pick(verbs) : "",
    );

    useEffect(() => {
      if (!glyphs.length) return;
      const id = setInterval(() => {
        setGlyphIdx((i) => (i + 1) % glyphs.length);
      }, glyphInterval);
      return () => clearInterval(id);
    }, [glyphInterval, glyphs.length]);

    useEffect(() => {
      if (verbInterval == null) return; // single pick at mount, never re-roll
      if (!verbs.length) return;
      const id = setInterval(() => {
        setRolled(pick(verbs));
      }, verbInterval);
      return () => clearInterval(id);
    }, [verbs, verbInterval]);

    const displayVerb = rolled;

    return (
      <span ref={ref} className={cn("pui-wibble", className)} {...rest}>
        <span
          className="pui-wibble__glyph"
          aria-hidden="true"
          style={glyphColor ? { color: glyphColor } : undefined}
        >
          {glyphs[glyphIdx] ?? ""}
        </span>
        <span className="pui-wibble__verb">
          {displayVerb}
          {ellipsis}
        </span>
        {info != null && info !== false && (
          <span className="pui-wibble__info">({info})</span>
        )}
      </span>
    );
  },
);
WibblingSpinner.displayName = "WibblingSpinner";
