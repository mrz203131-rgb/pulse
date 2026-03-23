type JwtHeader = {
  alg?: string;
  kid?: string;
};

type JwtPayload = {
  aud?: string | string[];
  email?: string;
  exp?: number;
  iss?: string;
  sub?: string;
};

type Jwk = JsonWebKey & {
  kid?: string;
  alg?: string;
};

type JwksResponse = {
  keys?: Jwk[];
};

type VerifiedSupabaseUser = {
  email: string;
  provider: "supabase";
  providerUserId: string;
};

declare global {
  var __pulseSupabaseJwksCache:
    | {
        expiresAt: number;
        keys: Jwk[];
      }
    | undefined;
}

const SUPPORTED_ALGORITHMS = new Set(["RS256", "ES256"]);
const JWKS_CACHE_TTL_MS = 1000 * 60 * 10;

function base64UrlToUint8Array(value: string) {
  const padded = value.padEnd(Math.ceil(value.length / 4) * 4, "=").replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(Buffer.from(padded, "base64"));
}

function parseJsonSegment<T>(value: string): T {
  const text = Buffer.from(base64UrlToUint8Array(value)).toString("utf8");
  return JSON.parse(text) as T;
}

function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? null;
}

function getSupabaseJwksUrl() {
  const configuredUrl = process.env.SUPABASE_JWKS_URL;

  if (configuredUrl) {
    return configuredUrl;
  }

  const supabaseUrl = getSupabaseUrl();
  return supabaseUrl ? `${supabaseUrl.replace(/\/$/, "")}/auth/v1/.well-known/jwks.json` : null;
}

async function fetchSupabaseJwks() {
  const cached = globalThis.__pulseSupabaseJwksCache;

  if (cached && cached.expiresAt > Date.now()) {
    return cached.keys;
  }

  const jwksUrl = getSupabaseJwksUrl();

  if (!jwksUrl) {
    throw new Error("Supabase JWKS URL is not configured.");
  }

  const response = await fetch(jwksUrl, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to load Supabase JWKS.");
  }

  const data = (await response.json()) as JwksResponse;
  const keys = data.keys ?? [];

  if (keys.length === 0) {
    throw new Error("Supabase JWKS returned no signing keys.");
  }

  globalThis.__pulseSupabaseJwksCache = {
    expiresAt: Date.now() + JWKS_CACHE_TTL_MS,
    keys,
  };

  return keys;
}

async function verifySignature(token: string, jwk: Jwk, alg: string) {
  const subtleAlgorithm =
    alg === "RS256" ? { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" } : { name: "ECDSA", namedCurve: "P-256", hash: "SHA-256" };

  const key = await crypto.subtle.importKey("jwk", jwk, subtleAlgorithm, false, ["verify"]);
  const [header, payload, signature] = token.split(".");
  const data = new TextEncoder().encode(`${header}.${payload}`);

  return crypto.subtle.verify(
    alg === "RS256" ? { name: "RSASSA-PKCS1-v1_5" } : { name: "ECDSA", hash: "SHA-256" },
    key,
    base64UrlToUint8Array(signature),
    data,
  );
}

export async function verifySupabaseAccessToken(accessToken: string): Promise<VerifiedSupabaseUser> {
  const parts = accessToken.split(".");

  if (parts.length !== 3) {
    throw new Error("Supabase access token is not a valid JWT.");
  }

  const header = parseJsonSegment<JwtHeader>(parts[0]);
  const payload = parseJsonSegment<JwtPayload>(parts[1]);

  if (!header.alg || !SUPPORTED_ALGORITHMS.has(header.alg)) {
    throw new Error("Supabase access token uses an unsupported signing algorithm.");
  }

  if (!header.kid) {
    throw new Error("Supabase access token is missing a key id.");
  }

  if (!payload.sub || !payload.email) {
    throw new Error("Supabase access token is missing required user claims.");
  }

  if (!payload.exp || payload.exp * 1000 <= Date.now()) {
    throw new Error("Supabase access token is expired.");
  }

  const supabaseUrl = getSupabaseUrl();

  if (supabaseUrl) {
    const expectedIssuer = `${supabaseUrl.replace(/\/$/, "")}/auth/v1`;

    if (payload.iss !== expectedIssuer) {
      throw new Error("Supabase access token issuer did not match this project.");
    }
  }

  const keys = await fetchSupabaseJwks();
  const jwk = keys.find((candidate) => candidate.kid === header.kid);

  if (!jwk) {
    throw new Error("Supabase signing key was not found.");
  }

  const verified = await verifySignature(accessToken, jwk, header.alg);

  if (!verified) {
    throw new Error("Supabase access token signature verification failed.");
  }

  return {
    email: payload.email,
    provider: "supabase",
    providerUserId: payload.sub,
  };
}
