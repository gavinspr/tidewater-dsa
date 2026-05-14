import { useEffect, useRef, useState } from "react"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CalendarIcon,
  ClockIcon,
  ExternalLinkIcon,
  MapPinIcon,
  MonitorIcon,
} from "lucide-react"
import { Button } from "@tidewater-dsa/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@tidewater-dsa/ui/components/card"
import { Skeleton } from "@tidewater-dsa/ui/components/skeleton"
import { cn } from "@tidewater-dsa/ui/lib/utils"
import type { SerializedEvent } from "@/types"
import {
  formatEventDate,
  formatEventTime,
  splitDateForCard,
} from "@/lib/format"
import {
  ensureStylesLoaded,
  extractActionNetworkInfo,
} from "@/lib/action-network"

interface ActionNetworkEventProps {
  rsvpLink: string
}

const ActionNetworkEvent = ({ rsvpLink }: ActionNetworkEventProps) => {
  const [ready, setReady] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const anInfo = extractActionNetworkInfo(rsvpLink)

  useEffect(() => {
    if (!anInfo || !containerRef.current) return

    const { type, slug } = anInfo
    const widgetId = `can-${type}-area-${slug}`

    // Clean up any prior embed when the user clicks away from one event and into another without unmounting the parent
    const existing = document.getElementById(widgetId)
    if (existing) existing.remove()

    const targetDiv = document.createElement("div")
    targetDiv.id = widgetId
    targetDiv.style.width = "100%"
    containerRef.current.innerHTML = ""
    containerRef.current.appendChild(targetDiv)

    const oldScript = document.querySelector(
      `script[data-an-widget="${type}-${slug}"]`
    )
    if (oldScript) oldScript.remove()

    ensureStylesLoaded()

    const script = document.createElement("script")
    script.src = `https://actionnetwork.org/widgets/v2/${type}/${slug}?format=js&source=widget`
    script.setAttribute("data-an-widget", `${type}-${slug}`)
    document.body.appendChild(script)

    // Poll for the widget to render
    const interval = setInterval(() => {
      const el = document.getElementById(widgetId)
      if (el && el.children.length > 0) {
        setReady(true)
        clearInterval(interval)
      }
    }, 150)

    return () => clearInterval(interval)
  }, [anInfo])

  if (!anInfo) {
    return (
      <Card className="flex min-h-62.5 w-full flex-col justify-center border-dashed bg-muted/20 text-center shadow-none">
        <CardHeader>
          <CardTitle className="text-2xl">Registration Required</CardTitle>
          <CardDescription className="mx-auto max-w-md text-base">
            This event requires registration on an external page. Click below to
            secure your spot.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button
            size="lg"
            className="w-full cursor-pointer gap-2 font-semibold sm:w-72"
            render={<a href={rsvpLink} target="_blank" rel="noreferrer" />}
          >
            RSVP for this event
            <ExternalLinkIcon className="mb-0.5 size-4" strokeWidth={3} />
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="an-embed min-h-138">
      {!ready && (
        <div className="space-y-5 py-4">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-6 w-full" />
          <div className="h-px w-full bg-border/30" />
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-12 w-full" />
        </div>
      )}
      <div
        ref={containerRef}
        className={`transition-opacity duration-500 ${ready ? "opacity-100" : "h-0 overflow-hidden opacity-0"}`}
      />
    </div>
  )
}

interface EventSideImageProps {
  imageUrl?: string | null
}

const EventSideImage = ({ imageUrl }: EventSideImageProps) => (
  <div className="mt-8 w-full overflow-hidden rounded-lg shadow-lg lg:mt-0">
    {imageUrl ? (
      <img
        src={imageUrl}
        alt="Community event"
        className="h-full w-full bg-muted object-cover object-center"
      />
    ) : (
      <div className="flex h-full w-full flex-col items-center justify-center bg-primary/5 p-6 text-center text-primary/40">
        <CalendarIcon className="mb-2 h-8 w-8 opacity-50" />
        <span className="font-medium">Events Image Space</span>
        <span className="mt-1 text-sm">Add an 'eventsImage' in Sanity</span>
      </div>
    )}
  </div>
)

const isVirtualEvent = (event: SerializedEvent): boolean =>
  event.attendance === "virtual" || event.attendance === "hybrid"

// todo: derive from types
interface UpcomingEventsProps {
  events: SerializedEvent[]
  sideImageUrl?: string | null
  noRsvpMessage?: string | null
  trailingCta?: { text: string; href: string } | null
}

export const UpcomingEvents = ({
  events,
  sideImageUrl,
  noRsvpMessage,
  trailingCta,
}: UpcomingEventsProps) => {
  const [selectedEvent, setSelectedEvent] = useState<SerializedEvent | null>(
    null
  )

  // Detail View
  if (selectedEvent) {
    const isVirtual = isVirtualEvent(selectedEvent)

    return (
      <div className="space-y-6">
        <Button
          onClick={() => setSelectedEvent(null)}
          variant="link"
          className="-ml-1 gap-1.5 p-0 text-foreground-soft no-underline! transition-colors hover:text-primary"
        >
          <ArrowLeftIcon />
          All Events
        </Button>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div className="space-y-6 self-start py-2">
            {selectedEvent.rsvpLink ? (
              <ActionNetworkEvent
                key={selectedEvent.id}
                rsvpLink={selectedEvent.rsvpLink}
              />
            ) : (
              // Non-AN event
              <>
                <div>
                  <h3 className="heading-display text-2xl">
                    {selectedEvent.title}
                  </h3>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-foreground-soft">
                      <CalendarIcon className="h-4 w-4 shrink-0 text-primary" />
                      <span>
                        {formatEventDate(selectedEvent.startISO)}
                        {!selectedEvent.isAllDay &&
                          ` • ${formatEventTime(selectedEvent.startISO)}`}
                      </span>
                    </div>
                    {selectedEvent.endISO &&
                      selectedEvent.endISO !== selectedEvent.startISO &&
                      formatEventDate(selectedEvent.endISO) !==
                        formatEventDate(selectedEvent.startISO) && (
                        <div className="flex items-center gap-2 text-sm text-foreground-soft">
                          <ClockIcon className="h-4 w-4 shrink-0 text-primary" />
                          <span>
                            Ends {formatEventDate(selectedEvent.endISO)}
                            {!selectedEvent.isAllDay &&
                              ` • ${formatEventTime(selectedEvent.endISO)}`}
                          </span>
                        </div>
                      )}
                    {selectedEvent.location && (
                      <div className="flex items-center gap-2 text-sm text-foreground-soft">
                        {isVirtual ? (
                          <MonitorIcon className="h-4 w-4 shrink-0 text-primary" />
                        ) : (
                          <MapPinIcon className="h-4 w-4 shrink-0 text-primary" />
                        )}
                        <span>{selectedEvent.location}</span>
                      </div>
                    )}
                  </div>
                </div>
                {selectedEvent.summary && (
                  <p className="text-foreground-soft">
                    {selectedEvent.summary}
                  </p>
                )}
                <p className="text-sm text-foreground-soft">
                  {noRsvpMessage || "No RSVP required — just show up!"}
                </p>
              </>
            )}
          </div>

          <div className="self-center">
            <EventSideImage imageUrl={sideImageUrl} />
          </div>
        </div>
      </div>
    )
  }

  // List View
  return (
    <div className="space-y-7">
      <div
        className={cn(
          "grid border-t-2 border-l-2 border-foreground",
          "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
          "max-sm:border-l-0"
        )}
      >
        {events.map((event) => {
          const { day, monthYear, weekday } = splitDateForCard(event.startISO)
          const isVirtual = isVirtualEvent(event)

          return (
            <button
              key={event.id}
              type="button"
              onClick={() => setSelectedEvent(event)}
              className={cn(
                "group/card flex flex-col gap-3 border-r-2 border-b-2 border-foreground bg-background p-6 pb-7 text-left",
                "cursor-pointer transition-colors duration-150",
                "hover:bg-foreground hover:text-background focus-visible:bg-foreground focus-visible:text-background focus-visible:outline-none",
                "max-sm:border-r-0"
              )}
            >
              {event.eventType && (
                <span
                  className={cn(
                    "inline-block self-start rounded-sm bg-primary-soft px-2 py-1 font-mono text-[0.66rem] font-semibold tracking-[0.12em] text-primary-deep uppercase",
                    "group-hover/card:bg-primary group-hover/card:text-white"
                  )}
                >
                  {event.eventType}
                </span>
              )}
              <div className="flex items-baseline gap-2.5 font-heading text-[2.4rem] leading-none font-extrabold text-primary">
                {day}
                <span className="font-mono text-[0.78rem] font-medium tracking-[0.06em] text-foreground-soft uppercase group-hover/card:text-white/70">
                  {monthYear}
                </span>
              </div>
              <div className="heading-display text-[1.35rem] leading-[1.05]">
                {event.title}
              </div>
              <div className="font-mono text-[0.74rem] tracking-[0.06em] text-foreground-soft uppercase group-hover/card:text-white/75">
                <span>
                  {weekday}
                  {!event.isAllDay && ` · ${formatEventTime(event.startISO)}`}
                </span>
                {event.location && (
                  <>
                    <br />
                    <span className="inline-flex items-center gap-1.5 tracking-normal normal-case">
                      {isVirtual ? (
                        <MonitorIcon className="h-3 w-3" />
                      ) : (
                        <MapPinIcon className="h-3 w-3" />
                      )}
                      {event.location}
                    </span>
                  </>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {trailingCta && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            className="rounded-lg border-2 border-foreground bg-transparent p-5 text-base font-bold transition-all hover:bg-foreground hover:text-background"
            render={<a href={trailingCta.href} />}
          >
            {trailingCta.text}
            <ArrowRightIcon className="size-5" />
          </Button>
        </div>
      )}
    </div>
  )
}
