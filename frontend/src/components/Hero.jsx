/**
 * components/Hero.jsx
 * -------------------
 * Landing hero — brand-first ATS composition for ScreenSmart.
 */

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HiArrowRight, HiOutlineDocumentText, HiOutlineCpuChip } from "react-icons/hi2";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-atmosphere text-white">
      <div className="absolute inset-0 bg-grid-fade opacity-40 pointer-events-none" />
      <div className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-center px-4 py-20 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="max-w-2xl"
        >
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-brand-100">
            <HiOutlineCpuChip className="h-3.5 w-3.5" />
            Recruiter ATS Copilot
          </p>

          {/* Brand is the hero-level signal */}
          <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
            ScreenSmart
          </h1>

          <p className="mt-4 font-display text-xl text-brand-100 sm:text-2xl">
            AI Resume Screening &amp; Interview Scheduling Copilot
          </p>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
            Paste a job description, drop multiple resumes, and get explainable
            Strong Fit decisions in seconds — then auto-route top candidates to
            interview scheduling.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-brand-900 shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-brand-50"
            >
              Start Screening
              <HiArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-5 py-3.5 text-sm font-medium text-white/90 transition hover:bg-white/10"
            >
              <HiOutlineDocumentText className="h-4 w-4" />
              How it works
            </Link>
          </div>
        </motion.div>

        {/* Atmospheric visual plane — edge-to-edge feel via section bg */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.7 }}
          className="pointer-events-none absolute -right-8 bottom-10 hidden w-[42%] max-w-md lg:block"
          aria-hidden
        >
          <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm shadow-2xl">
            <div className="mb-3 flex items-center justify-between text-xs text-white/60">
              <span>Live screening preview</span>
              <span className="text-emerald-300">Strong Fit</span>
            </div>
            <div className="space-y-2">
              {["Rahul Sharma", "Priya Nair", "Alex Chen"].map((name, i) => (
                <div
                  key={name}
                  className="flex items-center justify-between rounded-lg bg-white/10 px-3 py-2.5 text-sm"
                >
                  <span>{name}</span>
                  <span
                    className={
                      i === 0
                        ? "text-emerald-300"
                        : i === 1
                          ? "text-amber-300"
                          : "text-rose-300"
                    }
                  >
                    {i === 0 ? "Strong" : i === 1 ? "Possible" : "Not Fit"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
