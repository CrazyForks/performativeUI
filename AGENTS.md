# Contributing to performative-ui

A short guide for humans and agents working in this repo. Read this
before you touch the library or the docs site.

## Repo layout

```
src/                 Library source (published as `performative-ui`)
  components/        One file per component
  hooks/             Headless behavior hooks (useTypewriter, useCounter, ...)
  utils/cn.ts        className joiner
  index.ts           Public export barrel
  styles.css         All component styles, prefixed `.pui-*`
docs/                Docs SPA. Deployed to GitHub Pages via gh-action.
  pages/Home.tsx     The landing page
  lib/meta.tsx       The component catalog (snark, examples, props, etc.)
  lib/ComponentPage  Per-component docs page template
  App.tsx            Sidebar + routing + theme toggle + skim hotkeys
  styles.css         Site chrome only. Component styles come from src/styles.css.
demo/                The original prototype landing page. Kept for posterity,
                     not used by the npm package.
research/            Background research used while building components.
```

## Adding a new component

1. Create `src/components/MyComponent.tsx`. Style it with classes prefixed
   `.pui-mycomponent` in `src/styles.css`. Use existing CSS custom
   properties (`var(--pui-bg)`, `var(--pui-glass)`, `var(--pui-fg-dim)`,
   ...) so the component adapts to dark and light themes for free.
2. Re-export it from `src/index.ts` so consumers can `import { MyComponent }
   from "performative-ui"`. Export the props type alongside the component.
3. Add a docs entry in `docs/lib/meta.tsx`. **Insert it next to the
   other entries in its category, in the array, so the sidebar order is
   correct.** Section order is set explicitly by the `CATEGORY_ORDER`
   list in `meta.tsx`; components within a category render in array
   order. A brand-new category not listed in `CATEGORY_ORDER` still
   shows up (appended after the listed sections), but add it to the list
   to control where. The `[` / `]` skim hotkeys and the "Next: X" card
   at the bottom of each docs page both use `ORDERED_COMPONENTS` (which
   flattens `COMPONENTS` in `CATEGORY_ORDER` order), so a misplaced
   component will produce wrong-feeling navigation jumps. For example,
   putting a new Primitives entry after a Heroes entry will cause the
   previous Primitives item to skip over your new one when you press `]`.
4. The landing page shows the total component count in the eyebrow pill
   (`{COMPONENTS.length} components`). It pulls from the same array, so
   the count updates automatically once your entry is in. No manual
   number bump needed, but confirm the page renders the new total after
   `npm run build:docs`.

## Conventions

- **No em dashes anywhere** in user-visible docs, snark, descriptions,
  comments, READMEs, or component descriptions. Use a comma, a period,
  or restructure the sentence. There is a sed-style sweep we run from
  time to time that will catch any that slip through.
- **Tone:** the library is a parody but the wrapper copy reads as
  sincere ambitious AI-startup language. Don't telegraph the joke in
  the title, lede, or category names; let it land in the component
  snark. The landing page tagline (the funding-round line) is the
  load-bearing joke.
- **Component snark:** one italic-serif line under the component
  name. Punchy. Don't restate the description.
- **Em dashes again, just so you don't forget:** none.
- **Code comments:** sparing. Explain non-obvious whys and CSS
  workarounds. Don't restate what well-named code already says.
- **No emojis in code or markdown** unless the file or feature is
  explicitly about emoji glyphs (e.g., the Sparkle component).
- Style component CSS with tokens, not hardcoded colors. If you need a
  new token, add it to both the dark block and the
  `[data-theme="light"]` block in `src/styles.css`.

## Local development

```bash
npm install              # one-time
npm run dev              # starts Vite at http://localhost:5174 with HMR
npm run typecheck        # tsc --noEmit
npm run build            # builds lib + docs
npm run build:lib        # publishable npm bundle in dist/
npm run build:docs       # docs SPA in dist-docs/ (deployed to GH Pages)
```

The published artifact is whatever lives in `dist/`. The `files`
field in `package.json` only includes `dist/` and `README.md`, so
`npm publish` reflects only the last `build:lib`. Stale `dist/`
will ship stale code.

## Publishing a new version to npm

Follow the order. Each step depends on the previous.

```bash
# 1. Commit anything pending.
git status

# 2. Bump the version. This commits + tags atomically.
npm version patch      # bug fix only, no API change
npm version minor      # new component or non-breaking feature
npm version major      # breaking API change

# 3. Rebuild dist/. This is what gets published; stale dist == stale package.
npm run build:lib

# 4. (optional sanity check) See exactly what's going in the tarball.
npm publish --dry-run

# 5. Publish to npm.
npm publish

# 6. Push the version-bump commit and the tag.
git push origin main --follow-tags
```

npm requires either 2FA at the prompt or an automation token with
publish rights. If `npm publish` returns `E403` complaining about 2FA,
either pass `--otp=XXXXXX` from your authenticator or use a Classic
Automation token (set with `npm config set
//registry.npmjs.org/:_authToken <token>`).

After publishing, verify in a temp dir:

```bash
TMP=$(mktemp -d) && cd "$TMP"
npm init -y > /dev/null
npm install performative-ui@latest
node -e "import('performative-ui').then(m => console.log(Object.keys(m).length, 'exports'))"
rm -rf "$TMP"
```

## Docs site

GitHub Pages rebuilds on every push to `main` via
`.github/workflows/pages.yml`. The deploy takes about 30 seconds. The
docs always reflect HEAD, regardless of what's published on npm. If
you want the npmjs.com package page to show updated copy or a new
README, you need a fresh `npm publish` (the registry only refreshes
those fields on republish).

## Light and dark mode

The docs site has a toggle (sun and moon icon in the sidebar header).
The library itself is themed by setting `data-theme="light"` on any
ancestor (typically `<html>`). All themeable values are defined as
CSS custom properties at the top of `src/styles.css`; the
`[data-theme="light"]` block re-maps the same token names to light
values. Components that should stay dark in light mode (MockIDE, the
home page hero) pin `data-theme="dark"` on their root.

When adding a new component:

- Use tokens for any color, background, border, shadow. If you need a
  surface that doesn't exist yet, add a paired token.
- Verify both themes look right. Toggle the docs site to check.

## Skim navigation

The docs use `[` and `]` to jump between component pages. They walk
`ORDERED_COMPONENTS`, which flattens `COMPONENTS` in `CATEGORIES`
order. As long as you add your new entry at the right position in
the `COMPONENTS` array (within its category section), the keyboard
shortcuts and the bottom "Next: X" card will both pick it up
without further changes.
