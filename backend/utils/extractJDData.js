/**
 * utils/extractJDData.js
 * ----------------------
 * Uses Gemini to turn raw job description text into structured JD JSON.
 * Why this exists: Separates JD structuring from AI screening decisions.
 */

const { generateJsonFromPrompt } = require("../services/geminiClient");
const { buildJdExtractPrompt } = require("../prompts/jdExtractPrompt");
const { toStringArray, toExperienceYears } = require("./extractResumeData");

/**
 * Converts raw JD text into structured job description JSON via Gemini.
 *
 * Output shape:
 * {
 *   role, requiredSkills, preferredSkills, minimumExperience, requiredCertifications
 * }
 *
 * @param {string} jdText - Raw job description from the frontend
 * @returns {Promise<object>} Structured JD object
 */
async function extractJDData(jdText) {
  if (typeof jdText !== "string" || jdText.trim() === "") {
    throw new Error("Cannot extract JD data: job description text is empty.");
  }

  const prompt = buildJdExtractPrompt(jdText.trim());
  const raw = await generateJsonFromPrompt(prompt, { temperature: 0.1 });

  return {
    role: typeof raw.role === "string" ? raw.role.trim() : "",
    requiredSkills: toStringArray(raw.requiredSkills),
    preferredSkills: toStringArray(raw.preferredSkills),
    minimumExperience: toExperienceYears(raw.minimumExperience),
    requiredCertifications: toStringArray(raw.requiredCertifications),
  };
}

module.exports = { extractJDData };
