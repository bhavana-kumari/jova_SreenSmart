/**
 * utils/screeningAdapter.js
 * -------------------------
 * Adapts rich extracted resume/JD JSON into the shape expected by the
 * EXISTING AI screening module (validators + screenWithGemini).
 * Why this exists: Lets us add upload/extraction without rewriting screening.
 */

/**
 * Maps a structured (extracted) resume into the screening resume shape:
 * { name, email, skills, experience, certifications }
 *
 * Extra fields (phone, education, projects) stay available for response
 * metadata but are not required by the screening module.
 *
 * @param {object} structuredResume - Output of extractResumeData()
 * @returns {object} Screening-ready resume
 */
function toScreeningResume(structuredResume) {
  const name =
    (structuredResume.name && structuredResume.name.trim()) || "Unknown Candidate";

  // Screening requires an email string; use a clear placeholder if missing
  // (never invent a real address — placeholder signals "not found on resume")
  const email =
    (structuredResume.email && structuredResume.email.trim()) ||
    "unknown@not-found.local";

  return {
    name,
    email,
    skills: Array.isArray(structuredResume.skills) ? structuredResume.skills : [],
    experience:
      typeof structuredResume.experience === "number"
        ? structuredResume.experience
        : 0,
    certifications: Array.isArray(structuredResume.certifications)
      ? structuredResume.certifications
      : [],
  };
}

/**
 * Maps a structured (extracted) JD into the screening JD shape:
 * { requiredSkills, preferredSkills, minimumExperience }
 *
 * requiredCertifications are merged into requiredSkills so the EXISTING
 * mandatory-skill logic can evaluate them without rewriting screening.
 *
 * @param {object} structuredJd - Output of extractJDData()
 * @returns {object} Screening-ready job description
 */
function toScreeningJobDescription(structuredJd) {
  const requiredSkills = [
    ...(Array.isArray(structuredJd.requiredSkills)
      ? structuredJd.requiredSkills
      : []),
    ...(Array.isArray(structuredJd.requiredCertifications)
      ? structuredJd.requiredCertifications
      : []),
  ];

  // Deduplicate while preserving order
  const uniqueRequired = [...new Set(requiredSkills.map((s) => s.trim()).filter(Boolean))];

  return {
    requiredSkills: uniqueRequired,
    preferredSkills: Array.isArray(structuredJd.preferredSkills)
      ? structuredJd.preferredSkills
      : [],
    minimumExperience:
      typeof structuredJd.minimumExperience === "number"
        ? structuredJd.minimumExperience
        : 0,
  };
}

module.exports = {
  toScreeningResume,
  toScreeningJobDescription,
};
