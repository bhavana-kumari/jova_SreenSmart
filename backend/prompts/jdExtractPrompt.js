/**
 * prompts/jdExtractPrompt.js
 * --------------------------
 * Prompt that converts raw job description text into structured JSON.
 * Why this exists: Keeps JD extraction instructions separate from screening.
 */

/**
 * Builds a Gemini prompt for JD structuring.
 *
 * @param {string} jdText - Raw job description string from the frontend
 * @returns {string}
 */
function buildJdExtractPrompt(jdText) {
  return `
You are a job-description extraction assistant for ScreenSmart.

Convert the job description text below into structured JSON.
Return ONLY a single JSON object. No markdown. No commentary.

STRICT RULES
1. Never invent requirements that are not in the text.
2. Never assume missing information — use empty string "" or empty array [] when unknown.
3. requiredSkills = must-have technical skills / tools.
4. preferredSkills = nice-to-have skills (not mandatory).
5. minimumExperience = minimum years required as a NUMBER (example: 3). Use 0 if not stated.
6. requiredCertifications = certifications explicitly required (empty array if none).

REQUIRED OUTPUT SHAPE
{
  "role": "",
  "requiredSkills": [],
  "preferredSkills": [],
  "minimumExperience": 0,
  "requiredCertifications": []
}

====================
JOB DESCRIPTION TEXT
====================
${jdText}
`.trim();
}

module.exports = { buildJdExtractPrompt };
