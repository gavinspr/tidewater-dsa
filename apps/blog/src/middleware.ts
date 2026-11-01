import { defineMiddleware } from "astro:middleware"
import { readEnv } from "@/lib/runtime-env"
import { readSessionMember } from "@/lib/submissions/session"

/** Path prefixes that require an authenticated member. */
const PROTECTED_PREFIXES = ["/submit"]

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  )
}

export const onRequest = defineMiddleware(async (context, next) => {
  const secret = readEnv(context.locals, "SESSION_SECRET")
  const member = await readSessionMember(context.cookies, secret)
  context.locals.member = member ?? undefined

  if (!member && isProtected(context.url.pathname)) {
    const returnTo = context.url.pathname + context.url.search
    return context.redirect(
      `/auth/discord/login?returnTo=${encodeURIComponent(returnTo)}`
    )
  }

  return next()
})
