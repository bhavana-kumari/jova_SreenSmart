/**
 * components/AutomationStatus.jsx
 * -------------------------------
 * Shows n8n / interview automation pipeline status for a candidate.
 */

import {
  HiCheckCircle,
  HiOutlineClock,
  HiOutlineEnvelope,
  HiOutlineCalendarDays,
  HiOutlinePaperAirplane,
  HiOutlineDocumentCheck,
} from "react-icons/hi2";

/**
 * @param {{ candidate: object }} props
 */
export default function AutomationStatus({ candidate }) {
  const isStrong = candidate.fit === "Strong Fit";
  const sentToN8n = Boolean(candidate.webhookNotified);
  const webhookFailed = Boolean(candidate.webhookWarning);

  // Steps shown for Strong Fit automation path
  const steps = [
    {
      label: "Resume Screened",
      done: Boolean(candidate.fit),
      icon: HiOutlineDocumentCheck,
    },
    {
      label: "Sent to n8n",
      done: sentToN8n,
      pending: isStrong && !sentToN8n,
      icon: HiOutlinePaperAirplane,
    },
    {
      label: "Interview Scheduled",
      done: sentToN8n, // n8n owns scheduling; treat notify as pipeline started
      pending: isStrong && sentToN8n,
      icon: HiOutlineCalendarDays,
    },
    {
      label: "Email Sent",
      done: sentToN8n,
      pending: isStrong && sentToN8n,
      icon: HiOutlineEnvelope,
    },
  ];

  if (!isStrong) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
        <div className="flex items-start gap-3">
          <HiOutlineClock className="mt-0.5 h-5 w-5 text-fit-possible" />
          <div>
            <p className="font-display text-sm font-semibold text-ink">
              Waiting for Recruiter Review
            </p>
            <p className="mt-1 text-sm text-muted">
              This candidate is not a Strong Fit, so interview automation was not
              triggered.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="font-display text-sm font-semibold text-ink">
        Automation Status
      </p>
      {webhookFailed && (
        <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs text-fit-not">
          Webhook warning: {candidate.webhookWarning}
        </p>
      )}
      <ul className="space-y-2">
        {steps.map((step) => (
          <li
            key={step.label}
            className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5"
          >
            {step.done ? (
              <HiCheckCircle className="h-5 w-5 text-fit-strong" />
            ) : (
              <step.icon className="h-5 w-5 text-slate-400" />
            )}
            <span
              className={`text-sm ${
                step.done ? "font-medium text-ink" : "text-muted"
              }`}
            >
              {step.label}
            </span>
            {step.done && (
              <span className="ml-auto text-xs font-medium text-fit-strong">
                Done
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
