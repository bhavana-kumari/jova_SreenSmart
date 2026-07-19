/**
 * server.js
 * ---------
 * Entry point for the ScreenSmart AI Screening & Scoring Module.
 * Why this exists: Boots Express, mounts routes, and starts listening.
 * This module does NOT handle auth, parsing, frontend, DB, or calendar.
 */

const express = require("express");
const { env, validateEnv } = require("./config/env");
const screenRoutes = require("./routes/screenRoutes");

// Fail fast if GEMINI_API_KEY (etc.) is missing
validateEnv();

const app = express();

// Parse incoming JSON request bodies
app.use(express.json({ limit: "1mb" }));

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

// Global error handler (Express 4 catches sync errors thrown in middleware)
app.use((err, req, res, next) => {
  console.error("[server] Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error.",
  });
});

// Start HTTP server
app.listen(env.PORT, () => {
  console.log(`ScreenSmart AI Screening module running on port ${env.PORT}`);
  console.log(`POST http://localhost:${env.PORT}/api/screen`);
});

module.exports = app;
