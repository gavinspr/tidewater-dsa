import { useState, useEffect, useRef } from "react"
import { Button } from "@tidewater-dsa/ui/components/button"
import {
  ArrowLeft,
  Calendar,
  Clock,
  ExternalLink,
  MapPin,
  Monitor,
} from "lucide-react"
import type { UpcomingEvent } from "@/lib/types"
import { formatEventDate, formatEventTime } from "@/lib/format"
import { clean } from "@/lib/stega"
import { ensureStylesLoaded, extractAnInfo } from "@/lib/action-network"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@tidewater-dsa/ui/components/card"
import { Skeleton } from "@tidewater-dsa/ui/components/skeleton"

interface ActionNetworkEventProps {
  rsvpLink: string
}

const ActionNetworkEvent = ({ rsvpLink }: ActionNetworkEventProps) => {
  const [ready, setReady] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const anInfo = extractAnInfo(rsvpLink)

  useEffect(() => {
    if (!anInfo || !containerRef.current) return

    const { type, slug } = anInfo
    const widgetId = `can-${type}-area-${slug}`

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

    const interval = setInterval(() => {
      const el = document.getElementById(widgetId)
      if (el && el.children.length > 0) {
        setReady(true)
        clearInterval(interval)
      }
    }, 150)

    return () => clearInterval(interval)
  }, [anInfo?.type, anInfo?.slug])

  useEffect(() => {
    setReady(false)
  }, [rsvpLink])

  if (!anInfo) {
    const cleanedUrl = clean(rsvpLink)
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
          <a href={cleanedUrl} target="_blank" rel="noreferrer">
            <Button
              size="lg"
              className="w-full cursor-pointer gap-2 font-semibold sm:w-72"
            >
              RSVP for this event
              <ExternalLink className="font-me mb-0.5 size-4" strokeWidth={3} />
            </Button>
          </a>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="an-embed min-h-100">
      {!ready && (
        <div className="space-y-4 py-4">
          <Skeleton className="h-5 w-48 rounded-md" />
          <div className="h-px w-full bg-border/30" />
          <div className="space-y-3">
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <Skeleton className="h-12 w-full rounded-md" />
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

const EventSideImage = ({ imageUrl }: EventSideImageProps) => {
  return (
    <div className="mt-8 w-full overflow-hidden rounded-xl shadow-lg lg:mt-0">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Community event"
          className="h-full w-full bg-muted object-cover object-center"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center bg-primary/5 p-6 text-center text-primary/40">
          <Calendar className="mb-2 h-8 w-8 opacity-50" />
          <span className="font-medium">Events Image Space</span>
          <span className="mt-1 text-sm">Add an 'eventsImage' in Sanity</span>
        </div>
      )}
    </div>
  )
}

interface UpcomingEventProps {
  events: UpcomingEvent[]
  sideImageUrl?: string | null
  noRsvpMessage?: string | null
}

export const UpcomingEvents = ({
  events,
  sideImageUrl,
  noRsvpMessage,
}: UpcomingEventProps) => {
  const [selectedEvent, setSelectedEvent] = useState<UpcomingEvent | null>(null)

  // Detail View
  if (selectedEvent) {
    const hasAnLink = !!selectedEvent.rsvpLink

    return (
      <div className="space-y-6">
        <Button
          onClick={() => setSelectedEvent(null)}
          variant="link"
          className="-ml-1 gap-1.5 p-0 text-muted-foreground no-underline! transition-colors hover:text-primary"
        >
          <ArrowLeft />
          All Events
        </Button>

        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div className="space-y-6 py-2">
            {hasAnLink ? (
              <ActionNetworkEvent rsvpLink={selectedEvent.rsvpLink!} />
            ) : (
              // Non-AN event
              <>
                <div>
                  <h3 className="text-2xl font-extrabold tracking-tight">
                    {selectedEvent.title}
                  </h3>
                  <div className="mt-4 space-y-2">
                    {selectedEvent.date && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 shrink-0 text-primary" />
                        <span>
                          {formatEventDate(selectedEvent.date)} •{" "}
                          {formatEventTime(selectedEvent.date)}
                        </span>
                      </div>
                    )}
                    {selectedEvent.endDate && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 shrink-0 text-primary" />
                        <span>
                          Ends {formatEventDate(selectedEvent.endDate)} •{" "}
                          {formatEventTime(selectedEvent.endDate)}
                        </span>
                      </div>
                    )}
                    {selectedEvent.location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {selectedEvent.isVirtual ? (
                          <Monitor className="h-4 w-4 shrink-0 text-primary" />
                        ) : (
                          <MapPin className="h-4 w-4 shrink-0 text-primary" />
                        )}
                        <span>
                          {selectedEvent.location}
                          {selectedEvent.address &&
                            ` • ${selectedEvent.address}`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                {selectedEvent.summary && (
                  <p className="text-muted-foreground">
                    {selectedEvent.summary}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  {noRsvpMessage || "No RSVP required — just show up!"}
                </p>
              </>
            )}
          </div>

          <EventSideImage imageUrl={sideImageUrl} />
        </div>
      </div>
    )
  }

  // List View
  return (
    <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
      <div className="py-2">
        <div className="max-h-125 divide-y divide-border/50 overflow-y-auto pr-2">
          {events.map((event) => (
            <div
              key={event._id}
              className="group flex items-center justify-between gap-4 py-5 first:pt-0 last:pb-0"
            >
              <div className="space-y-0.5">
                <h3 className="leading-tight font-bold">{event.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {event.date && formatEventDate(event.date)}{" "}
                  {event.date && formatEventTime(event.date)}
                  {event.location && ` · ${event.location}`}
                </p>
              </div>
              <Button
                onClick={() => setSelectedEvent(event)}
                size="sm"
                variant="outline"
                className="cursor-pointer gap-1 border-primary/30 text-xs font-bold tracking-wider text-primary uppercase hover:bg-primary hover:text-white"
              >
                View Event
              </Button>
            </div>
          ))}
        </div>
      </div>

      <EventSideImage imageUrl={sideImageUrl} />
    </div>
  )
}
