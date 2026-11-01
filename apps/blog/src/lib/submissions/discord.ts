/**
 * Discord identity provider: OAuth2 login + guild-membership gate.
 *
 * Scopes: `identify guilds.members.read`. After the code exchange we call the
 * guild-member endpoint; a 200 means the user is in our server (and gives us their
 * roles for future role-gating). Not being a member returns null.
 *
 * Currently STUBBED until the Discord app exists (docs/submission-flow.md §10):
 * getDiscordConfig() returns null when env is incomplete, and callers surface a clear
 * "not configured" response rather than crashing.
 */
import type { APIContext } from "astro"
import type { IdentityProvider, MemberIdentity } from "./identity"
import { readEnv } from "../runtime-env"

const DISCORD_API = "https://discord.com/api/v10"
const OAUTH_SCOPES = "identify guilds.members.read"

export interface DiscordConfig {
  clientId: string
  clientSecret: string
  guildId: string
  redirectUri: string
}

/** Read Discord config from runtime env (with .env fallback). Null if incomplete. */
export function getDiscordConfig(
  locals: APIContext["locals"]
): DiscordConfig | null {
  const clientId = readEnv(locals, "DISCORD_CLIENT_ID")
  const clientSecret = readEnv(locals, "DISCORD_CLIENT_SECRET")
  const guildId = readEnv(locals, "DISCORD_GUILD_ID")
  const redirectUri = readEnv(locals, "DISCORD_OAUTH_REDIRECT_URI")
  if (!clientId || !clientSecret || !guildId || !redirectUri) return null
  return { clientId, clientSecret, guildId, redirectUri }
}

interface DiscordGuildMember {
  user?: { id: string; username: string; global_name?: string | null }
  roles?: string[]
}

export function createDiscordProvider(config: DiscordConfig): IdentityProvider {
  return {
    name: "discord",

    getAuthorizationUrl(state: string): string {
      const params = new URLSearchParams({
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        response_type: "code",
        scope: OAUTH_SCOPES,
        state,
        prompt: "consent",
      })
      return `https://discord.com/oauth2/authorize?${params.toString()}`
    },

    async verifyCallback({ code }): Promise<MemberIdentity | null> {
      // 1. Exchange the code for an access token.
      const tokenRes = await fetch(`${DISCORD_API}/oauth2/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: config.clientId,
          client_secret: config.clientSecret,
          grant_type: "authorization_code",
          code,
          redirect_uri: config.redirectUri,
        }),
      })
      if (!tokenRes.ok) return null
      const { access_token: accessToken } = (await tokenRes.json()) as {
        access_token?: string
      }
      if (!accessToken) return null

      // 2. Check guild membership (200 = member, 404 = not in the server).
      const memberRes = await fetch(
        `${DISCORD_API}/users/@me/guilds/${config.guildId}/member`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      if (!memberRes.ok) return null

      const member = (await memberRes.json()) as DiscordGuildMember
      const user = member.user
      if (!user?.id) return null

      return {
        id: user.id,
        username: user.global_name || user.username,
        roles: member.roles ?? [],
        provider: "discord",
      }
    },
  }
}

/** Convenience: build the provider from an Astro context, or null if not configured. */
export function createProviderFromContext(
  locals: APIContext["locals"]
): IdentityProvider | null {
  const config = getDiscordConfig(locals)
  return config ? createDiscordProvider(config) : null
}

/** 503 response used while the Discord app / session secret is not yet configured. */
export function authUnavailableResponse(): Response {
  return new Response(
    "Member sign-in isn't configured yet. Please check back soon.",
    { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } }
  )
}
