import {
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { COMPONENTS, CATEGORIES, ORDERED_COMPONENTS } from "./lib/meta";
import { ComponentPage } from "./lib/ComponentPage";
import { Home } from "./pages/Home";

type Theme = "dark" | "light";

function detectInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  try {
    const stored = localStorage.getItem("pui-theme");
    if (stored === "dark" || stored === "light") return stored;
  } catch {
    /* localStorage may be blocked */
  }
  return window.matchMedia?.("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

export function App() {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>(detectInitialTheme);

  // Scroll to top + close mobile menu on route change.
  useEffect(() => {
    window.scrollTo(0, 0);
    setMenuOpen(false);
  }, [pathname]);

  // Apply theme to <html> and persist.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("pui-theme", theme);
    } catch {
      /* localStorage may be blocked */
    }
  }, [theme]);

  useSkimNavigation();

  return (
    <div className={"docs" + (menuOpen ? " docs--menu-open" : "")}>
      <button
        className="docs__menu-btn"
        aria-label={menuOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((v) => !v)}
      >
        {menuOpen ? "✕" : "☰"}
      </button>
      <div
        className="docs__backdrop"
        aria-hidden="true"
        onClick={() => setMenuOpen(false)}
      />
      <Sidebar
        theme={theme}
        onToggleTheme={() =>
          setTheme((t) => (t === "dark" ? "light" : "dark"))
        }
      />
      <main className="docs__main">
        <Routes>
          <Route path="/" element={<Home />} />
          {COMPONENTS.map((c) => (
            <Route
              key={c.slug}
              path={`/components/${c.slug}`}
              element={<ComponentPage meta={c} />}
            />
          ))}
          <Route
            path="*"
            element={
              <div className="notfound">
                Nothing here. Try the sidebar.
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

/**
 * Quick-skim navigation for component pages.
 *
 * Keyboard only:
 *   - `]` → next component (in sidebar / TOC order)
 *   - `[` → previous component (in sidebar / TOC order)
 *
 * Skipped when focus is in a text input/textarea or any modifier key
 * is held.
 */
function useSkimNavigation() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const ctx = useMemo(() => {
    const idx = ORDERED_COMPONENTS.findIndex(
      (c) => `/components/${c.slug}` === pathname,
    );
    return {
      idx,
      prev: idx > 0 ? ORDERED_COMPONENTS[idx - 1] : null,
      next:
        idx >= 0 && idx < ORDERED_COMPONENTS.length - 1
          ? ORDERED_COMPONENTS[idx + 1]
          : null,
    };
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target;
      if (t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "]" && ctx.next) {
        e.preventDefault();
        navigate(`/components/${ctx.next.slug}`);
      } else if (e.key === "[" && ctx.prev) {
        e.preventDefault();
        navigate(`/components/${ctx.prev.slug}`);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [ctx, navigate]);
}

function Sidebar({
  theme,
  onToggleTheme,
}: {
  theme: Theme;
  onToggleTheme: () => void;
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand-row">
        <NavLink to="/" className="sidebar__brand">
          <span className="sidebar__mark">◣</span>
          <span>performative-ui</span>
        </NavLink>
        <button
          type="button"
          className="sidebar__theme-toggle"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? (
            /* sun */
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </svg>
          ) : (
            /* moon */
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      </div>

      {CATEGORIES.map((cat) => (
        <div key={cat} className="sidebar__section">
          <p className="sidebar__title">{cat}</p>
          <nav className="sidebar__nav">
            {COMPONENTS.filter((c) => c.category === cat).map((c) => (
              <NavLink
                key={c.slug}
                to={`/components/${c.slug}`}
                className={({ isActive }) =>
                  "sidebar__link" + (isActive ? " sidebar__link--active" : "")
                }
              >
                {c.name}
              </NavLink>
            ))}
          </nav>
        </div>
      ))}

      <div className="sidebar__section">
        <p className="sidebar__title">Other Frameworks</p>
        <nav className="sidebar__nav">
          <a
            className="sidebar__link"
            href="https://benjamin-brady.github.io/performative-ui-svelte/"
            target="_blank"
            rel="noreferrer"
          >
            Svelte port
          </a>
        </nav>
      </div>
    </aside>
  );
}
