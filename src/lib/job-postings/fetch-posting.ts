import "server-only";

import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const MAX_REDIRECTS = 3;
const MAX_BYTES = 1_000_000;
const REQUEST_TIMEOUT_MS = 8_000;

function isPrivateAddress(address: string) {
  const normalized = address.toLowerCase();

  if (
    normalized === "::1" ||
    normalized === "0.0.0.0" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe80:")
  ) {
    return true;
  }

  const parts = normalized.split(".").map(Number);
  if (parts.length !== 4 || parts.some(Number.isNaN)) return false;

  return (
    parts[0] === 10 ||
    parts[0] === 127 ||
    parts[0] === 0 ||
    (parts[0] === 169 && parts[1] === 254) ||
    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
    (parts[0] === 192 && parts[1] === 168)
  );
}

async function validatePublicUrl(value: string) {
  const url = new URL(value);
  if (url.protocol !== "https:") throw new Error("Job posting links must use HTTPS.");
  if (url.username || url.password) throw new Error("Job posting links cannot include credentials.");

  const addresses = isIP(url.hostname)
    ? [{ address: url.hostname }]
    : await lookup(url.hostname, { all: true });

  if (!addresses.length || addresses.some(({ address }) => isPrivateAddress(address))) {
    throw new Error("That job posting address cannot be accessed.");
  }

  return url;
}

function decodeHtml(value: string) {
  const entities: Record<string, string> = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: '"',
  };

  return value
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (match, name: string) => entities[name.toLowerCase()] ?? match);
}

function textFromHtml(value: string) {
  return decodeHtml(
    value
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function jobPostingFromJsonLd(html: string) {
  const scripts = html.matchAll(
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  );

  function findPosting(value: unknown): Record<string, unknown> | null {
    if (!value || typeof value !== "object") return null;
    if (Array.isArray(value)) {
      for (const item of value) {
        const result = findPosting(item);
        if (result) return result;
      }
      return null;
    }

    const record = value as Record<string, unknown>;
    const type = record["@type"];
    if (type === "JobPosting" || (Array.isArray(type) && type.includes("JobPosting"))) return record;

    for (const item of Object.values(record)) {
      const result = findPosting(item);
      if (result) return result;
    }
    return null;
  }

  for (const match of scripts) {
    try {
      const posting = findPosting(JSON.parse(match[1]));
      if (!posting) continue;

      const organization =
        posting.hiringOrganization && typeof posting.hiringOrganization === "object"
          ? posting.hiringOrganization as Record<string, unknown>
          : null;
      const parts = [
        posting.title,
        organization?.name ? `Company: ${organization.name}` : null,
        posting.description,
        posting.qualifications,
        posting.responsibilities,
        posting.skills,
      ];
      const text = textFromHtml(parts.filter((part) => typeof part === "string").join("\n\n"));
      if (text.length >= 200) return text;
    } catch {
      // Invalid JSON-LD is ignored in favor of the visible page text.
    }
  }

  return null;
}

async function fetchWithValidatedRedirects(url: URL, redirects = 0): Promise<Response> {
  const response = await fetch(url, {
    headers: {
      Accept: "text/html,application/xhtml+xml",
      "User-Agent": "CareerOS/1.0 job-posting-importer",
    },
    redirect: "manual",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    cache: "no-store",
  });

  if (response.status >= 300 && response.status < 400) {
    if (redirects >= MAX_REDIRECTS) throw new Error("The job posting redirected too many times.");
    const location = response.headers.get("location");
    if (!location) throw new Error("The job posting returned an invalid redirect.");
    const nextUrl = await validatePublicUrl(new URL(location, url).toString());
    return fetchWithValidatedRedirects(nextUrl, redirects + 1);
  }

  return response;
}

export async function fetchJobPostingText(value: string) {
  const url = await validatePublicUrl(value);
  const response = await fetchWithValidatedRedirects(url);
  if (!response.ok) throw new Error("That site would not provide the job posting.");

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html") && !contentType.includes("text/plain")) {
    throw new Error("That link did not return a readable job posting.");
  }

  const declaredLength = Number(response.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_BYTES) throw new Error("That job posting page is too large to import.");

  const html = (await response.text()).slice(0, MAX_BYTES);
  const text = jobPostingFromJsonLd(html) ?? textFromHtml(html);
  if (text.length < 200) {
    throw new Error("Career OS could not find enough job-description text at that link.");
  }

  return text.slice(0, 30_000);
}
