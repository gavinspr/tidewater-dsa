import { useMemo, type ReactNode } from "react"
import { Search, SlidersHorizontal } from "lucide-react"
import { Button } from "@tidewater-dsa/ui/components/button"
import { Input } from "@tidewater-dsa/ui/components/input"
import { Badge } from "@tidewater-dsa/ui/components/badge"
import { Checkbox } from "@tidewater-dsa/ui/components/checkbox"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@tidewater-dsa/ui/components/popover"
import { cn } from "@tidewater-dsa/ui/lib/utils"
import type { SerializedEvent } from "@/types"
import type { EventType } from "./EventCalendar"
import { getEventTypeStyle } from "@/lib/event-type-colors"
import { ATTENDANCE_OPTIONS } from "@/lib/event-constants"
import {
  EMPTY_FILTERS,
  countActiveFilterCategories,
  deriveFilterOptions,
  isFilterActive,
  type CalendarFilterState,
} from "@/lib/event-filters"

interface CalendarFiltersProps {
  events: SerializedEvent[]
  eventTypes: EventType[]
  value: CalendarFilterState
  onChange: (next: CalendarFilterState) => void
  filteredCount: number
  totalCount: number
}

const SectionHeading = ({ children }: { children: ReactNode }) => (
  <h4 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
    {children}
  </h4>
)

interface CheckboxListProps {
  items: string[]
  selected: string[]
  onToggle: (value: string) => void
  emptyLabel: string
  getLabel?: (value: string) => string
}

const CheckboxList = ({
  items,
  selected,
  onToggle,
  emptyLabel,
  getLabel,
}: CheckboxListProps) => {
  if (items.length === 0) {
    return <p className="text-xs text-muted-foreground">{emptyLabel}</p>
  }
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex items-center gap-2">
          <Checkbox
            id={`filter-${item}`}
            checked={selected.includes(item)}
            onCheckedChange={() => onToggle(item)}
            className="cursor-pointer"
          />
          <label
            htmlFor={`filter-${item}`}
            className="cursor-pointer text-sm leading-none"
          >
            {getLabel ? getLabel(item) : item}
          </label>
        </li>
      ))}
    </ul>
  )
}

interface FilterPopoverContentProps {
  value: CalendarFilterState
  onChange: (next: CalendarFilterState) => void
  workingGroups: string[]
  topics: string[]
}

const FilterPopoverContent = ({
  value,
  onChange,
  workingGroups,
  topics,
}: FilterPopoverContentProps) => {
  const toggleAttendance = (
    v: (typeof ATTENDANCE_OPTIONS)[number]["value"]
  ) => {
    onChange({
      ...value,
      attendance: value.attendance.includes(v)
        ? value.attendance.filter((x) => x !== v)
        : [...value.attendance, v],
    })
  }

  const toggleWorkingGroup = (v: string) => {
    onChange({
      ...value,
      workingGroups: value.workingGroups.includes(v)
        ? value.workingGroups.filter((x) => x !== v)
        : [...value.workingGroups, v],
    })
  }

  const toggleTopic = (v: string) => {
    onChange({
      ...value,
      topics: value.topics.includes(v)
        ? value.topics.filter((x) => x !== v)
        : [...value.topics, v],
    })
  }

  const attendanceLabelFor = (v: string) =>
    ATTENDANCE_OPTIONS.find((o) => o.value === v)?.label ?? v

  return (
    <div className="divide-y">
      <div className="p-3">
        <SectionHeading>Attendance</SectionHeading>
        <CheckboxList
          items={ATTENDANCE_OPTIONS.map((o) => o.value)}
          selected={value.attendance}
          onToggle={(v) =>
            toggleAttendance(v as (typeof ATTENDANCE_OPTIONS)[number]["value"])
          }
          emptyLabel="No attendance types"
          getLabel={attendanceLabelFor}
        />
      </div>

      {workingGroups.length > 0 && (
        <div className="p-3">
          <SectionHeading>Working Group</SectionHeading>
          <CheckboxList
            items={workingGroups}
            selected={value.workingGroups}
            onToggle={toggleWorkingGroup}
            emptyLabel="No working groups yet"
          />
        </div>
      )}

      {topics.length > 0 && (
        <div className="p-3">
          <SectionHeading>Topics</SectionHeading>
          <CheckboxList
            items={topics}
            selected={value.topics}
            onToggle={toggleTopic}
            emptyLabel="No topics yet"
          />
        </div>
      )}
    </div>
  )
}

export const CalendarFilters = ({
  events,
  eventTypes,
  value,
  onChange,
  filteredCount,
  totalCount,
}: CalendarFiltersProps) => {
  const { workingGroups, topics } = useMemo(
    () => deriveFilterOptions(events),
    [events]
  )

  const active = isFilterActive(value)
  const activeCount = countActiveFilterCategories(value)

  const toggleEventType = (t: string) => {
    onChange({
      ...value,
      eventTypes: value.eventTypes.includes(t)
        ? value.eventTypes.filter((v) => v !== t)
        : [...value.eventTypes, t],
    })
  }

  const clearAll = () => onChange(EMPTY_FILTERS)

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={value.search}
            onChange={(e) => onChange({ ...value, search: e.target.value })}
            placeholder="Search events..."
            className="pl-9"
            aria-label="Search events"
          />
        </div>

        <Popover>
          <PopoverTrigger>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 gap-2"
              aria-label={
                activeCount > 0 ? `Filters (${activeCount} active)` : "Filters"
              }
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeCount > 0 && (
                <Badge
                  variant="secondary"
                  className="h-5 min-w-5 justify-center px-1.5 text-[10px] tabular-nums"
                >
                  {activeCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <FilterPopoverContent
              value={value}
              onChange={onChange}
              workingGroups={workingGroups}
              topics={topics}
            />
          </PopoverContent>
        </Popover>
      </div>

      {eventTypes.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {eventTypes
            .filter((t): t is typeof t & { label: string; value: string } =>
              Boolean(t.label && t.value)
            )
            .map((type) => {
              const isActive = value.eventTypes.includes(type.value)
              const style = getEventTypeStyle(type.color)
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => toggleEventType(type.value)}
                  aria-pressed={isActive}
                  className={cn(
                    "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                    isActive
                      ? style.chipSelectedClass
                      : "border-border bg-background text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  <span
                    className={cn("h-1.5 w-1.5 rounded-full", style.dot)}
                    aria-hidden
                  />
                  {type.label}
                </button>
              )
            })}
        </div>
      )}

      {active && (
        <div className="ml-0.5 flex items-center justify-between">
          <p
            className="text-xs text-muted-foreground"
            role="status"
            aria-live="polite"
          >
            {filteredCount === 0
              ? "No events match your filters."
              : `Showing ${filteredCount} of ${totalCount} events.`}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="h-auto px-2 py-1 text-xs text-muted-foreground hover:bg-transparent hover:text-foreground hover:underline"
          >
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  )
}
