/**
 * routes/screenRoutes.js
 * ----------------------
 * Registers screening-related HTTP routes.
 * Why this exists: Keeps URL paths separate from business logic
 * so server.js stays small and routes are easy to find.
 */

const express = require("express");
const { screenCandidate } = require("../controllers/screenController");

const router = express.Router();

/**
 * POST /api/screen
 * Body: { resume, jobDescription }
 * Returns explainable AI screening JSON.
 */
router.post("/screen", screenCandidate);

module.exports = router;
