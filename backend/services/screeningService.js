/**
 * services/screeningService.js
 * ----------------------------
 * Reusable AI screening pipeline used by both JSON and multipart flows.
 * Why this exists: Controllers should not re-implement validate → compare →
 * Gemini → n8n. This service reuses the EXISTING screening modules as-is.
 */

const {
  validateResume,
  validateJobDescription,
} = require("../utils/validators");
const { compareSkills } = require("../utils/compareSkills");
const {
  screenWithGemini,
  GeminiServiceError,
} = require("./geminiService");
const { sendToN8n, N8nServiceError } = require("../utils/sendToN8n");

/**
 * Runs the full existing screening pipeline for one candidate.
 *
 * Steps (unchanged business logic):
 * 1. Validate resume + JD shapes
 * 2. Deterministic skill comparison
 * 3. Gemini explainable screening
 * 4. n8n webhook if Strong Fit
 *
 * @param {object} resume - Screening-shaped resume { name, email, skills, experience, certifications }
 * @param {object} jobDescription - Screening-shaped JD
 * @returns {Promise<object>} Screening result + optional webhook metadata
 */
async function runScreeningPipeline(resume, jobDescription) {
  const resumeResult = validateResume(resume);
  if (!resumeResult.valid) {
    const err = new Error(resumeResult.error);
    err.statusCode = 400;
    throw err;
  }

  const jdResult = validateJobDescription(jobDescription);
  if (!jdResult.valid) {
    const err = new Error(jdResult.error);
    err.statusCode = 400;
    throw err;
  }

  const validResume = resumeResult.data;
  const validJd = jdResult.data;

  // Existing deterministic comparison (not rewritten)
  const skillComparison = compareSkills(validResume, validJd);

  // Existing Gemini screening (not rewritten)
  const screeningResult = await screenWithGemini(
    validResume,
    validJd,
    skillComparison
  );

  // Existing n8n integration (not rewritten) — Strong Fit only
  let webhookNotified = false;
  let webhookWarning = null;

  try {
    const webhookResponse = await sendToN8n(screeningResult);
    webhookNotified = webhookResponse !== null;
  } catch (webhookErr) {
    if (webhookErr instanceof N8nServiceError) {
      console.error("[n8n]", webhookErr.message);
      webhookWarning = webhookErr.message;
    } else {
      console.error("[n8n] Unexpected webhook error:", webhookErr.message);
      webhookWarning = `Webhook Failure: ${webhookErr.message}`;
    }
  }

  return {
    fit: screeningResult.fit,
    matchedSkills: screeningResult.matchedSkills,
    missingSkills: screeningResult.missingSkills,
    reason: screeningResult.reason,
    confidence: screeningResult.confidence,
    candidateName: screeningResult.candidateName,
    email: screeningResult.email,
    webhookNotified,
    webhookWarning,
  };
}

module.exports = {
  runScreeningPipeline,
  GeminiServiceError,
};
