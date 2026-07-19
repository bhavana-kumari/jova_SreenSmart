/**
 * services/geminiService.js
 * -------------------------
 * Calls Google Gemini to produce an explainable screening decision.
 * Why this exists: Isolates all Gemini HTTP details here so the
 * controller stays thin and focused on request/response flow.
 */

const axios = require("axios");
const { env } = require("../config/env");
const { buildScreeningPrompt } = require("../prompts/screeningPrompt");
const {
  parseGeminiJson,
  validateScreeningResult,
} = require("../utils/jsonParser");

/**
 * Custom error class so the controller can map Gemini failures
 * to the correct HTTP status code.
 */
class GeminiServiceError extends Error {
  /**
   * @param {string} message - Human-readable error
   * @param {number} statusCode - Suggested HTTP status for the API response
   */
  constructor(message, statusCode = 502) {
    super(message);
    this.name = "GeminiServiceError";
    this.statusCode = statusCode;
  }
}

/**
 * Sends resume + JD + local skill comparison to Gemini and returns
 * a validated screening JSON object.
 *
 * Flow:
 * 1. Build the screening prompt
 * 2. POST to Gemini generateContent endpoint via Axios
 * 3. Extract model text
 * 4. Parse JSON safely
 * 5. Validate required fields
 *
 * @param {object} resume - Validated resume JSON
 * @param {object} jobDescription - Validated JD JSON
 * @param {object} skillComparison - Output of compareSkills()
 * @returns {Promise<object>} Validated screening result
 */
async function screenWithGemini(resume, jobDescription, skillComparison) {
  if (!env.GEMINI_API_KEY) {
    throw new GeminiServiceError(
      "Gemini API Failure. GEMINI_API_KEY is not configured.",
      500
    );
  }

  const prompt = buildScreeningPrompt(resume, jobDescription, skillComparison);

  // Gemini REST endpoint (Generative Language API)
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_MODEL}:generateContent`;

  let response;
  try {
    response = await axios.post(
      url,
      {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        // Ask Gemini to prefer JSON-shaped answers
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": env.GEMINI_API_KEY,
        },
        timeout: 30000, // 30s — fail clearly on network hangs
      }
    );
  } catch (err) {
    // Network / DNS / timeout errors from Axios
    if (err.code === "ECONNABORTED" || err.code === "ENOTFOUND" || err.code === "ECONNREFUSED") {
      throw new GeminiServiceError(
        `Network Failure while calling Gemini: ${err.message}`,
        503
      );
    }

    // Gemini returned an HTTP error (401, 429, 500, etc.)
    const geminiMessage =
      err.response?.data?.error?.message ||
      err.response?.statusText ||
      err.message;

    throw new GeminiServiceError(
      `Gemini API Failure: ${geminiMessage}`,
      err.response?.status && err.response.status >= 400 ? 502 : 503
    );
  }

  // Pull the text part out of Gemini's nested response structure
  const rawText =
    response.data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;

  if (!rawText) {
    throw new GeminiServiceError(
      "Invalid Gemini Response. No text content returned by the model.",
      502
    );
  }

  const parsed = parseGeminiJson(rawText);
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
