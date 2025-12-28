/**
 * Clerk JWT verification for HTTP API endpoints
 *
 * Verifies JWT tokens from the Authorization header and extracts the user ID.
 * Uses Clerk's JWKS endpoint to verify token signatures.
 */

// Simple JWT decode (no verification) - just to extract claims
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

// JWKS cache
let jwksCache: { keys: JsonWebKey[]; fetchedAt: number } | null = null;
const JWKS_CACHE_TTL = 60 * 60 * 1000; // 1 hour

async function getJwks(issuer: string): Promise<JsonWebKey[]> {
  const now = Date.now();
  if (jwksCache && now - jwksCache.fetchedAt < JWKS_CACHE_TTL) {
    return jwksCache.keys;
  }

  const jwksUrl = `${issuer}/.well-known/jwks.json`;
  const response = await fetch(jwksUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch JWKS: ${response.status}`);
  }

  const jwks = (await response.json()) as { keys: JsonWebKey[] };
  jwksCache = { keys: jwks.keys, fetchedAt: now };
  return jwks.keys;
}

// Import RSA public key from JWK
async function importPublicKey(jwk: JsonWebKey): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"]
  );
}

// Verify JWT signature
async function verifySignature(
  token: string,
  keys: JsonWebKey[]
): Promise<boolean> {
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [headerB64, payloadB64, signatureB64] = parts;

  // Decode header to get kid
  const headerJson = atob(headerB64.replace(/-/g, "+").replace(/_/g, "/"));
  const header = JSON.parse(headerJson) as { kid?: string; alg?: string };

  // Find matching key (kid is a custom property in JWKS)
  const key = keys.find((k) => (k as JsonWebKey & { kid?: string }).kid === header.kid);
  if (!key) return false;

  try {
    const publicKey = await importPublicKey(key);
    const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
    const signature = Uint8Array.from(
      atob(signatureB64.replace(/-/g, "+").replace(/_/g, "/")),
      (c) => c.charCodeAt(0)
    );

    return await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      publicKey,
      signature,
      data
    );
  } catch {
    return false;
  }
}

export interface AuthResult {
  userId: string;
  sessionId?: string;
}

/**
 * Verify a Clerk JWT token and extract the user ID
 *
 * @param token - The JWT token from Authorization header (without "Bearer " prefix)
 * @param issuer - The Clerk issuer URL (e.g., "https://clerk.your-app.com")
 * @returns The user ID if valid, null otherwise
 */
export async function verifyClerkToken(
  token: string,
  issuer: string
): Promise<AuthResult | null> {
  try {
    // Decode payload first (for quick validation)
    const payload = decodeJwtPayload(token);
    if (!payload) return null;

    // Check issuer
    if (payload.iss !== issuer) return null;

    // Check expiration
    const exp = payload.exp as number;
    if (!exp || Date.now() >= exp * 1000) return null;

    // Check not-before
    const nbf = payload.nbf as number;
    if (nbf && Date.now() < nbf * 1000) return null;

    // Verify signature
    const keys = await getJwks(issuer);
    const isValid = await verifySignature(token, keys);
    if (!isValid) return null;

    // Extract user ID (Clerk uses 'sub' for user ID)
    const userId = payload.sub as string;
    if (!userId) return null;

    return {
      userId,
      sessionId: payload.sid as string | undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Extract Bearer token from Authorization header
 */
export function extractBearerToken(request: Request): string | null {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) return null;

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return null;

  return parts[1];
}
