/** Login URL that brings the visitor back to `path` after signing in. */
export function loginHref(path: string): string {
  return `/login?callbackUrl=${encodeURIComponent(path)}`;
}

/**
 * Where to go after signing in. Only same-site paths are allowed, so a crafted
 * `?callbackUrl=https://evil.example` (or `//evil.example`) can't redirect off the site.
 */
export function safeCallbackPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return "/";
  }
  if (value === "/login" || value.startsWith("/login?") || value.startsWith("/api/")) return "/";
  return value;
}
