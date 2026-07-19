/**
 * utils/extractDocx.js
 * --------------------
 * Extracts plain text from a DOCX buffer using mammoth.
 * Why this exists: Keeps Word-document parsing isolated from PDF and AI logic.
 */

const mammoth = require("mammoth");

/**
 * Reads text content from a DOCX file buffer.
 *
 * @param {Buffer} buffer - Raw DOCX bytes from Multer memory storage
 * @param {string} [fileName] - Optional name for clearer error messages
 * @returns {Promise<string>} Extracted plain text
 */
async function extractDocxText(buffer, fileName = "resume.docx") {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw new Error(`DOCX extraction failed for ${fileName}: empty or invalid buffer.`);
  }

  try {
    const result = await mammoth.extractRawText({ buffer });
    const text = (result.value || "").trim();

    if (!text) {
      throw new Error(
        `DOCX extraction failed for ${fileName}: no readable text found.`
      );
    }

    return text;
  } catch (err) {
    if (err.message && err.message.startsWith("DOCX extraction failed")) {
      throw err;
    }
    throw new Error(`DOCX extraction failed for ${fileName}: ${err.message}`);
  }
}

module.exports = { extractDocxText };
