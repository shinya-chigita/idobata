const DEFAULT_MOUNT_PATH = "/api";

const PLACEHOLDER_BASE_URL = "http://placeholder.local";

function normalizeRoutePath(routePath: string | null | undefined): string {
  const trimmed = (routePath ?? "").trim();
  if (trimmed === "") {
    return "/";
  }

  if (trimmed === "/") {
    return "/";
  }

  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

export function normalizeMountPath(rawPath?: string | null): string {
  if (rawPath == null) {
    return DEFAULT_MOUNT_PATH;
  }

  const trimmedInput = rawPath.trim();
  if (trimmedInput === "") {
    return DEFAULT_MOUNT_PATH;
  }

  let candidate = trimmedInput;

  try {
    const parsed =
      trimmedInput.includes("://") || trimmedInput.startsWith("//")
        ? new URL(trimmedInput)
        : new URL(trimmedInput, PLACEHOLDER_BASE_URL);
    candidate = parsed.pathname;
  } catch (error) {
    // Ignore parse errors and fall back to the raw trimmed value.
  }

  // Normalize path separators and collapse duplicate slashes to avoid paths
  // like //foo or /foo//bar.
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

export function joinMountPath(
  mountPath: string,
  routePath: string | null | undefined = "/"
): string {
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

export function createMountPathJoiner(mountPath: string) {
  const normalizedMount = normalizeMountPath(mountPath);

  return (routePath: string = "/") => joinMountPath(normalizedMount, routePath);
}

export function isWithinMountPath(
  mountPath: string,
  requestPath: string | null | undefined
): boolean {
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
