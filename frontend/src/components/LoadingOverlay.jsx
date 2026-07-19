/**
 * components/LoadingOverlay.jsx
 * -----------------------------
 * Full-screen processing animation while the backend screens resumes.
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineSparkles } from "react-icons/hi2";

const STEPS = [
  "Uploading resumes...",
  "Reading resumes...",
  "Extracting candidate information...",
  "Comparing with Job Description...",
  "Generating AI decisions...",
  "Preparing dashboard...",
];

export default function LoadingOverlay({ show }) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (!show) {
      setStepIndex(0);
      return undefined;
    }

    const id = setInterval(() => {
      setStepIndex((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 2200);

    return () => clearInterval(id);
  }, [show]);

  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand-950/80 backdrop-blur-sm px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl"
          >
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
              <HiOutlineSparkles className="h-7 w-7 animate-pulse" />
            </div>

            <h2 className="text-center font-display text-xl font-semibold text-ink">
              Analyzing candidates
            </h2>
            <p className="mt-2 text-center text-sm text-muted">
              ScreenSmart is talking to your backend AI pipeline…
            </p>

            <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100">
              <motion.div
                className="h-full rounded-full bg-brand-600"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.45 }}
              />
            </div>

            <p className="mt-4 text-center text-sm font-medium text-brand-800">
              {STEPS[stepIndex]}
            </p>

            <ul className="mt-5 space-y-1.5">
              {STEPS.map((step, i) => (
                <li
                  key={step}
                  className={`text-xs ${
                    i <= stepIndex ? "text-brand-700 font-medium" : "text-slate-300"
                  }`}
                >
                  {i < stepIndex ? "✓ " : i === stepIndex ? "→ " : "· "}
                  {step.replace("...", "")}
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
