/**
 * controllers/screenController.js
 * --------------------------------
 * HTTP handlers for screening.
 *
 * - POST /api/screen      → multipart: JD text + multiple resume files
 * - POST /api/screen/json → legacy JSON body (resume + jobDescription objects)
 *
 * Why this exists: Orchestrates upload → extract → structure → EXISTING
 * screening pipeline. Does NOT rewrite AI screening logic.
 */

const { extractTextFromResumeFile } = require("../utils/extractTextFromResume");
const { extractResumeData } = require("../utils/extractResumeData");
const { extractJDData } = require("../utils/extractJDData");
const {
  toScreeningResume,
  toScreeningJobDescription,
} = require("../utils/screeningAdapter");
const {
  runScreeningPipeline,
  GeminiServiceError,
} = require("../services/screeningService");

/**
 * Collects uploaded resume files from Multer (supports "resumes" and "resumes[]").
 *
 * @param {object} req - Express request after multer middleware
 * @returns {object[]} Multer file objects
 */
function getUploadedResumes(req) {
  const fromResumes = req.files?.resumes || [];
  const fromBracket = req.files?.["resumes[]"] || [];
  return [...fromResumes, ...fromBracket];
}

/**
 * Formats one pipeline result for the multipart frontend response.
 *
 * @param {object} result - Output of runScreeningPipeline()
 * @param {object} [extra] - Optional file / error metadata
 * @returns {object}
 */
function toFrontendResult(result, extra = {}) {
  const item = {
    candidateName: result.candidateName,
    email: result.email,
    fit: result.fit,
    reason: result.reason,
    matchedSkills: result.matchedSkills,
    missingSkills: result.missingSkills,
    confidence: result.confidence,
  };

  if (extra.fileName) item.fileName = extra.fileName;
  if (result.webhookWarning) item.webhookWarning = result.webhookWarning;
  else if (result.fit === "Strong Fit") {
    item.webhookNotified = result.webhookNotified;
  }

  return item;
}

/**
 * POST /api/screen
 * Content-Type: multipart/form-data
 *
 * Fields:
 * - jobDescription (text) — raw JD string
 * - resumes / resumes[] (files) — one or more PDF/DOCX resumes
 *
 * Returns: array of screening results (one per resume)
 */
async function screenFromUploads(req, res) {
  try {
    const jobDescriptionRaw = req.body?.jobDescription;
    if (typeof jobDescriptionRaw !== "string" || jobDescriptionRaw.trim() === "") {
      return res.status(400).json({
        success: false,
        error:
          "Missing Job Description. Provide a 'jobDescription' text field in multipart/form-data.",
      });
    }

    const files = getUploadedResumes(req);
    if (!files.length) {
      return res.status(400).json({
        success: false,
        error:
          "Missing resumes. Upload one or more PDF/DOCX files under the field name 'resumes'.",
      });
    }

    // --- Step 4: Structure the Job Description once (shared across all resumes) ---
    const structuredJd = await extractJDData(jobDescriptionRaw);
    const screeningJd = toScreeningJobDescription(structuredJd);

    if (!screeningJd.requiredSkills.length) {
      return res.status(400).json({
        success: false,
        error:
          "Could not find any required skills in the Job Description. Please provide a clearer JD.",
        structuredJobDescription: structuredJd,
      });
    }

    const results = [];

    // Process each resume: extract text → structure → existing AI screening
    for (const file of files) {
      const fileName = file.originalname || "resume";

      try {
        // --- Steps 2 & 3: plain text → structured resume JSON ---
        const resumeText = await extractTextFromResumeFile(file);
        const structuredResume = await extractResumeData(resumeText);
        const screeningResume = toScreeningResume(structuredResume);

        // --- Steps 5–7: EXISTING screening module (compare + Gemini + n8n) ---
        const screeningResult = await runScreeningPipeline(
          screeningResume,
          screeningJd
        );

        results.push(
          toFrontendResult(screeningResult, {
            fileName,
            structuredResume,
          })
        );
      } catch (fileErr) {
        // One bad resume should not fail the entire batch
        console.error(`[screen] Failed for ${fileName}:`, fileErr.message);

        results.push({
          fileName,
          candidateName: null,
          fit: null,
          error: fileErr.message,
          statusCode:
            fileErr instanceof GeminiServiceError
              ? fileErr.statusCode
              : fileErr.statusCode || 500,
        });
      }
    }

    // --- Step 8: Return complete array to frontend ---
    // Shape: [ { candidateName, fit, reason, matchedSkills, missingSkills, confidence, ... } ]
    return res.status(200).json(results);
  } catch (err) {
    if (err instanceof GeminiServiceError) {
      console.error("[gemini]", err.message);
      return res.status(err.statusCode).json({
        success: false,
        error: err.message,
      });
    }

    console.error("[screen] Unexpected error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Internal server error while screening candidates.",
    });
  }
}

/**
 * POST /api/screen/json
 * Legacy / teammate JSON contract (no file upload).
 *
 * Body: { resume, jobDescription }
 * Returns: single screening JSON object (existing behavior)
 */
async function screenCandidateJson(req, res) {
  try {
    const result = await runScreeningPipeline(
      req.body?.resume,
      req.body?.jobDescription
    );

    const responseBody = {
      fit: result.fit,
      matchedSkills: result.matchedSkills,
      missingSkills: result.missingSkills,
      reason: result.reason,
      confidence: result.confidence,
      candidateName: result.candidateName,
      email: result.email,
    };

    if (result.webhookWarning) {
      responseBody.webhookWarning = result.webhookWarning;
    } else if (result.fit === "Strong Fit") {
      responseBody.webhookNotified = result.webhookNotified;
    }

    return res.status(200).json(responseBody);
  } catch (err) {
    if (err.statusCode === 400) {
      return res.status(400).json({ success: false, error: err.message });
    }

    if (err instanceof GeminiServiceError) {
      console.error("[gemini]", err.message);
      return res.status(err.statusCode).json({
        success: false,
        error: err.message,
      });
    }

    console.error("[screen] Unexpected error:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error while screening candidate.",
    });
  }
}

module.exports = {
  screenFromUploads,
  screenCandidateJson,
  // Alias kept for clarity in older docs / imports
  screenCandidate: screenCandidateJson,
};
