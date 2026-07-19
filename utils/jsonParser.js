/**
 * utils/jsonParser.js
 * -------------------
 * Safely extracts a JSON object from Gemini's text response.
 * Why this exists: LLMs often wrap JSON in markdown fences or add
 * extra prose — we must never crash on that; we parse safely.
 */

/**
 * Tries to parse a string as JSON.
 * Returns null if parsing fails (instead of throwing).
 *
 * @param {string} text
 * @returns {object|null}
 */
function tryParseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/**
 * Pulls the first {...} JSON object out of a larger string.
 * Handles cases like: "Here is the result:\n```json\n{...}\n```"
 *
 * @param {string} raw - Full Gemini text output
 * @returns {object|null} Parsed object, or null if nothing valid found
 */
function parseGeminiJson(raw) {
  if (typeof raw !== "string" || raw.trim() === "") {
    return null;
  }

  let text = raw.trim();

  // Strip markdown code fences if present (```json ... ``` or ``` ... ```)
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    text = fenceMatch[1].trim();
  }

  // First attempt: entire cleaned string is valid JSON
  const direct = tryParseJson(text);
  if (direct && typeof direct === "object" && !Array.isArray(direct)) {
    return direct;
  }

  // Second attempt: find the outermost { ... } block
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    const slice = text.slice(start, end + 1);
    const nested = tryParseJson(slice);
    if (nested && typeof nested === "object" && !Array.isArray(nested)) {
      return nested;
    }
  }

  return null;
}

/**
 * Confirms the parsed Gemini result has the fields our API must return.
 * Why: We refuse black-box / incomplete answers — every field is required.
 *
 * @param {object|null} data
 * @returns {{ valid: true, data: object } | { valid: false, error: string }}
 */
function validateScreeningResult(data) {
  if (!data || typeof data !== "object") {
    return { valid: false, error: "Invalid Gemini Response. Could not parse JSON." };
  }

  const allowedFit = ["Strong Fit", "Possible Fit", "Not Fit"];
  if (!allowedFit.includes(data.fit)) {
    return {
      valid: false,
      error: `Invalid Gemini Response. 'fit' must be one of: ${allowedFit.join(", ")}.`,
    };
  }

  if (!Array.isArray(data.matchedSkills)) {
    return { valid: false, error: "Invalid Gemini Response. 'matchedSkills' must be an array." };
  }

  if (!Array.isArray(data.missingSkills)) {
    return { valid: false, error: "Invalid Gemini Response. 'missingSkills' must be an array." };
  }

  if (typeof data.reason !== "string" || data.reason.trim() === "") {
    return {
      valid: false,
      error: "Invalid Gemini Response. 'reason' must be a non-empty justification string.",
    };
  }

  const allowedConfidence = ["High", "Medium", "Low"];
  if (!allowedConfidence.includes(data.confidence)) {
    return {
      valid: false,
      error: `Invalid Gemini Response. 'confidence' must be one of: ${allowedConfidence.join(", ")}.`,
    };
  }

  return { valid: true, data };
}

module.exports = {
  parseGeminiJson,
  validateScreeningResult,
};
