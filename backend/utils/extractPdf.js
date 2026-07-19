/**
 * utils/extractPdf.js
 * -------------------
 * Extracts plain text from a PDF buffer using pdf-parse (v2).
 * Why this exists: Keeps PDF-specific parsing isolated from DOCX and AI logic.
 */

const { PDFParse } = require("pdf-parse");

/**
 * Reads text content from a PDF file buffer.
 *
 * @param {Buffer} buffer - Raw PDF bytes from Multer memory storage
 * @param {string} [fileName] - Optional name for clearer error messages
 * @returns {Promise<string>} Extracted plain text
 */
async function extractPdfText(buffer, fileName = "resume.pdf") {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw new Error(`PDF extraction failed for ${fileName}: empty or invalid buffer.`);
  }

  let parser;
  try {
    // pdf-parse v2 API: construct with { data: Buffer }, then getText()
    parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    const text = (result.text || "").trim();

    if (!text) {
      throw new Error(
        `PDF extraction failed for ${fileName}: no readable text found (scanned image PDFs are not supported).`
      );
    }

    return text;
  } catch (err) {
    if (err.message && err.message.startsWith("PDF extraction failed")) {
      throw err;
    }
    throw new Error(`PDF extraction failed for ${fileName}: ${err.message}`);
  } finally {
    // Free parser resources when the library supports it
    if (parser && typeof parser.destroy === "function") {
      try {
        await parser.destroy();
      } catch {
        // ignore cleanup errors
      }
    }
  }
}

module.exports = { extractPdfText };
