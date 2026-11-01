/**
 * Identity provider abstraction.
 *
 * v1 is Discord (OAuth + guild-membership gate). This interface exists so a future
 * Element/Matrix provider can be swapped in without touching the submission flow.
 * See docs/submission-flow.md §2, §6.
 */

/** A verified member allowed to submit. */
export interface MemberIdentity {
  /** Stable provider-specific id (e.g. Discord user id). */
  id: string
  /** Display name used for credit + notifications. */
  username: string
  /** Optional contact email, if the provider supplies one. */
  email?: string
  /** Provider-specific roles, for future role-gating. */
  roles?: string[]
  /** Which provider vouched for this identity. */
  provider: "discord"
}

export interface IdentityProvider {
  readonly name: MemberIdentity["provider"]

  /** URL to redirect the user to in order to begin auth. */
  getAuthorizationUrl(state: string): string

  /**
   * Complete the auth callback: exchange the code, verify guild/room membership,
   * and return the member identity. Returns null if the user is not a member.
   */
  verifyCallback(params: {
    code: string
  }): Promise<MemberIdentity | null>
}

// The concrete Discord implementation lives in ./discord.ts
// (createProviderFromContext / createDiscordProvider). A future Element/Matrix
// provider would implement IdentityProvider the same way.
