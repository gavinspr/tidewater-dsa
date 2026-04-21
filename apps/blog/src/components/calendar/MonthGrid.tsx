import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns"
import { Button } from "@tidewater-dsa/ui/components/button"
import { cn } from "@tidewater-dsa/ui/lib/utils"
import type { SerializedEvent } from "@/types"
import type { EventTypeStyle } from "@/lib/event-type-colors"
import { isPast, occursOnDay, type ParsedEvent } from "./utils"

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MAX_EVENTS_PER_CELL = 3

interface EventPillProps {
  event: ParsedEvent
  day: Date
  now: Date
  style: EventTypeStyle
  onClick: () => void
}

const EventPill = ({ event, day, now, style, onClick }: EventPillProps) => {
  const past = isPast(event, now)
  // Only show the time in the cell where the event starts, and only on wider screens, cells are too narrow on phones to fit time + title
  const showTime = !event.isAllDay && isSameDay(event.start, day)

  return (
    <button
      type="button"
      onClick={onClick}
      title={event.title}
      className={cn(
        "group flex w-full cursor-pointer items-center gap-1 overflow-hidden rounded border-l-2 px-1.5 py-0.5 text-left text-[11px] leading-tight transition-colors",
        style.bg,
        style.text,
        style.border,
        past && "opacity-60"
      )}
    >
      {showTime && (
        <span className="hidden shrink-0 tabular-nums opacity-75 md:inline">
          {format(event.start, "h:mma").toLowerCase().replace(":00", "")}
        </span>
      )}
      <span
        className={cn(
          "truncate font-medium",
          past && "line-through decoration-current/60"
        )}
      >
        {event.title}
      </span>
    </button>
  )
}

interface DayCellProps {
  day: Date
  viewMonth: Date
  events: ParsedEvent[]
  now: Date
  onSelect: (e: SerializedEvent) => void
  styleFor: (e: SerializedEvent) => EventTypeStyle
  isLastCol: boolean
  isLastRow: boolean
}

const DayCell = ({
  day,
  viewMonth,
  events,
  now,
  onSelect,
  styleFor,
  isLastCol,
  isLastRow,
}: DayCellProps) => {
  const inMonth = isSameMonth(day, viewMonth)
  const today = isToday(day)
  const overflow = Math.max(0, events.length - MAX_EVENTS_PER_CELL)
  const visible = events.slice(0, MAX_EVENTS_PER_CELL)

  return (
    <div
      className={cn(
        "relative min-h-28 p-1.5 text-sm",
        !isLastCol && "border-r",
        !isLastRow && "border-b",
        !inMonth && "bg-muted/20"
      )}
    >
      <div className="flex items-center justify-start">
        {today ? (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-[11px] font-semibold text-background">
            {format(day, "d")}
          </span>
        ) : (
          <span
            className={cn(
              "px-1 text-xs font-medium",
              inMonth ? "text-foreground" : "text-muted-foreground/60"
            )}
          >
            {format(day, "d")}
          </span>
        )}
      </div>

      <div className="mt-1 flex flex-col gap-0.5">
        {visible.map((e) => (
          <EventPill
            key={`${e.id}-${day.toISOString()}`}
            event={e}
            day={day}
            now={now}
            style={styleFor(e)}
            onClick={() => onSelect(e)}
          />
        ))}
        {overflow > 0 && (
          <Button
            variant="link"
            size="xs"
            onClick={() => onSelect(events[MAX_EVENTS_PER_CELL])}
            className="mt-0.5 h-auto justify-start px-0 text-[11px] text-muted-foreground hover:text-foreground"
          >
            +{overflow} more
          </Button>
        )}
      </div>
    </div>
  )
}

interface MonthGridProps {
  viewMonth: Date
  events: ParsedEvent[]
  now: Date
  onSelect: (e: SerializedEvent) => void
  styleFor: (e: SerializedEvent) => EventTypeStyle
}

export const MonthGrid = ({
  viewMonth,
  events,
  now,
  onSelect,
  styleFor,
}: MonthGridProps) => {
  const gridStart = startOfWeek(startOfMonth(viewMonth), { weekStartsOn: 0 })
  const gridEnd = endOfWeek(endOfMonth(viewMonth), { weekStartsOn: 0 })

  const days: Date[] = []
  for (let d = gridStart; d <= gridEnd; d = addDays(d, 1)) days.push(d)

  const eventsByDay = new Map<string, ParsedEvent[]>()
  for (const day of days) {
    const key = day.toDateString()
    const todays = events
      .filter((e) => occursOnDay(e, day))
      .sort((a, b) => {
        if (a.isAllDay !== b.isAllDay) return a.isAllDay ? -1 : 1
        return a.start.getTime() - b.start.getTime()
      })
    eventsByDay.set(key, todays)
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="grid grid-cols-7 border-b bg-muted/30">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="px-2 py-2 text-center text-xs font-medium text-muted-foreground"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid auto-rows-fr grid-cols-7">
        {days.map((day, idx) => (
          <DayCell
            key={day.toISOString()}
            day={day}
            viewMonth={viewMonth}
            events={eventsByDay.get(day.toDateString()) ?? []}
            now={now}
            onSelect={onSelect}
            styleFor={styleFor}
            isLastCol={(idx + 1) % 7 === 0}
            isLastRow={idx >= days.length - 7}
          />
        ))}
      </div>
    </div>
  )
}
