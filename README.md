# performative-ui

A React component library of the world's most performative AI-startup
landing-page tropes. Tongue firmly in cheek.

**Docs & live demos:** https://vorpus.github.io/performativeUI/

## Install

```bash
npm install performative-ui
```

Then in your entry file:

```ts
import "performative-ui/styles.css";
```

## What's in the box

Twenty-four components across nine categories — all themeable via CSS
custom properties on `:root` and customizable per-instance via props,
`className`/`style` passthrough, render props, and headless hooks.

- **Atoms** — `Sparkle`, `GradientText`, `StatusDot`
- **Primitives** — `Button` (polymorphic, four variants), `EyebrowPill`
- **Banners** — `StickyBanner`
- **Heroes** — `Rotator` (typewriter), `WordRoll` (vertical slide),
  `PromptHero` (ChatGPT-box-as-CTA), `AsciiHero` (canvas-rendered
  ASCII field with cursor spotlight + aurora palette)
- **Backgrounds** — `Aurora`, `NodeGraphBackground`, `FloatingSparkles`
- **Surfaces** — `GlassCard` (compound), `MockIDE` (compound, with
  token-by-token code stream)
- **Conversation** — `ChatBubble`, `TokenStream`, `ChatFAB` (compound)
- **Social proof** — `LogoMarquee`, `LogoRow`, `StatCounter`,
  `CommunityBadge`
- **Pricing & Conversion** — `PricingCard` (compound), `BeforeAfter`,
  `WaitlistForm`

Plus four headless hooks for when you want our behavior with your own
markup: `useTypewriter`, `useCounter`, `useTokenStream`, `useAsciiField`.

## Example

```tsx
import {
  Aurora,
  AsciiHero,
  GradientText,
  Rotator,
  PromptHero,
} from "performative-ui";
import "performative-ui/styles.css";

export function Hero() {
  return (
    <section style={{ position: "relative", padding: 80, isolation: "isolate" }}>
      <Aurora />
      <AsciiHero
        variant="bare"
        colorful
        baseOpacity={0.18}
        spotlightOpacity={0.9}
        style={{ position: "absolute", inset: 0, zIndex: 1 }}
      />
      <div style={{ position: "relative", zIndex: 2 }}>
        <h1>
          AI for{" "}
          <GradientText>
            <Rotator words={["doctors", "lawyers", "founders", "everyone"]} />
          </GradientText>
        </h1>
        <PromptHero onSubmit={(text) => console.log(text)} />
      </div>
    </section>
  );
}
```

## Theming

Override any of the CSS custom properties on `:root` (or any ancestor)
to retheme. The full list lives at the top of `dist/performative-ui.css`,
but the load-bearing ones are:

```css
:root {
  --pui-bg:        #08080b;
  --pui-fg:        #f4f4f6;
  --pui-grad-from: #7c3aed;
  --pui-grad-mid:  #ec4899;
  --pui-grad-to:   #06b6d4;
}
```

## License

MIT
