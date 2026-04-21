import { format } from "date-fns"
import { ChevronLeft, ChevronRight, CalendarDays, List } from "lucide-react"
import { Button } from "@tidewater-dsa/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@tidewater-dsa/ui/components/dropdown-menu"

export type ViewMode = "month" | "list"

interface CalendarHeaderProps {
  viewMonth: Date
  onToday: () => void
  onPrev: () => void
  onNext: () => void
  view: ViewMode
  onChangeView: (v: ViewMode) => void
}

export const CalendarHeader = ({
  viewMonth,
  onToday,
  onPrev,
  onNext,
  view,
  onChangeView,
}: CalendarHeaderProps) => (
  <div className="flex items-center justify-between gap-2">
    <div className="flex items-center gap-1">
      <Button variant="outline" size="sm" onClick={onToday}>
        Today
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onPrev}
        aria-label="Previous month"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onNext}
        aria-label="Next month"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      <h3 className="ml-2 text-xl font-semibold tabular-nums">
        {format(viewMonth, "MMMM yyyy")}
      </h3>
    </div>

    <DropdownMenu modal={false}>
      <DropdownMenuTrigger>
        <Button variant="outline" size="sm" className="gap-1.5">
          {view === "month" ? (
            <>
              <CalendarDays className="h-4 w-4" />
              Month
            </>
          ) : (
            <>
              <List className="h-4 w-4" />
              List
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onChangeView("month")}>
          <CalendarDays className="mr-2 h-4 w-4" />
          Month
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onChangeView("list")}>
          <List className="mr-2 h-4 w-4" />
          List
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
)
