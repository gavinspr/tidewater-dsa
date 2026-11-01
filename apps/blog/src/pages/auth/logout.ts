import type { APIRoute } from "astro"
import { clearSessionCookie } from "@/lib/submissions/session"

/** Clear the session and return home. Supports POST (form) and GET (link). */
const handler: APIRoute = (context) => {
  clearSessionCookie(context.cookies)
  return context.redirect("/")
}

export const POST = handler
export const GET = handler
