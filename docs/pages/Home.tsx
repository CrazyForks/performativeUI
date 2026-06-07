import { Link } from "react-router-dom";
import {
  Aurora,
  FloatingSparkles,
  GradientText,
  Rotator,
  TopPill,
  EyebrowPill,
} from "performative-ui";
import { COMPONENTS, CATEGORIES } from "../lib/meta";

export function Home() {
  return (
    <>
      <TopPill>
        v0 — barely tested, generously typed
      </TopPill>

      <section className="home-hero">
        <Aurora />
        <FloatingSparkles count={14} />
        <div style={{ position: "relative", zIndex: 3 }}>
          <EyebrowPill>{COMPONENTS.length} components, all of them suspicious</EyebrowPill>
          <h1 style={{ marginTop: 16 }}>
            React components for{" "}
            <GradientText>
              <Rotator
                words={[
                  "AI startups",
                  "founders pretending",
                  "people who say 'frontier'",
                  "you, specifically",
                ]}
              />
            </GradientText>
          </h1>
          <p className="lede">
            A component library of the most overused tropes from the AI
            startup landing-page renaissance. Plug them in. Look ambitious.
            Maybe even raise.
          </p>
          <div className="home-install">npm install performative-ui</div>
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
