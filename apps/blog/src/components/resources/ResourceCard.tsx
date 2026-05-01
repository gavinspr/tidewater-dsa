import { MapPinIcon, PhoneIcon, CheckCircle2Icon } from "lucide-react"
import { Card, CardContent } from "@tidewater-dsa/ui/components/card"
import { Badge } from "@tidewater-dsa/ui/components/badge"
import { cn } from "@tidewater-dsa/ui/lib/utils"
import {
  getCategoryLabel,
  getCategoryTheme,
} from "@/lib/resource-category-config"
import { formatVerifiedDate, isVerificationFresh } from "@/lib/format"
import type { Resource } from "@/types"

interface ResourceCardProps {
  resource: Resource
  onOpen: (resource: Resource) => void
}

export const ResourceCard = ({ resource, onOpen }: ResourceCardProps) => {
  const primaryGroup = resource.categoryGroups[0]
  const primaryTheme = primaryGroup ? getCategoryTheme(primaryGroup) : null
  const displayLocation = [resource.city, resource.state]
    .filter(Boolean)
    .join(", ")

  return (
    <Card
      className={cn(
        "group relative flex h-full cursor-pointer flex-col overflow-hidden",
        "border-border/70 transition-all duration-150",
        "hover:-translate-y-0.5 hover:border-border hover:shadow-md",
        "focus-within:border-primary focus-within:shadow-md"
      )}
      onClick={() => onOpen(resource)}
    >
      <div
        aria-hidden
        className={cn("h-1 w-full", primaryTheme?.accentClass ?? "bg-primary")}
      />
      <CardContent className="flex flex-1 flex-col gap-2.5 p-4">
        <div className="flex flex-wrap items-center gap-1">
          {resource.categoryGroups.slice(0, 2).map((g) => {
            const theme = getCategoryTheme(g)
            const Icon = theme.icon
            return (
              <Badge
                key={g}
                variant="secondary"
                className={cn("gap-1 text-[11px]", theme.pillClass)}
              >
                <Icon className="h-3 w-3" />
                {getCategoryLabel(g)}
              </Badge>
            )
          })}
          {resource.categoryGroups.length > 2 && (
            <span className="text-[11px] text-muted-foreground">
              +{resource.categoryGroups.length - 2}
            </span>
          )}
          {resource.isFree && (
            <Badge
              variant="secondary"
              className="ml-auto bg-emerald-50 text-[11px] text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
            >
              Free
            </Badge>
          )}
        </div>

        <div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onOpen(resource)
            }}
            className="text-left text-[15px] leading-tight font-bold tracking-tight text-foreground transition-colors group-hover:text-primary focus:outline-none"
          >
            {resource.name}
          </button>
          {resource.organization && resource.organization !== resource.name && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {resource.organization}
            </p>
          )}
        </div>

        {resource.description && (
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {resource.description}
          </p>
        )}

        <div className="mt-auto space-y-1 pt-1.5 text-xs text-muted-foreground">
          {displayLocation && (
            <div className="flex items-center gap-1.5">
              <MapPinIcon className="h-3 w-3 shrink-0" />
              <span className="truncate">{displayLocation}</span>
            </div>
          )}
          {resource.phone && (
            <div className="flex items-center gap-1.5">
              <PhoneIcon className="h-3 w-3 shrink-0" />
              <span className="truncate">{resource.phone}</span>
            </div>
          )}
        </div>

        {resource.lastVerifiedISO &&
          isVerificationFresh(resource.lastVerifiedISO) && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <CheckCircle2Icon className="h-2.5 w-2.5 text-emerald-600" />
              <span>
                Verified{" "}
                <time dateTime={resource.lastVerifiedISO}>
                  {formatVerifiedDate(resource.lastVerifiedISO)}
                </time>
              </span>
            </div>
          )}
      </CardContent>
    </Card>
  )
}
