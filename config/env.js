/**
 * config/env.js
 * -------------
 * Loads and exposes environment variables in one place.
 * Why this exists: Controllers/services should not call process.env
 * directly everywhere — a single config file makes keys easier to
 * find, validate, and change later.
 */

require("dotenv").config();

const env = {
  // Gemini API key used to call Google Generative Language API
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,

  // n8n webhook — only used when candidate is a Strong Fit
  N8N_WEBHOOK: process.env.N8N_WEBHOOK,

  // HTTP port for this Express server
  PORT: process.env.PORT || 5000,

  // Gemini model name (can be swapped without touching service logic)
  GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-flash-lite-latest",
};

/**
 * Ensures critical env vars exist before the server starts handling traffic.
 * Why: Fail fast with a clear message instead of cryptic API errors later.
 */
function validateEnv() {
  const missing = [];

  if (!env.GEMINI_API_KEY) {
    missing.push("GEMINI_API_KEY");
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(", ")}. ` +
        "Copy .env.example to .env and fill in the values."
    );
  }
}

module.exports = { env, validateEnv };
