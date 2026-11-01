import type { APIRoute } from "astro"
import { readEnv } from "@/lib/runtime-env"
import {
  authUnavailableResponse,
  createProviderFromContext,
} from "@/lib/submissions/discord"
import {
  clearOAuthStateCookie,
  OAUTH_STATE_COOKIE,
  setSessionCookie,
  signSession,
  takeReturnTo,
} from "@/lib/submissions/session"

/** Complete Discord OAuth: verify state, exchange code, gate on guild membership. */
export const GET: APIRoute = async (context) => {
  const { url, cookies, locals } = context

  const provider = createProviderFromContext(locals)
  if (!provider) return authUnavailableResponse()

  const storedState = cookies.get(OAUTH_STATE_COOKIE)?.value
  clearOAuthStateCookie(cookies)

  // User cancelled or Discord returned an error.
  if (url.searchParams.get("error")) {
    return context.redirect("/auth/denied")
  }

  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state")
  if (!code || !state || !storedState || state !== storedState) {
    return new Response(
      "Invalid or expired login attempt. Please try signing in again.",
      { status: 400, headers: { "Content-Type": "text/plain; charset=utf-8" } }
    )
  }

  const identity = await provider.verifyCallback({ code })
  // Not a member of the guild (or token exchange failed).
  if (!identity) return context.redirect("/auth/denied")

  const secret = readEnv(locals, "SESSION_SECRET")
  if (!secret) return authUnavailableResponse()

  const token = await signSession(identity, secret)
  setSessionCookie(cookies, token)

  return context.redirect(takeReturnTo(cookies) ?? "/submit")
}
