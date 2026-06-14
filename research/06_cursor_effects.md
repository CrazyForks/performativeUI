# 06 — Cursor Effects in the Wild

> Survey of startups, products, and sites doing something delightful with
> the user's mouse pointer. Compiled 2026-06-13.
>
> Each entry: **Name** — what it does — `url` — *category tags* — *I-beam?*
>
> Category tags used throughout:
>
> - **presence** — other people's cursors render on top of yours
>   (multiplayer). OS pointer otherwise untouched.
> - **replace** — the OS pointer is hidden (`cursor: none`) and a DOM
>   element follows pointermove in its place.
> - **spotlight** — OS pointer stays visible; content under it reacts
>   (radial mask, glow, distortion).
> - **trail** — particles, ribbons, or motion artifacts spawn behind the
>   cursor on movement. Usually tied to velocity.
>
> *I-beam?* flags whether the site also overrides the text cursor (`cursor:
> text`) — usually yes if **replace** is set, since the OS pointer is gone
> everywhere.
>
> Triage rule: an entry qualifies if the cursor behavior would be
> *visibly missed* if removed. Generic `:hover` lift effects don't count.

---

## Table of Contents

1. [Multiplayer presence](#1-multiplayer-presence)
2. [Custom pointer (OS cursor hidden)](#2-custom-pointer-os-cursor-hidden)
3. [Cursor as spotlight](#3-cursor-as-spotlight)
4. [Trails and particles](#4-trails-and-particles)
5. [Honourable mentions / further reading](#5-honourable-mentions--further-reading)
6. [Patterns and implementation notes](#6-patterns-and-implementation-notes)

---

# 1. Multiplayer presence

Other collaborators' cursors render on top of your canvas. The OS pointer
is left alone; the magic is the floating label, color, and chat bubble
attached to each cursor. Useful for "this is a place, not a document"
emotional framing — the canvas feels populated.

- **Figma** — Live multiplayer cursors with the collaborator's name on a
  colored pill, plus cursor chat (press `/` to type a temporary message
  anchored to your pointer). — `figma.com` — *presence* — *I-beam: no*
- **FigJam** — Same cursors as Figma plus stamp/emoji reactions that fire
  off near your pointer when you click them. Same multiplayer engine,
  different garnish. — `figma.com/figjam` — *presence* — *I-beam: no*
- **Pitch** — Cursors in presentation mode carry small floating video
  avatars instead of just name labels, so you watch the person nod or
  shake their head while their cursor moves. The "video-cursor" pattern
  Prototypr.io credits Pitch with pioneering. — `pitch.com` — *presence*
  — *I-beam: no*
- **tldraw** — Live cursors smoothed by the open-source `perfect-cursors`
  interpolation library, so motion stays continuous between server ticks
  rather than teleporting frame to frame. The colored arrow replaces the
  OS pointer inside the canvas. They wrote a whole blog post with
  Liveblocks about going viral on this. — `tldraw.com` — *presence,
  replace* — *I-beam: no*
- **Excalidraw** — Hand-drawn-style multiplayer arrows with the user's
  name and a follow-mode toggle that locks your viewport to someone
  else's. — `excalidraw.com` — *presence* — *I-beam: no*
- **Linear** — Cursor presence in shared issue/document views. The
  marketing site itself adds a soft hover wash on cards as the pointer
  travels across them. — `linear.app` — *presence, spotlight* —
  *I-beam: no*
- **Notion** — Lightweight collaborator cursors in shared docs with name
  pills; less expressive than Figma's but the canonical doc-mode
  reference. — `notion.so` — *presence* — *I-beam: no*
- **Liveblocks** (the building block, not a product) — Sells multiplayer
  cursors as an SDK to everyone else. Worth listing because their
  showcase gallery is the easiest single-page survey of multiplayer
  cursor patterns across customers. — `liveblocks.io/showcase` —
  *presence* — *I-beam: no*

---

# 2. Custom pointer (OS cursor hidden)

`body { cursor: none }` and a DOM element follows `pointermove`. These
sites typically also drop the I-beam over text and the pointer over
links, since the OS cursor is gone everywhere — they're committing to
the bit.

- **Cuberto** — The agency that wrote the playbook. Cursor is a small
  circle that morphs into a label on hover-over-link ("Read more"), an
  arrow on draggable content, a play button on video tiles. They
  open-sourced the engine as `mouse-follower` (gsap-based). Most
  studios with a custom cursor either use this library or one inspired
  by it. — `cuberto.com` — *replace* — *I-beam: yes*
- **Active Theory** — Per-section custom cursor styles with magnet-snap
  to interactive targets; usually paired with full-page WebGL backdrops
  that distort around the pointer position. — `activetheory.net` —
  *replace, trail, spotlight* — *I-beam: yes*
- **Studio Birthplace** — Tiny custom cursor over WebGL film grain and
  video backdrops that ripple around the pointer. — `studiobirthplace.com`
  — *replace, spotlight* — *I-beam: yes*
- **Cursomizer** — Awwwards honourable mention. The whole page is a
  cursor playground: pick a shape, color, and trail and the site
  previews it as your real cursor live. As meta as it gets. —
  `cursomizer.com` — *replace, trail* — *I-beam: yes*
- **Fluks Studio** (referenced in `blog.readymag.com`) — Cursor morphs
  into different colors and textures as you hover over particular
  widgets. — `fluksstudio.com` — *replace* — *I-beam: yes*

---

# 3. Cursor as spotlight

OS pointer stays put. Content under it brightens, distorts, or unmasks.
Usually a CSS variable updated from a `pointermove` handler, sometimes
WebGL.

- **Stripe** — The canonical "flashlight" card grid: a soft radial
  gradient on each card highlights whichever one you're over, falling
  off with distance. Pure CSS-vars + a single `pointermove` listener
  computing the pointer position relative to each card. Now ubiquitous
  across post-2023 SaaS marketing pages. — `stripe.com` — *spotlight* —
  *I-beam: no*
- **Vercel** — Card border that only lights up on the side facing your
  cursor — same `pointermove` math, applied to a border-image mask
  rather than a background gradient. Sharper, more directional than the
  Stripe pattern. — `vercel.com` — *spotlight* — *I-beam: no*
- **tonsky.me — Every Frame Perfect** — Frame-by-frame critiques of
  native macOS app animations. A magnifying-glass overlay element
  points readers at the pixel to watch during each animation — it isn't
  your literal pointer, but it functions as a "where to look" cursor
  for a reader trying to spot a one-frame skip. Listed because the
  effect is a cursor-shaped reading aid and the technique generalizes.
  — `tonsky.me/blog/every-frame-perfect/` — *spotlight* — *I-beam: no*
- **OHZI Interactive** — Awwwards Site of the Day. WebGL field that
  warps in response to cursor velocity; fast motion shears the entire
  layout. The pointer is still visible but the whole page is the
  spotlight. — `ohzi.com` — *spotlight, trail* — *I-beam: no*

---

# 4. Trails and particles

OS pointer is usually still visible, with particles or ribbons spawned
behind it on `pointermove`. Frequency / size tied to velocity for an
organic feel.

- **Wanted For Nothing** — Ribbon trail behind your cursor on menus,
  click-triggered burst effect on the body. Awwwards Site of the Day. —
  `wantedfornothing.com` — *trail* — *I-beam: no*
- **Dave Holloway portfolio** — Lottie + WebGL mouse-flow trail across
  the hero. Honorable Mention. — `daveholloway.com` *(verify, found via
  Awwwards roundup)* — *trail, spotlight* — *I-beam: no*
- **Bruno Simon (folio.brunosimon.fr)** — Not strictly cursor-driven
  (you drive a car around with arrow keys / pointer), but listed
  because it's the same "pointer as character" instinct taken to its
  logical extreme. — `bruno-simon.com` — *replace* — *I-beam: yes*

---

# 5. Honourable mentions / further reading

Not first-party startup sites but worth bookmarking as references for
implementation:

- **Awwwards — "Hovers, Cursors and Cute Interactions" collection** —
  curated gallery of cursor-driven sites. Best single feed for keeping
  the list above fresh. —
  `awwwards.com/awwwards/collections/hovers-cursors-and-cute-interactions/`
- **Awwwards — "Custom Cursor" search** — running list of submissions
  tagged with the cursor pattern. —
  `awwwards.com/inspiration_search/?text=cursor`
- **Cuberto Mouse Follower (GitHub)** — the open-source library most
  custom-cursor sites use under the hood. —
  `github.com/Cuberto/mousefollower`
- **react-creative-cursor** — React-flavored port of the same idea. —
  `github.com/ehsan-shv/react-creative-cursor`
- **perfect-cursors** — the tldraw / Liveblocks cursor interpolation
  library. — `github.com/steveruizok/perfect-cursors`
- **Prototypr.io — "Collaboration Tools and the Invasion of Live
  Cursors"** — the survey article that put names on the multiplayer-
  cursor / video-cursor evolution from Figma → Pitch. —
  `prototypr.io/post/collaboration-tools-live-cursors`
- **Building Figma Multiplayer Cursors — Mark Skelton** — implementation
  walkthrough of the Figma-style cursor, useful as a starting point. —
  `mskelton.dev/blog/building-figma-multiplayer-cursors`

---

# 6. Patterns and implementation notes

Three patterns recur enough to call out separately. Useful when sketching
a component for this library:

**Spotlight via CSS variable.** Single `pointermove` listener on the
container sets `--x` and `--y` (as percentages or px) on the element.
Background or mask reads those variables in a `radial-gradient`. No
re-renders, no JS animation loop. Stripe and Vercel both ship this.
Bundle-cost: ~10 lines.

**Replaced pointer with magnet-snap.** Hide the OS cursor on the body,
render a `position: fixed` element following `pointermove` (translate3d
for compositor performance). For interactive targets, expose a
`data-cursor-magnet` attribute; on `pointerenter` of any such element,
ease the cursor toward the element's center for the duration of the
hover. The magnet behavior is what separates a Cuberto-tier site from
a generic "circle that follows the mouse" demo. Reference:
`mouse-follower` library above.

**Multiplayer presence with interpolation.** The naive approach (set
each cursor's position from the latest server message) looks jerky at
realistic tick rates. tldraw's `perfect-cursors` and Figma's internal
equivalent both smooth the path between updates with a short
look-ahead spline. Worth knowing about before reaching for a stock
multiplayer SDK.

**I-beam decision.** Sites that replace the pointer almost always also
need to suppress the I-beam over text — otherwise the OS cursor flickers
back into view inside paragraphs and breaks the illusion. Either set
`cursor: none` globally (and let the custom cursor render over text) or
explicitly handle `cursor: text` zones in the custom-cursor state
machine. Cuberto chose the former; Active Theory the latter.
