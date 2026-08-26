/**
 * Allow only same-origin application paths.
 *
 * `/login?redirect=` is attacker-controlled.  The live-preview sign-in path
 * assigns that value to `window.location.href` after OAuth, so an absolute
 * `https://…` URL is a post-login open redirect and `javascript:` is XSS
 * in the authenticated iframe (session bearer is in sessionStorage).
 */
export function safeInternalPath(
  value: string | undefined | null,
  fallback: string,
): string {
  if (typeof value !== "string" || value.length === 0) return fallback;
  if (!value.startsWith("/")) return fallback;
  if (value.startsWith("//") || value.startsWith("/\\")) return fallback;
  if (value.includes("\\")) return fallback;
  const lower = value.toLowerCase();
  if (lower.includes("://") || lower.includes("javascript:") || lower.includes("data:")) {
    return fallback;
  }
  try {
    const url = new URL(value, "https://dealdex.invalid");
    if (url.origin !== "https://dealdex.invalid") return fallback;
    if (url.username || url.password) return fallback;
    if (!url.pathname.startsWith("/") || url.pathname.startsWith("//")) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
