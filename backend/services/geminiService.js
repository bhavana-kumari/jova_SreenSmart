/**
 * services/geminiService.js
 * -------------------------
 * Calls Google Gemini to produce an explainable screening decision.
 * Why this exists: Isolates screening-specific Gemini usage here so the
 * controller stays thin. Reuses the shared geminiClient for HTTP.
 *
 * IMPORTANT: Screening prompt + fit validation logic lives here and must
 * not be duplicated elsewhere.
 */

const { buildScreeningPrompt } = require("../prompts/screeningPrompt");
const { validateScreeningResult } = require("../utils/jsonParser");
const {
  generateJsonFromPrompt,
  GeminiServiceError,
} = require("./geminiClient");

/**
 * Sends resume + JD + local skill comparison to Gemini and returns
 * a validated screening JSON object.
 *
 * @param {object} resume - Validated resume JSON (screening shape)
 * @param {object} jobDescription - Validated JD JSON (screening shape)
 * @param {object} skillComparison - Output of compareSkills()
 * @returns {Promise<object>} Validated screening result
 */
async function screenWithGemini(resume, jobDescription, skillComparison) {
  const prompt = buildScreeningPrompt(resume, jobDescription, skillComparison);

  const parsed = await generateJsonFromPrompt(prompt, { temperature: 0.2 });
  const validation = validateScreeningResult(parsed);

  if (!validation.valid) {
    throw new GeminiServiceError(validation.error, 502);
  }

  // Always trust resume identity fields — never let the model invent them
  return {
    ...validation.data,
    candidateName: resume.name,
    email: resume.email,
  };
}

module.exports = {
  screenWithGemini,
  GeminiServiceError,
};
