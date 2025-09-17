import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

// Server configuration
export const PORT = process.env.PORT || 3001;
export const NODE_ENV = process.env.NODE_ENV || "development";

const DEFAULT_API_MOUNT_PATH = "/api";

const normaliseApiMountPath = (value?: string): string => {
  if (!value) {
    return DEFAULT_API_MOUNT_PATH;
  }

  const trimmed = value.trim();

  if (trimmed === "") {
    return DEFAULT_API_MOUNT_PATH;
  }

  if (trimmed === "/") {
    return "/";
  }

  const withLeadingSlash = trimmed.startsWith("/")
    ? trimmed
    : `/${trimmed}`;

  const collapsedSlashes = withLeadingSlash.replace(/\/{2,}/g, "/");

  const withoutTrailingSlash =
    collapsedSlashes.length > 1
      ? collapsedSlashes.replace(/\/+$/, "")
      : collapsedSlashes;

  const normalised = withoutTrailingSlash || DEFAULT_API_MOUNT_PATH;

  return normalised === "" ? DEFAULT_API_MOUNT_PATH : normalised;
};

export const API_MOUNT_PATH = normaliseApiMountPath(
  process.env.API_MOUNT_PATH
);

// OpenRouter API configuration
export const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// GitHub repository settings
export const GITHUB_REPO_OWNER = process.env.GITHUB_REPO_OWNER;
export const GITHUB_REPO_NAME = process.env.GITHUB_REPO_NAME;

// CORS settings
export const CORS_ORIGIN =
  process.env.POLICY_CORS_ORIGIN || "http://localhost:5174";

// Database configuration
export const DATABASE_URL = process.env.DATABASE_URL;

// Validate required environment variables
if (!OPENROUTER_API_KEY) {
  console.warn(
    "OPENROUTER_API_KEY is not set. The chatbot will not function properly."
  );
}
if (!DATABASE_URL) {
  console.warn(
    "DATABASE_URL is not set. Database operations will not function."
  );
}
