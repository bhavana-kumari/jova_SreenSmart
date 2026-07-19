/**
 * components/StatsCards.jsx
 * -------------------------
 * Dashboard summary metrics row.
 */

import {
  HiOutlineUsers,
  HiOutlineCheckBadge,
  HiOutlineExclamationTriangle,
  HiOutlineXCircle,
  HiOutlineChartBar,
} from "react-icons/hi2";

export default function StatsCards({ stats }) {
  const cards = [
    {
      label: "Total Candidates",
      value: stats.total,
      icon: HiOutlineUsers,
      accent: "text-brand-700 bg-brand-100",
    },
    {
      label: "Strong Fit",
      value: stats.strong,
      icon: HiOutlineCheckBadge,
      accent: "text-fit-strong bg-fit-strong-bg",
    },
    {
      label: "Possible Fit",
      value: stats.possible,
      icon: HiOutlineExclamationTriangle,
      accent: "text-fit-possible bg-fit-possible-bg",
    },
    {
      label: "Not Fit",
      value: stats.notFit,
      icon: HiOutlineXCircle,
      accent: "text-fit-not bg-fit-not-bg",
    },
    {
      label: "Avg Confidence",
      value: stats.averageConfidence,
      icon: HiOutlineChartBar,
      accent: "text-brand-700 bg-brand-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div
            className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl ${card.accent}`}
          >
            <card.icon className="h-5 w-5" />
          </div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            {card.label}
          </p>
          <p className="mt-1 font-display text-2xl font-semibold text-ink">
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
