/**
 * components/UploadBox.jsx
 * ------------------------
 * Job description textarea wrapper used on the Upload page.
 */

export default function UploadBox({ value, onChange, error }) {
  return (
    <div className="space-y-2">
      <label
        htmlFor="jobDescription"
        className="block font-display text-sm font-semibold text-ink"
      >
        Job Description
      </label>
      <textarea
        id="jobDescription"
        rows={10}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste the Job Description here..."
        className={`w-full resize-y rounded-2xl border bg-white px-4 py-3.5 text-sm leading-relaxed text-ink shadow-sm outline-none transition placeholder:text-slate-400 focus:ring-2 ${
          error
            ? "border-rose-300 focus:ring-rose-200"
            : "border-slate-200 focus:border-brand-500 focus:ring-brand-100"
        }`}
      />
      {error && <p className="text-sm text-fit-not">{error}</p>}
    </div>
  );
}
