/**
 * controllers/screenController.js
 * --------------------------------
 * Handles POST /api/screen — the only public entry for this module.
 * Why this exists: Orchestrates validate → compare → Gemini → n8n
 * and maps every failure to a clear HTTP status + JSON error body.
 */

const { validateResume, validateJobDescription } = require("../utils/validators");
const { compareSkills } = require("../services/skillCompareService");
const {
  screenWithGemini,
  GeminiServiceError,
} = require("../services/geminiService");
const {
  notifyN8nIfStrongFit,
  N8nServiceError,
} = require("../services/n8nService");

/**
 * POST /api/screen
 *
 * Request body:
 * {
 *   "resume": { name, email, skills, experience, certifications },
 *   "jobDescription": { requiredSkills, preferredSkills, minimumExperience }
 * }
 *
 * Response: explainable screening JSON (fit, matchedSkills, missingSkills, ...)
 */
async function screenCandidate(req, res) {
  try {
    // --- 1. Validate Resume JSON ---
    const resumeResult = validateResume(req.body?.resume);
    if (!resumeResult.valid) {
      return res.status(400).json({
        success: false,
        error: resumeResult.error,
      });
    }

    // --- 2. Validate Job Description JSON ---
    const jdResult = validateJobDescription(req.body?.jobDescription);
    if (!jdResult.valid) {
      return res.status(400).json({
        success: false,
        error: jdResult.error,
      });
    }

    const resume = resumeResult.data;
    const jobDescription = jdResult.data;

    // --- 3. Deterministic skill comparison (transparent, not black-box) ---
    const skillComparison = compareSkills(resume, jobDescription);

    // --- 4 & 5 & 6 & 7. Prompt → Gemini → safe JSON parse ---
    const screeningResult = await screenWithGemini(
      resume,
      jobDescription,
      skillComparison
    );

    // --- 8. n8n: only when Strong Fit ---
    // Screening result is still returned even if webhook fails —
    // the AI decision should not be lost because scheduling automation failed.
    let webhookNotified = false;
    let webhookWarning = null;

    try {
      const webhookResponse = await notifyN8nIfStrongFit(screeningResult);
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

    // --- 9. Return the explainable screening JSON ---
    const responseBody = {
      fit: screeningResult.fit,
      matchedSkills: screeningResult.matchedSkills,
      missingSkills: screeningResult.missingSkills,
      reason: screeningResult.reason,
      confidence: screeningResult.confidence,
      candidateName: screeningResult.candidateName,
      email: screeningResult.email,
    };
    //checking response body
    //console.log(responseBody);

    // Optional metadata for frontend/debugging (does not break the contract)
    if (webhookWarning) {
      responseBody.webhookWarning = webhookWarning;
    } else if (screeningResult.fit === "Strong Fit") {
      responseBody.webhookNotified = webhookNotified;
    }

    return res.status(200).json(responseBody);
  } catch (err) {
    // Gemini-specific failures (API / parse / network)
    if (err instanceof GeminiServiceError) {
      console.error("[gemini]", err.message);
      return res.status(err.statusCode).json({
        success: false,
        error: err.message,
      });
    }

    // Unexpected crashes
    console.error("[screen] Unexpected error:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error while screening candidate.",
    });
  }
}

module.exports = { screenCandidate };
