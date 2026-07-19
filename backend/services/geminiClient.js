/**
 * services/geminiClient.js
 * ------------------------
 * Shared low-level Gemini HTTP helper (Axios).
 * Why this exists: Screening, resume structuring, and JD structuring
 * all need the same "send prompt → get JSON" call — without duplicating
 * Axios / error handling in every service.
 *
 * Does NOT contain screening business logic.
 */

const axios = require("axios");
const { env } = require("../config/env");
const { parseGeminiJson } = require("../utils/jsonParser");

/**
 * Custom error class for Gemini HTTP / network / parse failures.
 */
class GeminiServiceError extends Error {
  /**
   * @param {string} message
   * @param {number} statusCode
   */
  constructor(message, statusCode = 502) {
    super(message);
    this.name = "GeminiServiceError";
    this.statusCode = statusCode;
  }
}

/**
 * Calls Gemini with a text prompt and returns a parsed JSON object.
 *
 * @param {string} prompt - Full instruction text for the model
 * @param {object} [options]
 * @param {number} [options.temperature=0.2]
 * @param {number} [options.timeoutMs=45000]
 * @returns {Promise<object>} Parsed JSON object from the model
 */
async function generateJsonFromPrompt(prompt, options = {}) {
  const temperature = options.temperature ?? 0.2;
  const timeoutMs = options.timeoutMs ?? 45000;

  if (!env.GEMINI_API_KEY) {
    throw new GeminiServiceError(
      "Gemini API Failure. GEMINI_API_KEY is not configured.",
      500
    );
  }

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
        generationConfig: {
          temperature,
          responseMimeType: "application/json",
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": env.GEMINI_API_KEY,
        },
        timeout: timeoutMs,
      }
    );
  } catch (err) {
    if (
      err.code === "ECONNABORTED" ||
      err.code === "ENOTFOUND" ||
      err.code === "ECONNREFUSED"
    ) {
      throw new GeminiServiceError(
        `Network Failure while calling Gemini: ${err.message}`,
        503
      );
    }

    const geminiMessage =
      err.response?.data?.error?.message ||
      err.response?.statusText ||
      err.message;

    throw new GeminiServiceError(
      `Gemini API Failure: ${geminiMessage}`,
      err.response?.status && err.response.status >= 400 ? 502 : 503
    );
  }

  const rawText =
    response.data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;

  if (!rawText) {
    throw new GeminiServiceError(
      "Invalid Gemini Response. No text content returned by the model.",
      502
    );
  }

  const parsed = parseGeminiJson(rawText);
  if (!parsed) {
    throw new GeminiServiceError(
      "Invalid Gemini Response. Could not parse JSON.",
      502
    );
  }

  return parsed;
}

module.exports = {
  generateJsonFromPrompt,
  GeminiServiceError,
};
