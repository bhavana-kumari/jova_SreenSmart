/**
 * prompts/screeningPrompt.js
 * --------------------------
 * Builds the instruction text sent to Gemini for resume screening.
 * Why this exists: Keeping the prompt in one file makes it easy to
 * tweak scoring rules without touching API or controller code.
 */

/**
 * Creates a structured Gemini prompt from resume, JD, and local skill comparison.
 *
 * Rules baked into the prompt (must stay aligned with product rules):
 * - Never invent certifications or skills
 * - Never assume missing information
 * - Never penalize employment gaps
 * - Always justify the decision (no black-box scores)
 * - Fit logic: Strong Fit / Possible Fit / Not Fit based on mandatory misses
 *
 * @param {object} resume - Validated resume JSON
 * @param {object} jobDescription - Validated JD JSON
 * @param {object} skillComparison - Local deterministic skill match result
 * @returns {string} Full prompt text for Gemini
 */
function buildScreeningPrompt(resume, jobDescription, skillComparison) {
  return `
You are an explainable AI resume screening assistant for ScreenSmart.

Your job: compare the candidate Resume against the Job Description and return ONLY valid JSON.

====================
STRICT RULES
====================
1. Never invent skills, certifications, or experience that are not in the Resume.
2. Never assume missing information — only use what is provided.
3. Never penalize employment gaps (gaps are not in this input and must be ignored).
4. Never return a black-box numeric score. Always explain the decision in "reason".
5. Certifications on the resume MAY satisfy a required skill if they clearly cover it
   (example: "AWS Certified Developer" can satisfy "AWS Certification").
6. Preferred skills that are missing should appear in missingSkills, but preferred
   misses alone do NOT change Strong Fit into Possible Fit or Not Fit.
7. Mandatory requirements = ALL requiredSkills + minimumExperience.
8. Count how many MANDATORY requirements the candidate fails:
   - 0 mandatory misses → fit = "Strong Fit"
   - Exactly 1 mandatory miss → fit = "Possible Fit"
   - 2 or more mandatory misses → fit = "Not Fit"
9. Experience: if resume.experience >= jobDescription.minimumExperience, experience is met.
10. Return ONLY a single JSON object. No markdown. No extra commentary.

====================
RESUME JSON
====================
${JSON.stringify(resume, null, 2)}

====================
JOB DESCRIPTION JSON
====================
${JSON.stringify(jobDescription, null, 2)}

====================
LOCAL SKILL COMPARISON (use as a starting hint; you may refine matches semantically)
====================
${JSON.stringify(skillComparison, null, 2)}

====================
REQUIRED OUTPUT SHAPE (return exactly these keys)
====================
{
  "fit": "Strong Fit" | "Possible Fit" | "Not Fit",
  "matchedSkills": ["..."],
  "missingSkills": ["..."],
  "reason": "Clear justification of why this fit label was chosen.",
  "confidence": "High" | "Medium" | "Low",
  "candidateName": "${resume.name}",
  "email": "${resume.email}"
}

Notes for matchedSkills / missingSkills:
- matchedSkills = required + preferred skills that the candidate clearly has (via skills or certifications).
- missingSkills = required + preferred skills the candidate does not clearly have.
- candidateName and email MUST match the Resume values above exactly.
`.trim();
}

module.exports = { buildScreeningPrompt };
