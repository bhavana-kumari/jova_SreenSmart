/**
 * utils/extractResumeData.js
 * --------------------------
 * Uses Gemini to turn raw resume text into structured resume JSON.
 * Why this exists: Separates "structure the resume" from "screen the resume".
 * Screening logic is NOT here — it only produces structured data.
 */

const { generateJsonFromPrompt } = require("../services/geminiClient");
const { buildResumeExtractPrompt } = require("../prompts/resumeExtractPrompt");

/**
 * Ensures a value is a string array (drops non-strings).
 * @param {unknown} value
 * @returns {string[]}
 */
function toStringArray(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * Parses experience into a non-negative number of years.
 * Accepts number, or strings like "4", "4 years", "3.5".
 *
 * @param {unknown} value
 * @returns {number}
 */
function toExperienceYears(value) {
  if (typeof value === "number" && !Number.isNaN(value) && value >= 0) {
    return value;
  }

  if (typeof value === "string") {
    const match = value.match(/(\d+(\.\d+)?)/);
    if (match) {
      return Number(match[1]);
    }
  }

  return 0;
}

/**
 * Converts raw resume text into structured resume JSON via Gemini.
 *
 * Output shape:
 * {
 *   name, email, phone, skills, experience, education, projects, certifications
 * }
 *
 * @param {string} resumeText - Plain text from PDF/DOCX
 * @returns {Promise<object>} Structured resume object
 */
async function extractResumeData(resumeText) {
  if (typeof resumeText !== "string" || resumeText.trim() === "") {
    throw new Error("Cannot extract resume data: resume text is empty.");
  }

  const prompt = buildResumeExtractPrompt(resumeText.trim());
  const raw = await generateJsonFromPrompt(prompt, { temperature: 0.1 });

  // Normalize so downstream screening always gets predictable types
  return {
    name: typeof raw.name === "string" ? raw.name.trim() : "",
    email: typeof raw.email === "string" ? raw.email.trim() : "",
    phone: typeof raw.phone === "string" ? raw.phone.trim() : "",
    skills: toStringArray(raw.skills),
    experience: toExperienceYears(raw.experience),
    education: typeof raw.education === "string" ? raw.education.trim() : "",
    projects: toStringArray(raw.projects),
    certifications: toStringArray(raw.certifications),
  };
}

module.exports = {
  extractResumeData,
  toExperienceYears,
  toStringArray,
};
