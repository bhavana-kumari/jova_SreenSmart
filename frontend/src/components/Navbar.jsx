/**
 * components/Navbar.jsx
 * ---------------------
 * Top navigation with logo + Dashboard / Upload / About links.
 */

import { NavLink, Link } from "react-router-dom";
import { HiOutlineSparkles } from "react-icons/hi2";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/upload", label: "Upload" },
  { to: "/about", label: "About" },
];

export default function Navbar({ variant = "light" }) {
  const isDark = variant === "dark";

  return (
    <header
      className={`sticky top-0 z-40 backdrop-blur-md border-b ${
        isDark
          ? "bg-brand-950/70 border-white/10 text-white"
          : "bg-white/80 border-slate-200/80 text-ink"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-800 text-white shadow-sm group-hover:bg-brand-700 transition-colors">
            <HiOutlineSparkles className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">
            ScreenSmart
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? isDark
                      ? "bg-white/15 text-white"
                      : "bg-brand-100 text-brand-800"
                    : isDark
                      ? "text-white/70 hover:text-white hover:bg-white/10"
                      : "text-muted hover:text-brand-800 hover:bg-slate-100"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
