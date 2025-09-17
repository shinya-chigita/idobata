// This file mirrors the logic in mountPath.ts so that JavaScript-only
// consumers (e.g. the idea-discussion backend) can share the same helper.
const DEFAULT_MOUNT_PATH = "/api";
const PLACEHOLDER_BASE_URL = "http://placeholder.local";

function normalizeRoutePath(routePath) {
  const trimmed = String(routePath).trim();
  if (trimmed === "") {
    return "/";
  }

  if (trimmed === "/") {
    return "/";
  }

  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

export function normalizeMountPath(rawPath) {
  if (rawPath == null) {
    return DEFAULT_MOUNT_PATH;
  }

  const trimmed = String(rawPath).trim();
  if (trimmed === "") {
    return DEFAULT_MOUNT_PATH;
  }

  let candidate = trimmed;

  try {
    const parsed = trimmed.includes("://") || trimmed.startsWith("//")
      ? new URL(trimmed)
      : new URL(trimmed, PLACEHOLDER_BASE_URL);
    candidate = parsed.pathname;
  } catch (error) {
    // Ignore parse errors and fall back to the raw trimmed value.
  }

  candidate = candidate.replace(/\\+/g, "/");
  let normalized = candidate.replace(/\/+/g, "/");

  if (!normalized.startsWith("/")) {
    normalized = `/${normalized}`;
  }

  if (normalized.length > 1) {
    normalized = normalized.replace(/\/+$/u, "");
  }

  if (normalized === "" || normalized === "/") {
    return normalized === "" ? DEFAULT_MOUNT_PATH : "/";
  }

  return normalized;
}

export function joinMountPath(mountPath, routePath = "/") {
  const normalizedMount = normalizeMountPath(mountPath);
  const normalizedRoute = normalizeRoutePath(routePath);

  if (normalizedRoute === "/") {
    return normalizedMount;
  }

  if (normalizedMount === "/") {
    return normalizedRoute;
  }

  return `${normalizedMount}${normalizedRoute}`;
}

export function createMountPathJoiner(mountPath) {
  const normalizedMount = normalizeMountPath(mountPath);

  return (routePath = "/") => joinMountPath(normalizedMount, routePath);
}

export function isWithinMountPath(mountPath, requestPath) {
  const normalizedMount = normalizeMountPath(mountPath);

  if (normalizedMount === "/") {
    return true;
  }

  const normalizedRequest = normalizeRoutePath(requestPath);

  return (
    normalizedRequest === normalizedMount ||
    normalizedRequest.startsWith(`${normalizedMount}/`)
  );
}
