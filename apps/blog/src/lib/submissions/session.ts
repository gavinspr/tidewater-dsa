/**
 * Session + OAuth-state cookies for the submission flow.
 *
 * The session is a compact, HMAC-signed token (JWT-like: `payloadB64.sigB64`) stored in
 * an HttpOnly cookie. Signing uses Web Crypto (available in both Cloudflare Workers and
 * the Node dev server) keyed by SESSION_SECRET. No server-side session store needed.
 *
 * See docs/submission-flow.md §6.
 */
import type { AstroCookies } from "astro"
import type { MemberIdentity } from "./identity"

export const SESSION_COOKIE = "tdsa_session"
export const OAUTH_STATE_COOKIE = "tdsa_oauth_state"
export const RETURN_TO_COOKIE = "tdsa_return_to"

/** Session lifetime. */
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7 // 7 days
/** OAuth state lifetime — just long enough to complete the redirect round-trip. */
export const OAUTH_STATE_TTL_SECONDS = 60 * 10 // 10 minutes

/** The verified member attached to a request (see App.Locals.member). */
export type SessionMember = MemberIdentity

export interface SessionPayload extends SessionMember {
  /** Issued-at / expires-at, epoch seconds. */
  iat: number
  exp: number
}

// --- base64url helpers (runtime-agnostic: btoa/atob exist in Workers and Node) ---

function bytesToBase64Url(bytes: Uint8Array): string {
  let bin = ""
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function base64UrlToBytes(input: string): Uint8Array {
  const b64 =
    input.replace(/-/g, "+").replace(/_/g, "/") +
    "===".slice((input.length + 3) % 4)
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  )
}

/** Constant-time comparison of two byte arrays. */
function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i]
  return diff === 0
}

/** Sign a member into a session token valid for SESSION_TTL_SECONDS. */
export async function signSession(
  member: SessionMember,
  secret: string
): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const payload: SessionPayload = {
    ...member,
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
  }
  const payloadB64 = bytesToBase64Url(
    new TextEncoder().encode(JSON.stringify(payload))
  )
  const key = await importHmacKey(secret)
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payloadB64)
  )
  return `${payloadB64}.${bytesToBase64Url(new Uint8Array(sig))}`
}

/** Verify a session token; returns the payload or null if invalid/expired. */
export async function verifySession(
  token: string,
  secret: string
): Promise<SessionPayload | null> {
  const dot = token.indexOf(".")
  if (dot <= 0) return null
  const payloadB64 = token.slice(0, dot)
  const sigB64 = token.slice(dot + 1)

  const key = await importHmacKey(secret)
  const expected = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payloadB64))
  )
  let provided: Uint8Array
  try {
    provided = base64UrlToBytes(sigB64)
  } catch {
    return null
  }
  if (!timingSafeEqual(expected, provided)) return null

  try {
    const payload = JSON.parse(
      new TextDecoder().decode(base64UrlToBytes(payloadB64))
    ) as SessionPayload
    if (
      typeof payload.exp !== "number" ||
      payload.exp < Math.floor(Date.now() / 1000)
    ) {
      return null
    }
    return payload
  } catch {
    return null
  }
}

// --- cookie helpers ---

const isProd = import.meta.env.PROD

export function setSessionCookie(cookies: AstroCookies, token: string): void {
  cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  })
}

export function clearSessionCookie(cookies: AstroCookies): void {
  cookies.delete(SESSION_COOKIE, { path: "/" })
}

export function setOAuthStateCookie(cookies: AstroCookies, state: string): void {
  cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: OAUTH_STATE_TTL_SECONDS,
  })
}

export function clearOAuthStateCookie(cookies: AstroCookies): void {
  cookies.delete(OAUTH_STATE_COOKIE, { path: "/" })
}

/** Read + verify the session cookie. Returns the member or null. */
export async function readSessionMember(
  cookies: AstroCookies,
  secret: string | undefined
): Promise<SessionMember | null> {
  if (!secret) return null
  const token = cookies.get(SESSION_COOKIE)?.value
  if (!token) return null
  const payload = await verifySession(token, secret)
  if (!payload) return null
  const { id, username, email, roles, provider } = payload
  return { id, username, email, roles, provider }
}

/** Generate a random OAuth state / CSRF token. */
export function generateState(): string {
  return bytesToBase64Url(crypto.getRandomValues(new Uint8Array(16)))
}

/**
 * Sanitize a post-login redirect target to a local path, preventing open redirects.
 * Only same-origin absolute paths (single leading slash) are allowed.
 */
export function sanitizeReturnTo(value: string | null | undefined): string | null {
  if (!value) return null
  if (!value.startsWith("/") || value.startsWith("//")) return null
  return value
}

export function setReturnToCookie(cookies: AstroCookies, path: string): void {
  cookies.set(RETURN_TO_COOKIE, path, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: OAUTH_STATE_TTL_SECONDS,
  })
}

/** Read and clear the returnTo cookie, returning a safe local path or null. */
export function takeReturnTo(cookies: AstroCookies): string | null {
  const value = sanitizeReturnTo(cookies.get(RETURN_TO_COOKIE)?.value)
  cookies.delete(RETURN_TO_COOKIE, { path: "/" })
  return value
}
