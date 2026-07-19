/**
 * components/SearchBar.jsx
 * ------------------------
 * Search candidates by name (or email).
 */

import { HiOutlineMagnifyingGlass } from "react-icons/hi2";

export default function SearchBar({ value, onChange, placeholder = "Search by candidate name..." }) {
  return (
    <div className="relative">
      <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />
    </div>
  );
}
