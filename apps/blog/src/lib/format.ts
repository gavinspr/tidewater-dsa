import { differenceInDays, format, parse, parseISO } from "date-fns"

/**
 * "Tue, Apr 22" when the event is in the current year.
 * "Tue, Apr 22, 2027" when it's in a different year (to avoid ambiguity).
 */
export const formatEventDate = (iso: string): string => {
  const d = parseISO(iso)
  const sameYear = d.getFullYear() === new Date().getFullYear()
  return format(d, sameYear ? "EEE, MMM d" : "EEE, MMM d, yyyy")
}

/** "7:00 PM" — 12-hour format, uppercase AM/PM. */
export const formatEventTime = (iso: string): string => {
  return format(parseISO(iso), "h:mm a")
}

/**
 * Combined "Tue, Apr 22 @ 7:00 PM" or "Tue, Apr 22 — all day" depending on whether the event is all-day. */
export const formatEventDateTime = (iso: string, isAllDay: boolean): string => {
  const datePart = formatEventDate(iso)
  if (isAllDay) return `${datePart} — all day`
  return `${datePart} @ ${formatEventTime(iso)}`
}

/**
 * Short form used in tight spaces (event pills, compact row meta):
 * "Tue, Apr 22 · 7:00 PM" or "Tue, Apr 22 · all day"
 */
export const formatEventMeta = (iso: string, isAllDay: boolean): string => {
  const datePart = formatEventDate(iso)
  if (isAllDay) return `${datePart} · all day`
  return `${datePart} · ${formatEventTime(iso)}`
}

/**
 * Parse a US-format date string (M/D/YYYY) from the Google Sheet into an ISO date string (YYYY-MM-DD).
 * Returns null for empty input or unparseable values.
 * Used during sheet parsing.
 */
export const parseUsDateToISO = (raw: string): string | null => {
  const trimmed = raw?.trim()
  if (!trimmed) return null
  const parsed = parse(trimmed, "M/d/yyyy", new Date())
  if (Number.isNaN(parsed.getTime())) return null
  // Reject sentinel dates (form defaults from before 2020).
  if (parsed.getFullYear() < 2020) return null
  return format(parsed, "yyyy-MM-dd")
}

export const formatVerifiedDate = (iso: string): string =>
  format(parseISO(iso), "MMM yyyy")

export const formatVerifiedDateLong = (iso: string): string =>
  format(parseISO(iso), "MMMM d, yyyy")

export const formatRefreshedAt = (iso: string): string =>
  format(parseISO(iso), "MMM d, yyyy, h:mm a")

/**
 * Default freshness window for the verification badge.
 * Verification dates older than this are considered stale and the badge is hidden,
 * since a "verified" claim from over six months ago no longer means much for a
 * directory of mutual-aid contacts whose hours and addresses change.
 */
export const VERIFICATION_FRESHNESS_DAYS = 180

export const isVerificationFresh = (
  iso: string,
  freshnessDays: number = VERIFICATION_FRESHNESS_DAYS
): boolean => {
  const verified = parseISO(iso)
  if (Number.isNaN(verified.getTime())) return false
  return differenceInDays(new Date(), verified) <= freshnessDays
}

export const splitDateForCard = (
  iso: string
): { day: string; monthYear: string; weekday: string } => {
  const d = new Date(iso)
  const day = String(d.getDate()).padStart(2, "0")
  const monthYear = d.toLocaleString("en-US", {
    month: "short",
    year: "numeric",
  })
  const weekday = d.toLocaleString("en-US", { weekday: "short" })

  return { day, monthYear, weekday }
}
