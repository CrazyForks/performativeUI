import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  AsciiHero,
  Aurora,
  GradientText,
  Rotator,
  StickyBanner,
  EyebrowPill,
} from "performative-ui";
import { COMPONENTS, CATEGORIES } from "../lib/meta";

// buttons.github.io is a self-invoked IIFE, it scans the DOM once
// when its <script> tag executes and exposes NO public API (verified
// by reading the minified source). To re-scan on every Home mount
// (back-navigation, etc.), append a fresh <script> tag each time;
// the browser will re-evaluate the cached file, the IIFE re-runs and
// picks up any unprocessed `a.github-button` anchors in the DOM.
function useGithubButtonRender() {
  useEffect(() => {
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://buttons.github.io/buttons.js";
    document.body.appendChild(s);
  }, []);
}

export function Home() {
  useGithubButtonRender();
  return (
    <>
      <StickyBanner>
        Now generally available · v0.0.2
      </StickyBanner>

      <section className="home-hero">
        <Aurora />
        <AsciiHero
          variant="bare"
          colorful
          baseOpacity={0.18}
          spotlightOpacity={0.9}
          spotlightRadius={10}
          fontSize={11}
          style={{ position: "absolute", inset: 0, zIndex: 1 }}
        />
        <div style={{ position: "relative", zIndex: 3 }}>
          <EyebrowPill>{COMPONENTS.length} components · MIT licensed</EyebrowPill>
          <h2 style={{ marginTop: 16 }}>
            <span style={{ display: "block" }}>AI-native React components for</span>
            <span
              style={{
                display: "block",
                minHeight: "1.1em",
                maxWidth: "100%",
                overflowWrap: "break-word",
              }}
            >
              <GradientText>
                <Rotator
                  words={[
                    "AI startups",
                    "frontier labs",
                    "the next ChatGPT",
                    "your moat",
                  ]}
                />
              </GradientText>
            </span>
          </h2>
          <p className="lede">
            Components that signal how oversubscribed your funding
            round is.
          </p>
          <div className="home-install">npm install performative-ui</div>
          <div className="home-cta-row">
            <a
              className="github-button"
              href="https://github.com/vorpus/performativeUI"
              data-icon="octicon-star"
              data-size="large"
              data-show-count="true"
              aria-label="Star vorpus/performativeUI on GitHub"
            >
              Star
            </a>
          </div>
        </div>
      </section>

      {CATEGORIES.map((cat) => (
        <section key={cat}>
          <h2
            style={{
              fontFamily: "var(--pui-font-mono)",
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--pui-fg-mute)",
              padding: "20px 56px 0",
              margin: 0,
            }}
          >
            {cat}
          </h2>
          <div className="home-grid" style={{ paddingTop: 20, paddingBottom: 32 }}>
            {COMPONENTS.filter((c) => c.category === cat).map((c) => (
              <Link key={c.slug} to={`/components/${c.slug}`} className="home-card">
                <span className="home-card__cat">{c.category}</span>
                <span className="home-card__name">{c.name}</span>
                <span className="home-card__snark">{c.snark}</span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
