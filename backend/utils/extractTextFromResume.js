/**
 * utils/extractTextFromResume.js
 * ------------------------------
 * Picks the right extractor (PDF or DOCX) based on file extension.
 * Why this exists: Controllers should not care which library runs —
 * they just ask for "plain text from this uploaded resume".
 */

const path = require("path");
const { extractPdfText } = require("./extractPdf");
const { extractDocxText } = require("./extractDocx");

/**
 * Extracts plain text from an uploaded resume file (Multer file object).
 *
 * @param {object} file - Multer file: { buffer, originalname, mimetype }
 * @returns {Promise<string>} Plain resume text
 */
async function extractTextFromResumeFile(file) {
  if (!file || !file.buffer) {
    throw new Error("No resume file buffer provided.");
  }

  const fileName = file.originalname || "resume";
  const ext = path.extname(fileName).toLowerCase();

  if (ext === ".pdf") {
    return extractPdfText(file.buffer, fileName);
  }

  if (ext === ".docx") {
    return extractDocxText(file.buffer, fileName);
  }

  throw new Error(
    `Unsupported file type for ${fileName}. Only PDF and DOCX are allowed.`
  );
}

module.exports = { extractTextFromResumeFile };
