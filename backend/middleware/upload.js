/**
 * middleware/upload.js
 * --------------------
 * Multer middleware for multipart resume uploads.
 * Why this exists: Keeps file-upload rules (types, size, field names)
 * in one place so routes stay clean and easy to change.
 */

const multer = require("multer");
const path = require("path");

/** Allowed resume extensions (lowercase). */
const ALLOWED_EXTENSIONS = new Set([".pdf", ".docx"]);

/** Allowed MIME types browsers / OS may send for PDF and DOCX. */
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword", // some clients mislabel .docx
]);

/**
 * Stores files in memory as Buffers (no disk writes).
 * Why: Extraction utilities need the buffer immediately; no cleanup required.
 */
const storage = multer.memoryStorage();

/**
 * Rejects files that are not PDF or DOCX.
 * Multer calls this for every uploaded file.
 *
 * @param {object} req - Express request
 * @param {object} file - Multer file metadata
 * @param {Function} cb - Multer callback (error, acceptBoolean)
 */
function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname || "").toLowerCase();

  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return cb(
      new Error(
        `Unsupported file type "${ext || "unknown"}". Only PDF and DOCX are allowed.`
      ),
      false
    );
  }

  // MIME can be unreliable; extension is the primary check.
  // Still warn if MIME is clearly wrong for debugging.
  if (file.mimetype && !ALLOWED_MIME_TYPES.has(file.mimetype) && file.mimetype !== "application/octet-stream") {
    console.warn(
      `[upload] Unusual MIME "${file.mimetype}" for ${file.originalname}; allowing based on extension.`
    );
  }

  return cb(null, true);
}

/**
 * Multer instance configured for ScreenSmart resume uploads.
 * Field name: resumes (frontend may send resumes[] — Multer accepts "resumes")
 * Limit: up to 10 resumes, 5 MB each.
 */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB per file
    files: 10,
  },
});

/**
 * Middleware: expect multiple files under field name "resumes".
 * Also accepts "resumes[]" if the client uses that name — we mount both.
 */
const uploadResumes = upload.fields([
  { name: "resumes", maxCount: 10 },
  { name: "resumes[]", maxCount: 10 },
]);

module.exports = {
  uploadResumes,
  ALLOWED_EXTENSIONS,
};
