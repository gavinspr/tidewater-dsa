import {
  endOfMonth,
  format,
  isToday,
  isWithinInterval,
  parseISO,
  startOfMonth,
} from "date-fns"
import { cn } from "@tidewater-dsa/ui/lib/utils"
import type { SerializedEvent } from "@/types"
import type { EventTypeStyle } from "@/lib/event-type-config"
import { isPast, type ParsedEvent } from "./utils"

interface ListViewProps {
  events: ParsedEvent[]
  viewMonth: Date
  now: Date
  onSelect: (e: SerializedEvent) => void
  styleFor: (e: SerializedEvent) => EventTypeStyle
}

export const ListView = ({
  events,
  viewMonth,
  now,
  onSelect,
  styleFor,
}: ListViewProps) => {
  const start = startOfMonth(viewMonth)
  const end = endOfMonth(viewMonth)

  const visible = events
    .filter(
      (e) =>
        isWithinInterval(e.start, { start, end }) ||
        isWithinInterval(e.end, { start, end }) ||
        (e.start < start && e.end > end)
    )
    .sort((a, b) => a.start.getTime() - b.start.getTime())

  if (visible.length === 0) {
    return (
      <div className="rounded-lg border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
        No events in {format(viewMonth, "MMMM yyyy")}.
      </div>
    )
  }

  const groups = new Map<string, ParsedEvent[]>()
  for (const e of visible) {
    const key = format(e.start, "yyyy-MM-dd")
    const existing = groups.get(key) ?? []
    existing.push(e)
    groups.set(key, existing)
  }

  return (
    <div className="divide-y rounded-lg border bg-card">
      {Array.from(groups.entries()).map(([key, pe]) => {
        const day = parseISO(key)

        return (
          <div key={key} className="flex gap-4 px-4 py-3 sm:px-6">
            <div className="w-14 shrink-0 text-center">
              <div className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                {format(day, "EEE")}
              </div>
              <div
                className={cn(
                  "text-2xl font-semibold tabular-nums",
                  isToday(day) && "text-primary"
                )}
              >
                {format(day, "d")}
              </div>
            </div>
            <ul className="flex-1 space-y-1.5">
              {pe.map((e) => {
                const style = styleFor(e)
                const past = isPast(e, now)

                return (
                  <li key={e.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(e)}
                      className={cn(
                        "flex w-full cursor-pointer items-start gap-3 rounded-md border-l-2 px-3 py-2 text-left text-sm transition-colors",
                        style.bg,
                        style.text,
                        style.border,
                        past && "opacity-60"
                      )}
                    >
                      <span className="w-14 shrink-0 text-xs tabular-nums opacity-80">
                        {e.isAllDay ? "all day" : format(e.start, "h:mm a")}
                      </span>
                      <span className="flex-1">
                        <span
                          className={cn(
                            "block font-medium",
                            past && "line-through decoration-current/60"
                          )}
                        >
                          {e.title}
                        </span>
                        {e.location && (
                          <span className="mt-0.5 block text-xs opacity-80">
                            {e.location}
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
    </div>
  )
}
