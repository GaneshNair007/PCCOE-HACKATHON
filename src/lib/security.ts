import dns from "dns/promises";

export interface ResolvedTarget {
  normalizedUrl: string;
  domain: string;
  resolvedIp: string;
}

// In-memory sliding window rate limiter
interface RateLimitBucket {
  tokens: number;
  lastRefill: number;
}

const rateLimitMap = new Map<string, RateLimitBucket>();
const MAX_TOKENS = 30; // Max 30 audits per window
const REFILL_RATE_MS = 60 * 1000; // 1-minute window

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetInMs: number } {
  const now = Date.now();
  let bucket = rateLimitMap.get(ip);

  if (!bucket || now - bucket.lastRefill >= REFILL_RATE_MS) {
    bucket = { tokens: MAX_TOKENS, lastRefill: now };
    rateLimitMap.set(ip, bucket);
  }

  if (bucket.tokens > 0) {
    bucket.tokens -= 1;
    return {
      allowed: true,
      remaining: bucket.tokens,
      resetInMs: Math.max(0, REFILL_RATE_MS - (now - bucket.lastRefill)),
    };
  }

  return {
    allowed: false,
    remaining: 0,
    resetInMs: Math.max(0, REFILL_RATE_MS - (now - bucket.lastRefill)),
  };
}

// Clean up stale rate limit entries every 10 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, bucket] of rateLimitMap.entries()) {
      if (now - bucket.lastRefill > REFILL_RATE_MS * 2) {
        rateLimitMap.delete(ip);
      }
    }
  }, 10 * 60 * 1000);
}

/**
 * Validates whether an IPv4 address is in a private, loopback, link-local,
 * or cloud-metadata range.
 */
export function isPrivateOrReservedIp(ip: string): boolean {
  const cleanIp = ip.trim();

  // IPv6 checks
  if (cleanIp === "::1" || cleanIp.startsWith("fe80:") || cleanIp.startsWith("fc00:") || cleanIp.startsWith("fd00:")) {
    return true;
  }

  // IPv4 checks
  const parts = cleanIp.split(".").map(Number);
  if (parts.length !== 4 || parts.some(isNaN)) {
    return true; // Not a valid IPv4
  }

  const [a, b, c, d] = parts;

  // 0.0.0.0/8 (Broadcast/this host)
  if (a === 0) return true;

  // 127.0.0.0/8 (Loopback)
  if (a === 127) return true;

  // 10.0.0.0/8 (Private Class A)
  if (a === 10) return true;

  // 172.16.0.0/12 (Private Class B: 172.16.x.x - 172.31.x.x)
  if (a === 172 && b >= 16 && b <= 31) return true;

  // 192.168.0.0/16 (Private Class C)
  if (a === 192 && b === 168) return true;

  // 169.254.0.0/16 (Link-Local & Cloud Metadata e.g. 169.254.169.254)
  if (a === 169 && b === 254) return true;

  // 224.0.0.0/4 (Multicast)
  if (a >= 224 && a <= 239) return true;

  // 240.0.0.0/4 (Reserved/Future Use)
  if (a >= 240) return true;

  // 255.255.255.255 (Limited Broadcast)
  if (a === 255 && b === 255 && c === 255 && d === 255) return true;

  return false;
}

/**
 * Validates a target URL against SSRF attacks and resolves its public IP address.
 * Re-checks resolved IP to defeat DNS rebinding vulnerabilities.
 */
export async function validateAndResolveUrl(rawUrl: string): Promise<ResolvedTarget> {
  let normalized = (rawUrl || "").trim();

  if (!normalized) {
    const err: any = new Error("URL cannot be blank. Enter a valid website address.");
    err.code = "INVALID_URL";
    throw err;
  }

  // Reject non-http(s) explicit protocols immediately
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(normalized)) {
    if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
      const err: any = new Error("Only HTTP and HTTPS protocols are permitted.");
      err.code = "INVALID_URL";
      throw err;
    }
  } else {
    // Bare domain or path without protocol
    normalized = "https://" + normalized;
  }

  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    const err: any = new Error("Invalid URL format. Please enter a valid URL (e.g., https://example.com).");
    err.code = "INVALID_URL";
    throw err;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    const err: any = new Error("Only HTTP and HTTPS protocols are permitted.");
    err.code = "INVALID_URL";
    throw err;
  }

  const hostname = parsed.hostname.toLowerCase();

  // Block obvious dangerous hostnames
  if (
    hostname === "localhost" ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal") ||
    hostname.endsWith(".localhost")
  ) {
    const err: any = new Error("Auditing internal or local addresses is prohibited.");
    err.code = "SSRF_BLOCKED";
    throw err;
  }

  // Pre-check if hostname is an IP literal
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
    if (isPrivateOrReservedIp(hostname)) {
      const err: any = new Error("Auditing private, loopback, or metadata addresses is prohibited.");
      err.code = "SSRF_BLOCKED";
      throw err;
    }
  }

  // Resolve hostname to IP to defeat DNS rebinding and verify routing
  let resolvedIp: string;
  try {
    const lookupResult = await dns.lookup(hostname, { family: 4 });
    resolvedIp = lookupResult.address;
  } catch (dnsErr: any) {
    const err: any = new Error(`Unable to resolve domain "${hostname}". Check for typos or active domain registration.`);
    err.code = "DNS_RESOLUTION_FAILED";
    throw err;
  }

  if (isPrivateOrReservedIp(resolvedIp)) {
    const err: any = new Error("Domain resolves to an internal or non-public network address.");
    err.code = "SSRF_BLOCKED";
    throw err;
  }

  return {
    normalizedUrl: parsed.toString(),
    domain: hostname,
    resolvedIp,
  };
}
