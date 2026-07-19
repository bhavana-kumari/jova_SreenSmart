/**
 * components/Footer.jsx
 * ---------------------
 * Simple footer for app pages.
 */

import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white mt-auto">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-sm text-muted">
          © {new Date().getFullYear()} ScreenSmart · Hackathon project
        </p>
        <div className="flex gap-4 text-sm">
          <Link to="/about" className="text-brand-700 hover:underline">
            About
          </Link>
          <Link to="/upload" className="text-brand-700 hover:underline">
            Start Screening
          </Link>
        </div>
      </div>
    </footer>
  );
}
