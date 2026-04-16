import type { SETTINGS_QUERY_RESULT } from "@/sanity/types"
import type { HOME_PAGE_QUERY_RESULT } from "@/sanity/types"

export type Settings = NonNullable<SETTINGS_QUERY_RESULT>

export type IconVariant = NonNullable<Settings["socialIconStyle"]>

export type Home = NonNullable<HOME_PAGE_QUERY_RESULT>

export type UpcomingEvent = Home["events"][0]
