/**
 * components/CandidateCard.jsx
 * ----------------------------
 * Compact candidate result card for the dashboard grid.
 */

import { getFitStyles } from "../utils/fitHelpers";
import { HiOutlineEye } from "react-icons/hi2";

export default function CandidateCard({ candidate, onView }) {
  const styles = getFitStyles(candidate.fit);

  if (candidate.error && !candidate.fit) {
    return (
      <article className="flex flex-col rounded-2xl border border-rose-200 bg-white p-5 shadow-sm">
        <p className="font-display font-semibold text-ink">
          {candidate.fileName || "Upload failed"}
        </p>
        <p className="mt-2 text-sm text-fit-not">{candidate.error}</p>
      </article>
    );
  }

  const matched = candidate.matchedSkills?.slice(0, 4) || [];
  const missing = candidate.missingSkills?.slice(0, 3) || [];

  return (
    <article className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold text-ink">
            {candidate.candidateName || "Unknown"}
          </h3>
          <p className="mt-0.5 text-xs text-muted">{candidate.email}</p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ring-1 ${styles.bg} ${styles.text} ${styles.ring}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
          {candidate.fit}
        </span>
      </div>

      <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted">
        Confidence · {candidate.confidence || "—"}
      </p>

      <div className="mt-3 space-y-2">
        <div>
          <p className="text-xs font-semibold text-fit-strong">Matched</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {matched.length ? (
              matched.map((skill) => (
                <span
                  key={skill}
                  className="rounded-md bg-fit-strong-bg px-2 py-0.5 text-xs text-fit-strong"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-xs text-muted">None listed</span>
            )}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-fit-not">Missing</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {missing.length ? (
              missing.map((skill) => (
                <span
                  key={skill}
                  className="rounded-md bg-fit-not-bg px-2 py-0.5 text-xs text-fit-not"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-xs text-muted">None</span>
            )}
          </div>
        </div>
      </div>

      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted">
        {candidate.reason}
      </p>

      <button
        type="button"
        onClick={() => onView(candidate)}
        className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-800 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
      >
        <HiOutlineEye className="h-4 w-4" />
        View Details
      </button>
    </article>
  );
}
