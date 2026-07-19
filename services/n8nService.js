/**
 * services/n8nService.js
 * ----------------------
 * Sends Strong Fit candidates to the n8n webhook for interview scheduling.
 * Why this exists: Keeps webhook / Axios details out of the controller
 * and ensures we ONLY notify n8n for Strong Fit (per product rules).
 */

const axios = require("axios");
const { env } = require("../config/env");

/**
 * Custom error for webhook problems so the controller can decide
 * whether to fail the whole request or still return the AI result.
 */
class N8nServiceError extends Error {
  /**
   * @param {string} message
   * @param {number} statusCode
   */
  constructor(message, statusCode = 502) {
    super(message);
    this.name = "N8nServiceError";
    this.statusCode = statusCode;
  }
}

/**
 * Posts screening payload to process.env.N8N_WEBHOOK when fit is Strong Fit.
 *
 * If fit is NOT "Strong Fit", this function does nothing and returns null.
 * If N8N_WEBHOOK is empty, we skip quietly (useful during local testing)
 * and log a warning — screening still succeeds.
 *
 * @param {object} screeningResult - Final AI screening JSON
 * @returns {Promise<object|null>} Webhook response data, or null if skipped
 */
async function notifyN8nIfStrongFit(screeningResult) {
  // Rule: only Strong Fit candidates go to interview scheduling
  if (screeningResult.fit !== "Strong Fit") {
    return null;
  }

  if (!env.N8N_WEBHOOK || env.N8N_WEBHOOK.trim() === "") {
    console.warn(
      "[n8n] N8N_WEBHOOK is not set. Skipping webhook for Strong Fit candidate:",
      screeningResult.candidateName
    );
    return null;
  }

  // Exact payload contract for the n8n workflow (Member 3 / automation)
  const payload = {
    candidateName: screeningResult.candidateName,
    email: screeningResult.email,
    fit: screeningResult.fit,
    reason: screeningResult.reason,
    matchedSkills: screeningResult.matchedSkills,
    confidence: screeningResult.confidence,
  };

  try {
    const response = await axios.post(env.N8N_WEBHOOK, payload, {
      headers: { "Content-Type": "application/json" },
      timeout: 15000,
    });

    return response.data ?? { ok: true };
  } catch (err) {
    if (
      err.code === "ECONNABORTED" ||
      err.code === "ENOTFOUND" ||
      err.code === "ECONNREFUSED"
    ) {
      throw new N8nServiceError(
        `Webhook Failure (network): ${err.message}`,
        503
      );
    }

    const detail =
      err.response?.data?.message ||
      err.response?.statusText ||
      err.message;

    throw new N8nServiceError(`Webhook Failure: ${detail}`, 502);
  }
}

module.exports = {
  notifyN8nIfStrongFit,
  N8nServiceError,
};
