// --- DEBUG: Print GitHub Env Vars ---
console.log("--- GitHub Environment Variables ---");
console.log("GITHUB_APP_ID:", process.env.GITHUB_APP_ID);
console.log("GITHUB_INSTALLATION_ID:", process.env.GITHUB_INSTALLATION_ID);
console.log("GITHUB_TARGET_OWNER:", process.env.GITHUB_TARGET_OWNER);
console.log("GITHUB_TARGET_REPO:", process.env.GITHUB_TARGET_REPO);
console.log("------------------------------------");
// --- END DEBUG ---

import cors from "cors";
import express from "express";
import { CORS_ORIGIN, PORT } from "./config.js";
import chatRoutes from "./routes/chat.js";
import { normalizeMountPath } from "./utils/mountPath.js";
import { logger } from "./utils/logger.js";

/**
 * IDEA_FRONTEND_API_BASE_URL にフルURLが入っている場合でも
 * pathname だけを取り出して安全にマウントできるようにする。
 * 例）https://example.com/api → /api
 */
const fallbackApiMount = (() => {
  const baseUrl = process.env.IDEA_FRONTEND_API_BASE_URL;
  if (!baseUrl) return undefined;
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

// 1) 明示的な API_MOUNT_PATH（パス想定）が優先
// 2) 無ければ base URL の pathname を使う
// 3) どちらも無ければ /api をデフォルトにする
const API_MOUNT = normalizeMountPath(
  process.env.API_MOUNT_PATH ?? fallbackApiMount ?? "/api"
);

logger.info(`Using API mount path: ${API_MOUNT}`);

// Create Express app
const app = express();

// 非本番のルート登録デバッグ
if (process.env.NODE_ENV !== "production") {
  const routeDebugMethods = [
    "use",
    "get",
    "post",
    "put",
    "patch",
    "delete",
    "all",
  ] as const;

  const debugApp = app as express.Application &
    Record<string, (...args: unknown[]) => unknown>;

  for (const methodName of routeDebugMethods) {
    const originalMethod = debugApp[methodName].bind(app) as (
      ...methodArgs: unknown[]
    ) => unknown;

    debugApp[methodName] = (...methodArgs: unknown[]) => {
      const [firstArg] = methodArgs;
      console.log("[ROUTE-DEBUG]", methodName.toUpperCase(), firstArg);
      return originalMethod(...methodArgs);
    };
  }
}

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ---------- Routes (Router を API_MOUNT にぶら下げる) ----------
const apiRouter = express.Router();

apiRouter.use("/chat", chatRoutes);

apiRouter.get("/health", (_req: express.Request, res: express.Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use(API_MOUNT, apiRouter);
// ---------------------------------------------------------------

// Error handling middleware
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
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
  logger.info(`API routes mounted at: ${API_MOUNT}`);
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
