import type { SerializedEvent } from "@/types"

/**
 * Mock events for local development without Google Calendar credentials.
 *
 * Spread from 1 month back to 3 months forward so the calendar's
 * navigation works naturally in dev.
 *
 * Note on taxonomy fields: `eventType` and `workingGroup` here are slugs (kebab-case),
 * matching what the app expects post-taxonomy.
 * For dev admins to see friendly labels on the rendered page,
 * the Event Types and Working Groups singletons in Studio need entries whose slugs match the ones used here:
 *   - Event types: meeting, training, social, mutual-aid, fundraiser,
 *     canvass, rally, 101-intro
 *   - Working groups: labor, mutual-aid, political-education, healthcare
 * If the taxonomy entries don't exist yet, the filter chips still
 * work (against slug strings) and the dialog falls back to showing the slug as the badge label.
 */

const now = new Date()
const thisMonth = now.getMonth()
const thisYear = now.getFullYear()

/** Build an ISO string from month offset + day of month + time. */
const dateAt = (
  monthOffset: number,
  dayOfMonth: number,
  hour = 0,
  minute = 0
): string => {
  const d = new Date(
    thisYear,
    thisMonth + monthOffset,
    dayOfMonth,
    hour,
    minute
  )
  return d.toISOString()
}

export const getMockEvents = (
  rangeStart: Date,
  rangeEnd: Date
): SerializedEvent[] => {
  return ALL_MOCKS.filter((e) => {
    const start = new Date(e.startISO)
    const end = new Date(e.endISO)
    return start <= rangeEnd && end >= rangeStart
  })
}

const ALL_MOCKS: SerializedEvent[] = [
  // ----- Last month -----
  {
    id: "mock-prev-1",
    title: "Solidarity Picket: Amazon Warehouse",
    description:
      "Join us in solidarity with striking Amazon workers. Bring signs.",
    location: "Amazon Fulfillment Center, Chesapeake",
    startISO: dateAt(-1, 15, 10, 0),
    endISO: dateAt(-1, 15, 12, 0),
    isAllDay: false,
    googleUrl: "https://calendar.google.com/event?mock=1",
    featured: false,
    eventType: "action",
    attendance: "in_person",
    topics: ["labor", "solidarity"],
    workingGroup: "labor",
    rsvpLink: null,
    summary: null,
  },
  {
    id: "mock-prev-2",
    title: "General Body Meeting",
    description: "Monthly GBM. Agenda posted in Slack the day before.",
    location: "Slover Library, Norfolk",
    startISO: dateAt(-1, 22, 18, 30),
    endISO: dateAt(-1, 22, 20, 30),
    isAllDay: false,
    googleUrl: "https://calendar.google.com/event?mock=2",
    featured: false,
    eventType: "meeting",
    attendance: "hybrid",
    topics: [],
    workingGroup: null,
    rsvpLink: null,
    summary: null,
  },

  // ----- This month -----
  {
    id: "mock-1",
    title: "Brake Light Clinic",
    description:
      "Free brake light repairs for the community. Donations accepted but not required.\n\nBring snacks if you can.",
    location: "Parking lot behind First Baptist Church",
    startISO: dateAt(0, 22, 9, 0),
    endISO: dateAt(0, 22, 13, 0),
    isAllDay: false,
    googleUrl: "https://calendar.google.com/event?mock=3",
    featured: true,
    eventType: "action",
    attendance: "in_person",
    topics: ["mutual aid", "community"],
    workingGroup: "mutual-aid",
    rsvpLink:
      "https://actionnetwork.org/events/mutual-aid-planning-meeting-11/",
    summary:
      "Our monthly brake light repair clinic — free fixes, community building, mutual aid in action.",
  },
  {
    id: "mock-2",
    title: "Reading Group: The Jakarta Method",
    description: "Chapters 1-3. Copies available at the Central Library.",
    location: "Central Library, Virginia Beach",
    startISO: dateAt(0, 24, 19, 0),
    endISO: dateAt(0, 24, 21, 0),
    isAllDay: false,
    googleUrl: "https://calendar.google.com/event?mock=4",
    featured: false,
    eventType: "meeting",
    attendance: "in_person",
    topics: ["political education"],
    workingGroup: "political-education",
    rsvpLink: null,
    summary: null,
  },
  {
    id: "mock-3",
    title: "May Day March & Rally",
    description:
      "International Workers' Day. March starts at Town Point Park at 11am, rally follows at Slover.",
    location: "Town Point Park, Norfolk",
    startISO: dateAt(1, 1, 11, 0),
    endISO: dateAt(1, 1, 14, 0),
    isAllDay: false,
    googleUrl: "https://calendar.google.com/event?mock=5",
    featured: true,
    eventType: "action",
    attendance: "in_person",
    topics: ["labor", "solidarity"],
    workingGroup: "labor",
    rsvpLink: "https://actionnetwork.org/events/may-day-rally-2026",
    summary:
      "Annual May Day march and rally. Workers' holiday, workers' power.",
  },

  // ----- Next month -----
  {
    id: "mock-next-1",
    title: "Monthly General Meeting",
    description: "Monthly GBM.",
    location: "Community Center, 123 Main St",
    startISO: dateAt(1, 5, 19, 0),
    endISO: dateAt(1, 5, 21, 0),
    isAllDay: false,
    googleUrl: "https://calendar.google.com/event?mock=6",
    featured: false,
    eventType: "meeting",
    attendance: "hybrid",
    topics: [],
    workingGroup: null,
    rsvpLink: "https://actionnetwork.org/events/general-meeting-month-plus-1",
    summary: null,
  },
  {
    id: "mock-next-2",
    title: "Medicare for All Tabling at Farmers Market",
    description: "Join the M4A campaign for tabling and outreach.",
    location: "Downtown Farmers Market",
    startISO: dateAt(1, 11, 9, 0),
    endISO: dateAt(1, 11, 12, 0),
    isAllDay: false,
    googleUrl: "https://calendar.google.com/event?mock=7",
    featured: false,
    eventType: "action",
    attendance: "in_person",
    topics: ["healthcare"],
    workingGroup: "healthcare",
    rsvpLink: null,
    summary: null,
  },
  {
    id: "mock-next-3",
    title: "DSA 101: What Is Democratic Socialism?",
    description:
      "Intro session for folks new to DSA. Bring questions. Snacks provided.",
    location: null,
    startISO: dateAt(1, 18, 18, 30),
    endISO: dateAt(1, 18, 20, 0),
    isAllDay: false,
    googleUrl: "https://calendar.google.com/event?mock=8",
    featured: true,
    eventType: "intro",
    attendance: "virtual",
    topics: ["political education"],
    workingGroup: "political-education",
    rsvpLink: "https://actionnetwork.org/events/dsa-101-june",
    summary:
      "New to DSA? Start here. Casual, intro-level session — no prior knowledge expected.",
  },

  // ----- Month + 2 -----
  {
    id: "mock-f2-1",
    title: "Pride March Contingent",
    description: "Join the DSA contingent at the Pride march.",
    location: "Corner of Freemason & Boush",
    startISO: dateAt(2, 7, 10, 0),
    endISO: dateAt(2, 7, 13, 0),
    isAllDay: false,
    googleUrl: "https://calendar.google.com/event?mock=9",
    featured: true,
    eventType: "action",
    attendance: "in_person",
    topics: ["lgbtq+", "solidarity"],
    workingGroup: null,
    rsvpLink: null,
    summary:
      "Marching together at Pride. Meet at the corner — look for the DSA banner.",
  },
  {
    id: "mock-f2-2",
    title: "Monthly General Meeting",
    description: "Monthly GBM.",
    location: "Community Center, 123 Main St",
    startISO: dateAt(2, 9, 19, 0),
    endISO: dateAt(2, 9, 21, 0),
    isAllDay: false,
    googleUrl: "https://calendar.google.com/event?mock=10",
    featured: false,
    eventType: "meeting",
    attendance: "hybrid",
    topics: [],
    workingGroup: null,
    rsvpLink: "https://actionnetwork.org/events/general-meeting-month-plus-2",
    summary: null,
  },
  {
    id: "mock-f2-3",
    title: "Book Club Potluck",
    description: "End-of-semester potluck. Bring a dish.",
    location: "A member's home (RSVP for address)",
    startISO: dateAt(2, 23, 17, 0),
    endISO: dateAt(2, 23, 21, 0),
    isAllDay: false,
    googleUrl: "https://calendar.google.com/event?mock=11",
    featured: false,
    eventType: "social",
    attendance: "in_person",
    topics: [],
    workingGroup: null,
    rsvpLink: null,
    summary: null,
  },

  // ----- Month + 3 — no featured events (test empty state) -----
  {
    id: "mock-f3-1",
    title: "Summer Retreat Planning Meeting",
    description: "Planning committee for the summer retreat.",
    location: null,
    startISO: dateAt(3, 4, 19, 0),
    endISO: dateAt(3, 4, 20, 30),
    isAllDay: false,
    googleUrl: "https://calendar.google.com/event?mock=12",
    featured: false,
    eventType: "meeting",
    attendance: "virtual",
    topics: [],
    workingGroup: null,
    rsvpLink: null,
    summary: null,
  },
  {
    id: "mock-f3-2",
    title: "Organizer Training Weekend",
    description: "Two-day intensive organizer training.",
    location: "Union Hall, 200 Workers Ave",
    startISO: dateAt(3, 14, 0, 0),
    endISO: dateAt(3, 15, 23, 59),
    isAllDay: true,
    googleUrl: "https://calendar.google.com/event?mock=13",
    featured: false,
    eventType: "training",
    attendance: "in_person",
    topics: ["organizing"],
    workingGroup: null,
    rsvpLink: null,
    summary: null,
  },
]
