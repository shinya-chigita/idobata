// --- DEBUG: Print GitHub Env Vars ---
console.log("--- GitHub Environment Variables ---");
console.log("GITHUB_APP_ID:", process.env.GITHUB_APP_ID);
console.log("GITHUB_INSTALLATION_ID:", process.env.GITHUB_INSTALLATION_ID);
console.log("GITHUB_TARGET_OWNER:", process.env.GITHUB_TARGET_OWNER);
console.log("GITHUB_TARGET_REPO:", process.env.GITHUB_TARGET_REPO);
console.log("------------------------------------");
import cors from "cors";
// --- END DEBUG ---
import express from "express";
import { CORS_ORIGIN, PORT } from "./config.js";
import chatRoutes from "./routes/chat.js";
import {
  createMountPathJoiner,
  normalizeMountPath,
} from "./utils/mountPath.js";
import { logger } from "./utils/logger.js";

const fallbackApiMount = (() => {
  const baseUrl = process.env.IDEA_FRONTEND_API_BASE_URL;
  if (!baseUrl) {
    return undefined;
  }

  try {
    return new URL(baseUrl).pathname;
  } catch (error) {
    logger.warn(
      "Failed to parse IDEA_FRONTEND_API_BASE_URL for mount path fallback:",
      error
    );
    return undefined;
  }
})();

const API_MOUNT = normalizeMountPath(
  process.env.API_MOUNT_PATH ?? fallbackApiMount
);

const withApiMount = createMountPathJoiner(API_MOUNT);

logger.info(`Using API mount path: ${API_MOUNT}`);

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Routes
app.use(withApiMount("/chat"), chatRoutes);

// Health check endpoint
app.get(withApiMount("/health"), (
  _req: express.Request,
  res: express.Response
) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    logger.error("Unhandled error:", err);
    res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
);

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`CORS enabled for origin: ${CORS_ORIGIN}`);
});

// Handle graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully");
  process.exit(0);
});
