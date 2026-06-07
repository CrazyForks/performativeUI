import { NavLink, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { COMPONENTS, CATEGORIES } from "./lib/meta";
import { ComponentPage } from "./lib/ComponentPage";
import { Home } from "./pages/Home";

export function App() {
  const { pathname } = useLocation();

  // Scroll to top on route change.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="docs">
      <Sidebar />
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

function Sidebar() {
  return (
    <aside className="sidebar">
      <NavLink to="/" className="sidebar__brand">
        <span className="sidebar__mark">◣</span>
        <span>performative-ui</span>
        <small>v0</small>
      </NavLink>

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
    </aside>
  );
}
