import "server-only";

export type DriveLinkCheckResult = "PUBLIC" | "PRIVATE" | "UNKNOWN";

const TIMEOUT_MS = 8000;
const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

export async function checkGoogleDriveLinkPublic(url: string): Promise<DriveLinkCheckResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": BROWSER_USER_AGENT },
    });

    if (response.url.includes("accounts.google.com")) {
      return "PRIVATE";
    }

    if (response.status === 401 || response.status === 403) {
      return "PRIVATE";
    }

    if (!response.ok) {
      return "UNKNOWN";
    }

    return "PUBLIC";
  } catch {
    return "UNKNOWN";
  } finally {
    clearTimeout(timeout);
  }
}
