/**
 * utils/fitHelpers.js
 * -------------------
 * Shared helpers for fit badges, stats, and confidence display.
 */

/** Badge colors for Strong / Possible / Not Fit */
export function getFitStyles(fit) {
  switch (fit) {
    case "Strong Fit":
      return {
        bg: "bg-fit-strong-bg",
        text: "text-fit-strong",
        ring: "ring-fit-strong/20",
        dot: "bg-fit-strong",
      };
    case "Possible Fit":
      return {
        bg: "bg-fit-possible-bg",
        text: "text-fit-possible",
        ring: "ring-fit-possible/20",
        dot: "bg-fit-possible",
      };
    case "Not Fit":
      return {
        bg: "bg-fit-not-bg",
        text: "text-fit-not",
        ring: "ring-fit-not/20",
        dot: "bg-fit-not",
      };
    default:
      return {
        bg: "bg-slate-100",
        text: "text-slate-600",
        ring: "ring-slate-200",
        dot: "bg-slate-400",
      };
  }
}

/**
 * Builds dashboard summary numbers from screening results.
 * @param {object[]} results
 */
export function computeStats(results = []) {
  const successful = results.filter((r) => r.fit && !r.error);

  const strong = successful.filter((r) => r.fit === "Strong Fit").length;
  const possible = successful.filter((r) => r.fit === "Possible Fit").length;
  const notFit = successful.filter((r) => r.fit === "Not Fit").length;

  const confidenceRank = { High: 3, Medium: 2, Low: 1 };
  const ranks = successful
    .map((r) => confidenceRank[r.confidence] || 0)
    .filter((n) => n > 0);

  let averageConfidence = "—";
  if (ranks.length) {
    const avg = ranks.reduce((a, b) => a + b, 0) / ranks.length;
    if (avg >= 2.5) averageConfidence = "High";
    else if (avg >= 1.5) averageConfidence = "Medium";
    else averageConfidence = "Low";
  }

  return {
    total: successful.length,
    strong,
    possible,
    notFit,
    averageConfidence,
  };
}

/**
 * Filters + searches candidate list for the dashboard.
 */
export function filterCandidates(results = [], { query = "", fitFilter = "All" } = {}) {
  const q = query.trim().toLowerCase();

  return results.filter((r) => {
    if (r.error && !r.fit) {
      // Still show failed uploads when filter is All
      if (fitFilter !== "All") return false;
    } else if (fitFilter !== "All" && r.fit !== fitFilter) {
      return false;
    }

    if (!q) return true;
    const name = (r.candidateName || r.fileName || "").toLowerCase();
    const email = (r.email || "").toLowerCase();
    return name.includes(q) || email.includes(q);
  });
}
