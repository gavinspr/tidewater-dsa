import type { Page, SETTINGS_QUERY_RESULT } from "@/sanity/types"
import type { HOME_PAGE_QUERY_RESULT } from "@/sanity/types"

export type Settings = NonNullable<SETTINGS_QUERY_RESULT>

export type IconVariant = NonNullable<Settings["socialIconStyle"]>

export type UpcomingEvent = HOME_PAGE_QUERY_RESULT["events"][number]

type BodyElement = NonNullable<Page["body"]>[number]

export type SanityImageBlock = Extract<BodyElement, { _type: "image" }>

export type ImageDisplaySize = NonNullable<SanityImageBlock["displaySize"]>

export type SanityTextBlock = Extract<BodyElement, { _type: "block" }>

type MarkDef = NonNullable<SanityTextBlock["markDefs"]>[number]

export type SanityLinkMarkDef = Extract<MarkDef, { _type: "link" }>
