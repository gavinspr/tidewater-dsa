import { format, parseISO } from "date-fns"

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
