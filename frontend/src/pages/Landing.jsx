/**
 * pages/Landing.jsx
 * -----------------
 * Marketing / hero entry page for ScreenSmart.
 */

import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Footer from "../components/Footer";
import { HiOutlineBolt, HiOutlineShieldCheck, HiOutlineCalendar } from "react-icons/hi2";

const features = [
  {
    icon: HiOutlineBolt,
    title: "Batch screening",
    text: "Upload many PDF/DOCX resumes at once and score them against one JD.",
  },
  {
    icon: HiOutlineShieldCheck,
    title: "Explainable AI",
    text: "Every Strong / Possible / Not Fit decision includes a clear reason.",
  },
  {
    icon: HiOutlineCalendar,
    title: "Interview automation",
    text: "Strong Fit candidates can be routed to n8n for scheduling.",
  },
];

export default function Landing() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar variant="dark" />
      <Hero />

      <section className="bg-canvas px-4 py-16 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-800">
                <f.icon className="h-5 w-5" />
              </div>
              <h2 className="font-display text-lg font-semibold text-ink">
                {f.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
