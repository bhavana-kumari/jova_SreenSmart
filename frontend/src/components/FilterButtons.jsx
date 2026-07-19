/**
 * components/FilterButtons.jsx
 * ----------------------------
 * Fit filter chips: All / Strong / Possible / Not Fit.
 */

const FILTERS = ["All", "Strong Fit", "Possible Fit", "Not Fit"];

export default function FilterButtons({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((filter) => {
        const active = value === filter;
        return (
          <button
            key={filter}
            type="button"
            onClick={() => onChange(filter)}
            className={`rounded-xl px-3.5 py-2 text-sm font-medium transition ${
              active
                ? "bg-brand-800 text-white shadow-sm"
                : "bg-white text-muted border border-slate-200 hover:border-brand-300 hover:text-brand-800"
            }`}
          >
            {filter}
          </button>
        );
      })}
    </div>
  );
}
