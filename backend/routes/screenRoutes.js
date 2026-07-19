/**
 * routes/screenRoutes.js
 * ----------------------
 * Registers screening-related HTTP routes.
 * Why this exists: Keeps URL paths separate from business logic
 * so server.js stays small and routes are easy to find.
 */

const express = require("express");
const { uploadResumes } = require("../middleware/upload");
const {
  screenFromUploads,
  screenCandidateJson,
} = require("../controllers/screenController");

const router = express.Router();

/**
 * POST /api/screen
 * multipart/form-data
 * Fields: jobDescription (text), resumes (PDF/DOCX files)
 * Returns: { jobDescription, results: [...] }
 */
router.post("/screen", uploadResumes, screenFromUploads);

/**
 * POST /api/screen/json
 * application/json
 * Body: { resume, jobDescription }
 * Returns: single screening result (legacy / direct JSON testing)
 */
router.post("/screen/json", screenCandidateJson);

module.exports = router;
