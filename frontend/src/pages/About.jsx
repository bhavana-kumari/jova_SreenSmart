/**
 * pages/About.jsx
 * ---------------
 * Explains ScreenSmart product flow for judges / teammates.
 */

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";

const steps = [
  "Paste a job description on the Upload page.",
  "Drop multiple PDF or DOCX resumes.",
  "Frontend sends multipart data to POST /api/screen.",
  "Backend extracts text, structures data, and runs AI screening.",
  "Dashboard shows Strong / Possible / Not Fit with reasons.",
  "Strong Fit candidates can trigger n8n interview automation.",
];

export default function About() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <Navbar />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
          About
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold text-ink">
          ScreenSmart
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted">
          ScreenSmart is an AI Resume Screening &amp; Interview Scheduling
          Copilot built for hackathon recruiting workflows. Recruiters get
          explainable fit decisions — never black-box scores — and can auto-route
          top talent into scheduling.
        </p>

        <h2 className="mt-10 font-display text-xl font-semibold text-ink">
          How it works
        </h2>
        <ol className="mt-4 space-y-3">
          {steps.map((step, i) => (
            <li
              key={step}
              className="flex gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink shadow-sm"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-xs font-bold text-brand-800">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>

        <Link
          to="/upload"
          className="mt-10 inline-flex rounded-xl bg-brand-800 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Start Screening
        </Link>
      </main>

      <Footer />
    </div>
  );
}
