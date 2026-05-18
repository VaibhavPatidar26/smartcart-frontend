import { NavLink, Outlet } from "react-router-dom";
import { BarChart3, Brain, ClipboardList, Home, LineChart, Save, Target } from "lucide-react";

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
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">SC</div>
          <div>
            <strong>SmartCart</strong>
            <span>Customer Intelligence</span>
          </div>
        </div>

        <nav className="nav-list" aria-label="Primary navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} end={item.to === "/"} className="nav-link">
                <Icon size={18} aria-hidden="true" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <main className="main-panel">
        <Outlet />
      </main>
    </div>
  );
}
