import { format } from "date-fns"
import { CalendarDays, MapPin } from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@tidewater-dsa/ui/components/carousel"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@tidewater-dsa/ui/components/card"
import type { SerializedEvent } from "@/types"
import { formatEventDateTime } from "@/lib/format"

const CARD_WIDTH_PX = 240

const DEFAULT_EMPTY_MESSAGE =
  "No featured events in {month}. Use the arrows above the calendar to look ahead."

const renderMessage = (template: string, viewMonth: Date): string =>
  template.replace(/\{month\}/gi, format(viewMonth, "MMMM"))

interface FeaturedCardProps {
  event: SerializedEvent
  onSelect: (e: SerializedEvent) => void
}

const FeaturedCard = ({ event, onSelect }: FeaturedCardProps) => {
  return (
    <button
      type="button"
      onClick={() => onSelect(event)}
      className="group block h-full w-full text-left cursor-pointer"
    >
      <Card
        size="sm"
        className="h-full rounded-md shadow-none ring-2 ring-foreground/15 transition-all duration-200 group-hover:ring-primary/80"
      >
        <CardHeader>
          <CardTitle className="line-clamp-2 leading-tight text-primary">
            {event.title}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-1.5 text-xs text-muted-foreground">
          <div className="flex items-start gap-1.5">
            <CalendarDays className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{formatEventDateTime(event.startISO, event.isAllDay)}</span>
          </div>
          {event.location && (
            <div className="flex items-start gap-1.5">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          )}
        </CardContent>

        {event.summary && (
          <CardFooter>
            <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground italic">
              {event.summary}
            </p>
          </CardFooter>
        )}
      </Card>
    </button>
  )
}

interface FeaturedEventsProps {
  events: SerializedEvent[]
  viewMonth: Date
  onSelect: (e: SerializedEvent) => void
  noEventsMessage?: string
}

export const FeaturedEvents = ({
  events,
  viewMonth,
  onSelect,
  noEventsMessage,
}: FeaturedEventsProps) => {
  const emptyText = renderMessage(
    noEventsMessage?.trim() || DEFAULT_EMPTY_MESSAGE,
    viewMonth
  )

  return (
    <section aria-labelledby="featured-heading" className="space-y-3">
      <h2
        id="featured-heading"
        className="text-2xl font-semibold tracking-tight"
      >
        Featured Events
      </h2>

      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      ) : (
        <Carousel opts={{ align: "start", containScroll: "trimSnaps" }}>
          <CarouselContent className="-ml-3">
            {events.map((event) => (
              <CarouselItem
                key={event.id}
                className="py-1 pl-4"
                // Tailwind arbitrary basis values don't compose well with the carousel's own flex math
                style={{ flex: `0 0 ${CARD_WIDTH_PX}px` }}
              >
                <FeaturedCard event={event} onSelect={onSelect} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      )}
    </section>
  )
}
