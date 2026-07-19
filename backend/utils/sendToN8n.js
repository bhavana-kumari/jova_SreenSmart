/**
 * utils/sendToN8n.js
 * ------------------
 * Thin re-export of the existing n8n webhook service.
 * Why this exists: Matches the project utility layout without duplicating
 * webhook logic already implemented in services/n8nService.js.
 */

const {
  notifyN8nIfStrongFit,
  N8nServiceError,
} = require("../services/n8nService");

/**
 * Alias with a clearer name for the upload pipeline.
 * Sends to N8N_WEBHOOK only when fit === "Strong Fit".
 */
const sendToN8n = notifyN8nIfStrongFit;

module.exports = {
  sendToN8n,
  notifyN8nIfStrongFit,
  N8nServiceError,
};
