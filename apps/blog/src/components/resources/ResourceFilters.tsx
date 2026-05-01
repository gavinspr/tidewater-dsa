import { SlidersHorizontalIcon, XIcon, DollarSignIcon } from "lucide-react"
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
import { SearchInput } from "@/components/filters/SearchInput"
import {
  CheckboxList,
  FilterSectionHeading,
} from "@/components/filters/CheckboxList"
import {
  getCategoryLabel,
  getCategoryTheme,
} from "@/lib/resource-category-config"
import {
  EMPTY_RESOURCE_FILTERS,
  isResourceFilterActive,
  type ResourceFilterState,
} from "@/lib/resource-filters"
import type { FilterOption } from "@/lib/resources"
import type { Resource } from "@/types"

const toggle = <T,>(arr: T[], value: T): T[] =>
  arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]

interface FilterBodyProps {
  filters: ResourceFilterState
  setFilters: (next: ResourceFilterState) => void
  cities: FilterOption[]
  languages: FilterOption[]
}

const FilterBody = ({
  filters,
  setFilters,
  cities,
  languages,
}: FilterBodyProps) => (
  <div className="divide-y">
    <div className="p-3">
      <FilterSectionHeading>City</FilterSectionHeading>
      <CheckboxList
        idPrefix="resource-city"
        items={cities}
        selected={filters.cities}
        onToggle={(v) =>
          setFilters({ ...filters, cities: toggle(filters.cities, v) })
        }
        emptyLabel="No cities found"
      />
    </div>

    <div className="p-3">
      <FilterSectionHeading>Languages</FilterSectionHeading>
      <CheckboxList
        idPrefix="resource-lang"
        items={languages}
        selected={filters.languages}
        onToggle={(v) =>
          setFilters({ ...filters, languages: toggle(filters.languages, v) })
        }
        emptyLabel="No languages found"
      />
    </div>
  </div>
)
interface ResourceFiltersProps {
  filters: ResourceFilterState
  setFilters: (next: ResourceFilterState) => void
  resources: Resource[]
  categoryCounts: { group: string; count: number }[]
  cities: FilterOption[]
  languages: FilterOption[]
  filteredCount: number
}

export const ResourceFilters = ({
  filters,
  setFilters,
  resources,
  categoryCounts,
  cities,
  languages,
  filteredCount,
}: ResourceFiltersProps) => {
  const active = isResourceFilterActive(filters)

  const toggleCategory = (group: string) =>
    setFilters({
      ...filters,
      categories: toggle(filters.categories, group),
    })

  const toggleFree = () =>
    setFilters({ ...filters, freeOnly: !filters.freeOnly })

  const clearAll = () => setFilters(EMPTY_RESOURCE_FILTERS)

  const popoverBadgeCount = filters.cities.length + filters.languages.length

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <SearchInput
          value={filters.search}
          onChange={(next) => setFilters({ ...filters, search: next })}
          placeholder="Search resources…"
          ariaLabel="Search community resources"
        />

        <Button
          variant={filters.freeOnly ? "default" : "outline"}
          size="sm"
          onClick={toggleFree}
          aria-pressed={filters.freeOnly}
          className={cn(
            "shrink-0 gap-1.5 px-2 sm:px-3",
            filters.freeOnly && "bg-emerald-600 text-white hover:bg-emerald-700"
          )}
        >
          <DollarSignIcon className="h-3.5 w-3.5" />
          Free
        </Button>

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
                  <Badge className="h-5 min-w-5 justify-center px-1.5 text-[10px] tabular-nums">
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
                filters={filters}
                setFilters={setFilters}
                cities={cities}
                languages={languages}
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
                    variant="secondary"
                    className="h-5 min-w-5 justify-center px-1.5 text-[10px] tabular-nums"
                  >
                    {popoverBadgeCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="flex w-full flex-col gap-0 p-0 sm:max-w-sm"
            >
              <SheetHeader className="border-b p-4">
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="min-h-0 flex-1 overflow-y-auto">
                <FilterBody
                  filters={filters}
                  setFilters={setFilters}
                  cities={cities}
                  languages={languages}
                />
              </div>
              {active && (
                <div className="border-t p-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={clearAll}
                  >
                    Clear all filters
                  </Button>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Category chips */}
      {categoryCounts.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {categoryCounts.map(({ group, count }) => {
            const theme = getCategoryTheme(group)
            const Icon = theme.icon
            const isActive = filters.categories.includes(group)

            return (
              <button
                key={group}
                type="button"
                onClick={() => toggleCategory(group)}
                aria-pressed={isActive}
                className={cn(
                  "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                  isActive
                    ? cn("border-transparent", theme.pillClass)
                    : "border-border bg-background text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <Icon className="h-3 w-3" aria-hidden />
                {getCategoryLabel(group)}
                <span
                  className={cn(
                    "tabular-nums",
                    isActive ? "opacity-70" : "opacity-60"
                  )}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* Result count + clear all */}
      {active && (
        <div className="ml-0.5 flex items-center justify-between">
          <p
            className="text-xs text-muted-foreground"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {filteredCount === 0
              ? "No resources match your filters."
              : `Showing ${filteredCount} of ${resources.length} resources.`}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="h-auto gap-1 px-2 py-1 text-xs text-muted-foreground hover:bg-transparent hover:text-foreground hover:underline"
          >
            <XIcon className="h-3 w-3" />
            Clear all
          </Button>
        </div>
      )}
    </div>
  )
}
