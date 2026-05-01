import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@tidewater-dsa/ui/components/accordion"
import { cn } from "@tidewater-dsa/ui/lib/utils"
import { ResourceCard } from "./ResourceCard"
import {
  getCategoryLabel,
  getCategoryTheme,
} from "@/lib/resource-category-config"
import type { Resource } from "@/types"

export interface ResourceCategoryGroup {
  group: string
  items: Resource[]
}

interface ResourceCategoryAccordionProps {
  groups: ResourceCategoryGroup[]
  openValues: string[]
  onOpenChange: (next: string[]) => void
  onOpenResource: (resource: Resource) => void
}

export const categorySlug = (group: string): string =>
  `cat-${group.toLowerCase().replace(/[^a-z0-9]/g, "-")}`

export const ResourceCategoryAccordion = ({
  groups,
  openValues,
  onOpenChange,
  onOpenResource,
}: ResourceCategoryAccordionProps) => (
  <Accordion
    multiple
    value={openValues}
    onValueChange={onOpenChange}
    className="divide-y divide-border rounded-lg"
  >
    {groups.map(({ group, items }) => {
      const theme = getCategoryTheme(group)
      const Icon = theme.icon
      const slug = categorySlug(group)
      return (
        <AccordionItem
          key={slug}
          value={slug}
          id={slug}
          className="scroll-mt-4"
        >
          <AccordionTrigger className="group gap-3 py-4 hover:no-underline items-center">
            <span
              aria-hidden
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white shadow-sm transition-transform group-hover:scale-105",
                theme.accentClass
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            <span className="flex flex-1 items-baseline gap-2 text-left">
              <span className="text-base font-bold tracking-tight">
                {getCategoryLabel(group)}
              </span>
              <span
                className={cn(
                  "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold tabular-nums",
                  theme.pillClass
                )}
              >
                {items.length}
              </span>
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {items.map((r) => (
                <ResourceCard key={r.id} resource={r} onOpen={onOpenResource} />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      )
    })}
  </Accordion>
)
