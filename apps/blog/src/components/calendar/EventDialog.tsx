import { useMemo, useState, type ReactNode } from "react"
import { parseISO, isSameDay } from "date-fns"
import {
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  ExternalLinkIcon,
  UsersIcon,
  TagIcon,
  WrenchIcon,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@tidewater-dsa/ui/components/dialog"
import { Button } from "@tidewater-dsa/ui/components/button"
import { Badge } from "@tidewater-dsa/ui/components/badge"
import type { SerializedEvent } from "@/types"
import { ATTENDANCE_LABEL } from "@/lib/event-constants"
import { formatEventDate, formatEventTime } from "@/lib/format"
import type { EventType } from "./EventCalendar"

interface InfoRowProps {
  icon: ReactNode
  children: ReactNode
}

const InfoRow = ({ icon, children }: InfoRowProps) => (
  <div className="flex items-start gap-3">
    <span className="mt-0.5 text-muted-foreground">{icon}</span>
    <div className="flex-1">{children}</div>
  </div>
)

interface EventDetailsProps {
  event: SerializedEvent
  eventTypes: EventType[]
}

const EventDetails = ({ event, eventTypes }: EventDetailsProps) => {
  const start = parseISO(event.startISO)
  const end = parseISO(event.endISO)
  const sameDay = isSameDay(start, end)

  const eventTypeLabel = useMemo(() => {
    if (!event.eventType) return null

    const match = eventTypes.find((t) => t.value === event.eventType)

    return match?.label ?? event.eventType
  }, [event.eventType, eventTypes])

  const dateLine = event.isAllDay
    ? sameDay
      ? formatEventDate(event.startISO)
      : `${formatEventDate(event.startISO)} – ${formatEventDate(event.endISO)}`
    : formatEventDate(event.startISO)

  const timeLine = event.isAllDay
    ? "All day"
    : sameDay
      ? `${formatEventTime(event.startISO)} – ${formatEventTime(event.endISO)}`
      : `${formatEventDate(event.startISO)}, ${formatEventTime(event.startISO)} – ${formatEventDate(event.endISO)}, ${formatEventTime(event.endISO)}`

  const attendanceLabel = event.attendance
    ? ATTENDANCE_LABEL[event.attendance]
    : null

  return (
    <>
      <DialogHeader>
        <div className="flex flex-wrap items-center gap-2">
          {eventTypeLabel && (
            <Badge variant="secondary" className="font-normal">
              {eventTypeLabel}
            </Badge>
          )}
          {attendanceLabel && (
            <Badge variant="outline" className="gap-1 font-normal">
              <UsersIcon />
              {attendanceLabel}
            </Badge>
          )}
          {event.workingGroup && (
            <Badge variant="outline" className="gap-1 font-normal">
              <WrenchIcon />
              {event.workingGroup}
            </Badge>
          )}
        </div>
        <DialogTitle className="pt-1 text-xl leading-snug">
          {event.title}
        </DialogTitle>
        {event.summary && (
          <DialogDescription className="pt-1 text-sm leading-relaxed">
            {event.summary}
          </DialogDescription>
        )}
      </DialogHeader>

      <div className="space-y-3 pt-1 text-sm">
        <InfoRow icon={<CalendarDaysIcon className="h-4 w-4" />}>
          {dateLine}
        </InfoRow>
        <InfoRow icon={<ClockIcon className="h-4 w-4" />}>{timeLine}</InfoRow>
        {event.location && (
          <InfoRow icon={<MapPinIcon className="h-4 w-4" />}>
            {event.location}
          </InfoRow>
        )}
        {event.topics.length > 0 && (
          <InfoRow icon={<TagIcon className="h-4 w-4" />}>
            <div className="flex flex-wrap gap-1">
              {event.topics.map((t) => (
                <Badge key={t} variant="secondary" className="font-normal">
                  {t}
                </Badge>
              ))}
            </div>
          </InfoRow>
        )}
      </div>

      {event.description && !event.summary && (
        <div className="max-h-56 overflow-y-auto rounded-md border bg-muted/30 p-3 text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
          {event.description}
        </div>
      )}

      <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
        <Button
          variant="outline"
          size="sm"
          render={
            <a
              href={event.googleUrl}
              target="_blank"
              rel="noopener noreferrer"
            />
          }
        >
          <ExternalLinkIcon />
          Open in Google Calendar
        </Button>
        {event.rsvpLink && (
          <Button
            size="sm"
            render={
              <a
                href={event.rsvpLink}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <ExternalLinkIcon />
            RSVP
          </Button>
        )}
      </DialogFooter>
    </>
  )
}

interface EventDialogProps {
  event: SerializedEvent | null
  eventTypes: EventType[]
  onOpenChange: (open: boolean) => void
}

export const EventDialog = ({
  event,
  eventTypes,
  onOpenChange,
}: EventDialogProps) => {
  const [preservedEvent, setPreservedEvent] = useState<SerializedEvent | null>(
    event
  )

  if (event && event !== preservedEvent) {
    setPreservedEvent(event)
  }

  const current = event ?? preservedEvent
  const open = Boolean(event)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] sm:w-full sm:max-w-lg">
        {current && <EventDetails event={current} eventTypes={eventTypes} />}
      </DialogContent>
    </Dialog>
  )
}
