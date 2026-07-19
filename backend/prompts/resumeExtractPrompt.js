/**
 * prompts/resumeExtractPrompt.js
 * ------------------------------
 * Prompt that converts raw resume text into structured JSON.
 * Why this exists: Keeps extraction instructions separate from screening.
 */

/**
 * Builds a Gemini prompt for resume structuring.
 *
 * @param {string} resumeText - Plain text extracted from PDF/DOCX
 * @returns {string}
 */
function buildResumeExtractPrompt(resumeText) {
  return `
You are a resume data extraction assistant for ScreenSmart.

Convert the resume text below into structured JSON.
Return ONLY a single JSON object. No markdown. No commentary.

STRICT RULES
1. Never invent skills, certifications, projects, employers, or degrees.
2. Never assume missing information — use empty string "" or empty array [] when unknown.
3. Do not invent an email or phone number if not present.
4. Preserve important technical details (skill names, cert names, project names).
5. experience should be total years of professional work as a number when possible
   (example: 4). If unclear, use 0 and put a short note in education or leave experience as 0.
6. experienceYears is optional numeric; also set "experience" to that same number.

REQUIRED OUTPUT SHAPE
{
  "name": "",
  "email": "",
  "phone": "",
  "skills": [],
  "experience": 0,
  "education": "",
  "projects": [],
  "certifications": []
}

Field notes:
- skills: array of skill strings found in the resume
- experience: number of years (integer or decimal). Use 0 if unknown.
- education: short summary string (degrees / schools)
- projects: array of short project title/description strings
- certifications: array of certification name strings

====================
RESUME TEXT
====================
${resumeText}
`.trim();
}

module.exports = { buildResumeExtractPrompt };
