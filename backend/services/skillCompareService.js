/**
 * services/skillCompareService.js
 * -------------------------------
 * Deterministic (non-AI) skill matching between Resume and JD.
 * Why this exists: Gives Gemini a transparent starting point and
 * keeps matching logic inspectable — never a black box on its own.
 */

/**
 * Normalizes a skill string for loose comparison.
 * Lowercases, trims, and removes punctuation so "AWS Certification"
 * and "aws certification" can match.
 *
 * @param {string} value
 * @returns {string}
 */
function normalizeSkill(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9+\s#.]/g, " ")
    .replace(/\s+/g, " ");
}

/**
 * Returns true if candidate text covers the JD skill.
 * Supports exact match and simple substring overlap
 * (e.g. "AWS Certified Developer" covers "AWS Certification").
 *
 * @param {string} jdSkill - Skill from the job description
 * @param {string[]} candidatePool - Resume skills + certifications
 * @returns {boolean}
 */
function skillIsCovered(jdSkill, candidatePool) {
  const target = normalizeSkill(jdSkill);
  if (!target) return false;

  return candidatePool.some((item) => {
    const candidate = normalizeSkill(item);
    if (!candidate) return false;

    // Exact match after normalization
    if (candidate === target) return true;

    // Substring either way (certifications often contain the skill name)
    if (candidate.includes(target) || target.includes(candidate)) return true;

    // Token overlap: if most meaningful tokens of the JD skill appear in candidate
    const targetTokens = target.split(" ").filter((t) => t.length > 2);
    if (targetTokens.length === 0) return false;

    const matchedTokens = targetTokens.filter((token) => candidate.includes(token));
    return matchedTokens.length >= Math.ceil(targetTokens.length * 0.6);
  });
}

/**
 * Compares resume skills/certs against required + preferred JD skills.
 * Also records whether minimum experience is met (mandatory).
 *
 * Why: Controllers call this before Gemini so the prompt includes
 * an explainable local comparison snapshot.
 *
 * @param {object} resume - Validated resume
 * @param {object} jobDescription - Validated JD
 * @returns {object} Comparison summary for the prompt + debugging
 */
function compareSkills(resume, jobDescription) {
  // Candidate pool = skills AND certifications (certs can satisfy skill requirements)
  const candidatePool = [...resume.skills, ...resume.certifications];

  const allJdSkills = [
    ...jobDescription.requiredSkills,
    ...jobDescription.preferredSkills,
  ];

  // Deduplicate JD skills while preserving first-seen order
  const uniqueJdSkills = [...new Set(allJdSkills)];

  const matchedSkills = [];
  const missingSkills = [];

  for (const skill of uniqueJdSkills) {
    if (skillIsCovered(skill, candidatePool)) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  }

  // Mandatory skill misses = required skills not covered
  const missingRequiredSkills = jobDescription.requiredSkills.filter(
    (skill) => !skillIsCovered(skill, candidatePool)
  );

  const experienceMet = resume.experience >= jobDescription.minimumExperience;

  // Count mandatory failures: each missing required skill + experience gap
  let mandatoryMissCount = missingRequiredSkills.length;
  if (!experienceMet) {
    mandatoryMissCount += 1;
  }

  // Local fit hint (Gemini should follow the same rules)
  let fitHint = "Strong Fit";
  if (mandatoryMissCount === 1) {
    fitHint = "Possible Fit";
  } else if (mandatoryMissCount >= 2) {
    fitHint = "Not Fit";
  }

  return {
    matchedSkills,
    missingSkills,
    missingRequiredSkills,
    experienceMet,
    candidateExperience: resume.experience,
    minimumExperience: jobDescription.minimumExperience,
    mandatoryMissCount,
    fitHint,
  };
}

module.exports = {
  compareSkills,
  normalizeSkill,
  skillIsCovered,
};
