import {
  PrinterIcon,
  DownloadIcon,
  Grid3x3Icon,
  MapIcon,
  ChevronUpIcon,
  FileSpreadsheetIcon,
} from "lucide-react"
import { Button } from "@tidewater-dsa/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@tidewater-dsa/ui/components/dropdown-menu"
import { cn } from "@tidewater-dsa/ui/lib/utils"
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@tidewater-dsa/ui/components/motion-tabs"

export type ResourceView = "grid" | "map"

interface ResourceToolbarProps {
  view: ResourceView
  onViewChange: (next: ResourceView) => void
  allExpanded: boolean
  onToggleExpandAll: () => void
  /** Only relevant in grid view + when there's more than one category. */
  canToggleExpand: boolean
  onPrint: () => void
  onDownloadCsv: () => void
}

export const ResourceToolbar = ({
  view,
  onViewChange,
  allExpanded,
  onToggleExpandAll,
  canToggleExpand,
  onPrint,
  onDownloadCsv,
}: ResourceToolbarProps) => (
  <div className="flex flex-wrap items-center justify-between gap-3">
    <Tabs
      value={view}
      onValueChange={(val) => onViewChange(val as ResourceView)}
    >
      <TabsList>
        <TabsTrigger value="grid" className="gap-1.5">
          <Grid3x3Icon className="h-4 w-4" />
          Directory
        </TabsTrigger>
        <TabsTrigger value="map" className="gap-1.5">
          <MapIcon className="h-4 w-4" />
          Map
        </TabsTrigger>
      </TabsList>
    </Tabs>

    <div className="flex w-full flex-wrap items-center justify-between gap-2 sm:w-auto">
      {canToggleExpand && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleExpandAll}
          className="gap-1.5 pt-1 text-xs"
        >
          <ChevronUpIcon
            className={cn(
              "h-3.5 w-3.5 transition-transform",
              allExpanded && "rotate-180"
            )}
          />
          {allExpanded ? "Collapse all" : "Expand all"}
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant="outline" size="sm" className="gap-1.5">
            <DownloadIcon className="h-4 w-4" />
            Download
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onPrint}>
            <PrinterIcon className="mr-2 h-4 w-4" /> Print / Save as PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDownloadCsv}>
            <FileSpreadsheetIcon className="mr-2 h-4 w-4" /> Download CSV
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>
)
