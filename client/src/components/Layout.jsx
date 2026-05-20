import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { BarChart3, Brain, ClipboardList, Home, LineChart, Menu, Save, Target, X } from "lucide-react";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { to: "/k-analysis", label: "K Analysis", icon: LineChart },
  { to: "/clusters", label: "Clusters", icon: Brain },
  { to: "/summary", label: "Summary", icon: ClipboardList },
  { to: "/predict", label: "Predict", icon: Target },
  { to: "/saved", label: "Saved", icon: Save }
];

export function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const MenuIcon = menuOpen ? X : Menu;

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <div className="app-shell">
      <header className="floating-nav-wrap">
        <nav className="floating-nav" aria-label="Primary navigation">
          <NavLink to="/" className="nav-brand" aria-label="SmartCart home" onClick={closeMenu}>
            <span className="brand-mark">SC</span>
            <span>SmartCart</span>
          </NavLink>

          <button
            className="mobile-menu-button"
            type="button"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((current) => !current)}
          >
            <MenuIcon size={19} aria-hidden="true" />
          </button>

          <div className={`nav-list ${menuOpen ? "is-open" : ""}`}>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.to} to={item.to} end={item.to === "/"} className="nav-link" onClick={closeMenu}>
                  <Icon size={16} aria-hidden="true" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>
      </header>

      <main className="main-panel">
        <Outlet />
      </main>
    </div>
  );
}
