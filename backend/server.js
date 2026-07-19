/**
 * server.js
 * ---------
 * Entry point for the ScreenSmart AI Screening & Scoring Module.
 * Why this exists: Boots Express, mounts routes, and starts listening.
 */

const express = require("express");
const multer = require("multer");
const { env, validateEnv } = require("./config/env");
const screenRoutes = require("./routes/screenRoutes");

// Fail fast if GEMINI_API_KEY (etc.) is missing
validateEnv();

const app = express();

// Parse incoming JSON request bodies (used by /api/screen/json)
app.use(express.json({ limit: "1mb" }));

// Parse urlencoded fields that may appear alongside multipart text fields
app.use(express.urlencoded({ extended: true }));

/**
 * Health check — teammates / load balancers can verify the service is up.
 * GET /health → { status: "ok", module: "ai-screening" }
 */
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    module: "ai-screening",
    service: "ScreenSmart AI Screening & Scoring",
  });
});

// Mount screening API under /api
app.use("/api", screenRoutes);

// 404 for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

/**
 * Global error handler — including Multer upload errors.
 * Why: Unsupported file types / size limits should return 400, not 500.
 */
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error("[upload] Multer error:", err.message);
    return res.status(400).json({
      success: false,
      error: `Upload error: ${err.message}`,
    });
  }

  // fileFilter rejection from middleware/upload.js
  if (err && err.message && /Unsupported file type/i.test(err.message)) {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }

  console.error("[server] Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: err.message || "Internal server error.",
  });
});

// Start HTTP server
app.listen(env.PORT, () => {
  console.log(`ScreenSmart AI Screening module running on port ${env.PORT}`);
  console.log(`POST http://localhost:${env.PORT}/api/screen          (multipart PDF/DOCX)`);
  console.log(`POST http://localhost:${env.PORT}/api/screen/json     (legacy JSON)`);
});

module.exports = app;
