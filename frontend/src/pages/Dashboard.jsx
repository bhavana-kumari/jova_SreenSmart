/**
 * pages/Dashboard.jsx
 * -------------------
 * Results dashboard: stats, search, filters, candidate cards, modal.
 */

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import StatsCards from "../components/StatsCards";
import SearchBar from "../components/SearchBar";
import FilterButtons from "../components/FilterButtons";
import CandidateCard from "../components/CandidateCard";
import CandidateModal from "../components/CandidateModal";
import { useScreening } from "../context/ScreeningContext";
import { computeStats, filterCandidates } from "../utils/fitHelpers";
import { HiOutlineArrowUpTray } from "react-icons/hi2";

export default function Dashboard() {
  const { results } = useScreening();
  const [query, setQuery] = useState("");
  const [fitFilter, setFitFilter] = useState("All");
  const [selected, setSelected] = useState(null);

  const stats = useMemo(() => computeStats(results), [results]);
  const filtered = useMemo(
    () => filterCandidates(results, { query, fitFilter }),
    [results, query, fitFilter]
  );

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
              Results
            </p>
            <h1 className="mt-1 font-display text-3xl font-bold text-ink">
              Screening Dashboard
            </h1>
            <p className="mt-2 text-sm text-muted">
              Review AI fit decisions, skills gaps, and interview automation status.
            </p>
          </div>
          <Link
            to="/upload"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            <HiOutlineArrowUpTray className="h-4 w-4" />
            New Screening
          </Link>
        </div>

        {!results.length ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <p className="font-display text-lg font-semibold text-ink">
              No screening results yet
            </p>
            <p className="mt-2 text-sm text-muted">
              Upload a job description and resumes to populate this dashboard.
            </p>
            <Link
              to="/upload"
              className="mt-6 inline-flex rounded-xl bg-brand-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Go to Upload
            </Link>
          </div>
        ) : (
          <>
            <StatsCards stats={stats} />

            <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="w-full max-w-md">
                <SearchBar value={query} onChange={setQuery} />
              </div>
              <FilterButtons value={fitFilter} onChange={setFitFilter} />
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((candidate, index) => (
                <CandidateCard
                  key={`${candidate.email || candidate.fileName || "c"}-${index}`}
                  candidate={candidate}
                  onView={setSelected}
                />
              ))}
            </div>

            {!filtered.length && (
              <p className="mt-8 text-center text-sm text-muted">
                No candidates match your search or filter.
              </p>
            )}
          </>
        )}
      </main>

      <CandidateModal candidate={selected} onClose={() => setSelected(null)} />
      <Footer />
    </div>
  );
}
