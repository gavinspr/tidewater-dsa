import type { APIRoute } from "astro"
import {
  authUnavailableResponse,
  createProviderFromContext,
} from "@/lib/submissions/discord"
import {
  generateState,
  sanitizeReturnTo,
  setOAuthStateCookie,
  setReturnToCookie,
} from "@/lib/submissions/session"

/** Begin Discord OAuth: set a CSRF state cookie and redirect to Discord. */
export const GET: APIRoute = (context) => {
  const provider = createProviderFromContext(context.locals)
  if (!provider) return authUnavailableResponse()

  const state = generateState()
  setOAuthStateCookie(context.cookies, state)

  const returnTo = sanitizeReturnTo(context.url.searchParams.get("returnTo"))
  if (returnTo) setReturnToCookie(context.cookies, returnTo)

  return context.redirect(provider.getAuthorizationUrl(state))
}
