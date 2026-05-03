import { useMemo } from "react"
import { SlidersHorizontalIcon } from "lucide-react"
import { Button } from "@tidewater-dsa/ui/components/button"
import { Badge } from "@tidewater-dsa/ui/components/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@tidewater-dsa/ui/components/popover"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@tidewater-dsa/ui/components/sheet"
import { cn } from "@tidewater-dsa/ui/lib/utils"
import type { EventType, SerializedEvent, WorkingGroup } from "@/types"
import { getEventTypeStyle } from "@/lib/event-type-config"
import { ATTENDANCE_OPTIONS } from "@/lib/event-constants"
import {
  EMPTY_FILTERS,
  deriveFilterOptions,
  isFilterActive,
  type CalendarFilterState,
} from "@/lib/event-filters"
import { SearchInput } from "@/components/filters/SearchInput"
import {
  CheckboxList,
  FilterSectionHeading,
} from "@/components/filters/CheckboxList"
import { toggleArrayValue } from "@/components/filters/utils"

interface CalendarFiltersProps {
  events: SerializedEvent[]
  eventTypes: EventType[]
  workingGroups: WorkingGroup[]
  value: CalendarFilterState
  onChange: (next: CalendarFilterState) => void
  filteredCount: number
  totalCount: number
}

interface FilterBodyProps {
  value: CalendarFilterState
  onChange: (next: CalendarFilterState) => void
  workingGroupSlugs: string[]
  workingGroupLabelFor: (slug: string) => string
  topics: string[]
}

const FilterBody = ({
  value,
  onChange,
  workingGroupSlugs,
  workingGroupLabelFor,
  topics,
}: FilterBodyProps) => {
  const attendanceLabelFor = (v: string) =>
    ATTENDANCE_OPTIONS.find((o) => o.value === v)?.label ?? v

  return (
    <div className="divide-y">
      <div className="p-3">
        <FilterSectionHeading>Attendance</FilterSectionHeading>
        <CheckboxList
          idPrefix="event-attendance"
          items={ATTENDANCE_OPTIONS.map((o) => ({
            value: o.value,
            renderLabel: attendanceLabelFor,
          }))}
          selected={value.attendance}
          onToggle={(v) =>
            onChange({
              ...value,
              attendance: toggleArrayValue(
                value.attendance,
                v as (typeof ATTENDANCE_OPTIONS)[number]["value"]
              ),
            })
          }
          emptyLabel="No attendance types"
        />
      </div>

      {workingGroupSlugs.length > 0 && (
        <div className="p-3">
          <FilterSectionHeading>Working Group</FilterSectionHeading>
          <CheckboxList
            idPrefix="event-wg"
            items={workingGroupSlugs.map((v) => ({
              value: v,
              renderLabel: workingGroupLabelFor,
            }))}
            selected={value.workingGroups}
            onToggle={(v) =>
              onChange({
                ...value,
                workingGroups: toggleArrayValue(value.workingGroups, v),
              })
            }
            emptyLabel="No working groups yet"
          />
        </div>
      )}

      {topics.length > 0 && (
        <div className="p-3">
          <FilterSectionHeading>Topics</FilterSectionHeading>
          <CheckboxList
            idPrefix="event-topic"
            items={topics}
            selected={value.topics}
            onToggle={(v) =>
              onChange({
                ...value,
                topics: toggleArrayValue(value.topics, v),
              })
            }
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
  workingGroups,
  value,
  onChange,
  filteredCount,
  totalCount,
}: CalendarFiltersProps) => {
  const { workingGroups: eventWorkingGroups, topics } = useMemo(
    () => deriveFilterOptions(events),
    [events]
  )

  const workingGroupLabelFor = useMemo(() => {
    const labelBySlug = new Map<string, string>()

    for (const g of workingGroups) {
      if (g.value && g.label) labelBySlug.set(g.value, g.label)
    }

    return (slug: string) => labelBySlug.get(slug) ?? slug
  }, [workingGroups])

  const active = isFilterActive(value)

  const toggleEventType = (t: string) =>
    onChange({ ...value, eventTypes: toggleArrayValue(value.eventTypes, t) })

  const clearAll = () => onChange(EMPTY_FILTERS)

  const popoverBadgeCount =
    value.attendance.length + value.workingGroups.length + value.topics.length

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <SearchInput
          value={value.search}
          onChange={(next) => onChange({ ...value, search: next })}
          placeholder="Search events..."
          ariaLabel="Search events"
        />

        <div className="hidden sm:block">
          <Popover>
            <PopoverTrigger>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 gap-2"
                aria-label={
                  popoverBadgeCount > 0
                    ? `Filters (${popoverBadgeCount} active)`
                    : "Filters"
                }
              >
                <SlidersHorizontalIcon className="h-4 w-4" />
                Filters
                {popoverBadgeCount > 0 && (
                  <Badge
                    className="h-5 min-w-5 justify-center px-1.5 text-[10px] tabular-nums"
                  >
                    {popoverBadgeCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="max-h-[70vh] w-80 overflow-y-auto p-0"
            >
              <FilterBody
                value={value}
                onChange={onChange}
                workingGroupSlugs={eventWorkingGroups}
                workingGroupLabelFor={workingGroupLabelFor}
                topics={topics}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="sm:hidden">
          <Sheet>
            <SheetTrigger>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 gap-2"
                aria-label={
                  popoverBadgeCount > 0
                    ? `Filters (${popoverBadgeCount} active)`
                    : "Filters"
                }
              >
                <SlidersHorizontalIcon className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only">Filters</span>
                {popoverBadgeCount > 0 && (
                  <Badge
                    className="h-5 min-w-5 justify-center px-1.5 text-[10px] tabular-nums"
                  >
                    {popoverBadgeCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="flex h-[85vh] flex-col p-0">
              <SheetHeader className="border-b px-4 py-3">
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="min-h-0 flex-1 overflow-y-auto">
                <FilterBody
                  value={value}
                  onChange={onChange}
                  workingGroupSlugs={eventWorkingGroups}
                  workingGroupLabelFor={workingGroupLabelFor}
                  topics={topics}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
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
