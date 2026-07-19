/**
 * components/CandidateModal.jsx
 * -----------------------------
 * Full candidate detail drawer/modal + automation status.
 *
 * Note: Backend currently returns screening fields (name, email, fit, skills,
 * reason, confidence). Extra resume fields show when present, else "Not provided".
 */

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiXMark } from "react-icons/hi2";
import { getFitStyles } from "../utils/fitHelpers";
import AutomationStatus from "./AutomationStatus";

function Field({ label, value }) {
  const display =
    value === undefined || value === null || value === "" || value === "unknown@not-found.local"
      ? "Not provided"
      : Array.isArray(value)
        ? value.length
          ? null
          : "Not provided"
        : String(value);

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </p>
      {Array.isArray(value) && value.length > 0 ? (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {value.map((item) => (
            <span
              key={item}
              className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-ink"
            >
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-1 text-sm text-ink">{display}</p>
      )}
    </div>
  );
}

export default function CandidateModal({ candidate, onClose }) {
  useEffect(() => {
    if (!candidate) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [candidate, onClose]);

  const styles = candidate ? getFitStyles(candidate.fit) : null;

  return (
    <AnimatePresence>
      {candidate && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="candidate-modal-title"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
          >
            <div className="sticky top-0 flex items-start justify-between gap-3 border-b border-slate-100 bg-white px-5 py-4">
              <div>
                <h2
                  id="candidate-modal-title"
                  className="font-display text-xl font-semibold text-ink"
                >
                  {candidate.candidateName || "Candidate"}
                </h2>
                <span
                  className={`mt-2 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ring-1 ${styles.bg} ${styles.text} ${styles.ring}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
                  {candidate.fit}
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-muted hover:bg-slate-100"
                aria-label="Close"
              >
                <HiXMark className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 px-5 py-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Email" value={candidate.email} />
                <Field label="Phone" value={candidate.phone} />
                <Field label="Experience" value={candidate.experience} />
                <Field label="Confidence" value={candidate.confidence} />
              </div>

              <Field label="Education" value={candidate.education} />
              <Field label="Projects" value={candidate.projects} />
              <Field label="Certifications" value={candidate.certifications} />

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Matched Skills
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {(candidate.matchedSkills || []).map((s) => (
                    <span
                      key={s}
                      className="rounded-md bg-fit-strong-bg px-2 py-0.5 text-xs text-fit-strong"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Missing Skills
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {(candidate.missingSkills || []).length ? (
                    candidate.missingSkills.map((s) => (
                      <span
                        key={s}
                        className="rounded-md bg-fit-not-bg px-2 py-0.5 text-xs text-fit-not"
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-muted">None</span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  AI Justification
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink">
                  {candidate.reason}
                </p>
              </div>

              <AutomationStatus candidate={candidate} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
