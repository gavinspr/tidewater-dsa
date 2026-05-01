import { useState, type ReactNode } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@tidewater-dsa/ui/components/dialog"
import { Button, buttonVariants } from "@tidewater-dsa/ui/components/button"
import { Badge } from "@tidewater-dsa/ui/components/badge"
import { Separator } from "@tidewater-dsa/ui/components/separator"
import { ScrollArea } from "@tidewater-dsa/ui/components/scroll-area"
import {
  MapPinIcon,
  PhoneIcon,
  MailIcon,
  GlobeIcon,
  ClockIcon,
  LanguagesIcon,
  FileTextIcon,
  CalendarIcon,
  CheckCircle2Icon,
  CopyIcon,
  CheckIcon,
  ExternalLinkIcon,
  DollarSignIcon,
  UsersIcon,
  Share2Icon,
  StickyNoteIcon,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@tidewater-dsa/ui/lib/utils"
import {
  getCategoryLabel,
  getCategoryTheme,
} from "@/lib/resource-category-config"
import { getSocialIcon } from "@/lib/social"
import { formatVerifiedDateLong } from "@/lib/format"
import { buildGoogleMapsUrl } from "@/lib/google-maps"
import type { Resource } from "@/types"

interface CopyButtonProps {
  value: string
  label: string
}

const CopyButton = ({ value, label }: CopyButtonProps) => {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (err) {
      console.warn(`Copy failed for ${label}:`, err)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      aria-label={`Copy ${label}`}
      className="h-7 gap-1 px-2 text-xs"
    >
      {copied ? (
        <>
          <CheckIcon className="h-3 w-3" /> Copied
        </>
      ) : (
        <>
          <CopyIcon className="h-3 w-3" /> Copy
        </>
      )}
    </Button>
  )
}

interface DetailRowProps {
  icon: LucideIcon
  label: string
  children: ReactNode
}

const DetailRow = ({ icon: Icon, label, children }: DetailRowProps) => (
  <div className="flex gap-3">
    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
      <Icon className="h-4 w-4" />
    </div>
    <div className="min-w-0 flex-1">
      <div className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </div>
      <div className="wrap-break-words mt-0.5 text-sm text-foreground">
        {children}
      </div>
    </div>
  </div>
)

interface ResourceDialogProps {
  resource: Resource | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const ResourceDialog = ({
  resource,
  open,
  onOpenChange,
}: ResourceDialogProps) => {
  if (!resource) return null

  const mapsUrl = resource.fullAddress
    ? buildGoogleMapsUrl(resource.fullAddress)
    : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] sm:w-full sm:max-w-2xl">
        <ScrollArea className="-mr-5 max-h-[80vh]">
          <div className="mt-2 space-y-4 pr-6">
            <DialogHeader className="space-y-3 text-left">
              <div className="flex flex-wrap gap-1.5">
                {resource.categoryGroups.map((g) => {
                  const theme = getCategoryTheme(g)
                  const Icon = theme.icon

                  return (
                    <Badge
                      key={g}
                      variant="secondary"
                      className={cn("gap-1", theme.pillClass)}
                    >
                      <Icon className="h-3 w-3" />
                      {getCategoryLabel(g)}
                    </Badge>
                  )
                })}
                {resource.isFree && (
                  <Badge
                    variant="secondary"
                    className="bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
                  >
                    Free
                  </Badge>
                )}
              </div>
              <DialogTitle className="text-2xl leading-tight tracking-tight">
                {resource.name}
              </DialogTitle>
              {resource.organization &&
                resource.organization !== resource.name && (
                  <DialogDescription className="text-base">
                    Provided by {resource.organization}
                  </DialogDescription>
                )}
            </DialogHeader>

            {resource.description && (
              <p className="text-base leading-relaxed text-foreground">
                {resource.description}
              </p>
            )}

            {resource.categories.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {resource.categories.map((c) => (
                  <span
                    key={c.full}
                    className="inline-flex items-center rounded-full border border-border bg-background px-2.5 py-0.5 text-xs text-muted-foreground"
                  >
                    {c.full}
                  </span>
                ))}
              </div>
            )}

            <Separator />

            <div className="space-y-4">
              {resource.fullAddress && (
                <DetailRow icon={MapPinIcon} label="Address">
                  <div className="space-y-1.5">
                    <p>{resource.fullAddress}</p>
                    <div className="-ml-2 flex flex-wrap items-center gap-1">
                      <CopyButton
                        value={resource.fullAddress.replace(/ · /g, ", ")}
                        label="address"
                      />
                      {mapsUrl && (
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            buttonVariants({ variant: "ghost", size: "sm" }),
                            "h-7 gap-1 px-2 text-xs"
                          )}
                        >
                          <ExternalLinkIcon className="h-3 w-3" /> Open in Maps
                        </a>
                      )}
                    </div>
                  </div>
                </DetailRow>
              )}

              {resource.phone && (
                <DetailRow icon={PhoneIcon} label="Phone">
                  <div className="space-y-1.5">
                    {resource.phoneLink ? (
                      <a
                        href={`tel:${resource.phoneLink}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {resource.phone}
                      </a>
                    ) : (
                      <span>{resource.phone}</span>
                    )}
                    <div className="-ml-2 flex">
                      <CopyButton value={resource.phone} label="phone" />
                    </div>
                  </div>
                </DetailRow>
              )}

              {resource.email && (
                <DetailRow icon={MailIcon} label="Email">
                  <div className="space-y-1.5">
                    <a
                      href={`mailto:${resource.email}`}
                      className="font-medium break-all text-primary hover:underline"
                    >
                      {resource.email}
                    </a>
                    <div className="-ml-2 flex">
                      <CopyButton value={resource.email} label="email" />
                    </div>
                  </div>
                </DetailRow>
              )}

              {resource.websiteLink && (
                <DetailRow icon={GlobeIcon} label="Website">
                  <a
                    href={resource.websiteLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-medium break-all text-primary hover:underline"
                  >
                    {resource.website.replace(/^https?:\/\//, "")}
                    <ExternalLinkIcon className="h-3 w-3" />
                  </a>
                </DetailRow>
              )}

              {resource.socials.length > 0 && (
                <DetailRow icon={Share2Icon} label="Social">
                  <ul className="-ml-2 flex flex-wrap items-center gap-1">
                    {resource.socials.map((s, i) => {
                      const {
                        icon: Icon,
                        color,
                        label,
                      } = getSocialIcon(s.platform)
                      const title = s.handle
                        ? `${label}: ${s.handle}`
                        : `${label}${s.url ? `: ${s.url}` : ""}`
                      const iconEl = (
                        <Icon aria-hidden className={cn("h-5 w-5", color)} />
                      )

                      return (
                        <li key={`${s.platform}-${i}`}>
                          {s.url ? (
                            <a
                              href={s.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center rounded-md p-1.5 transition-opacity hover:opacity-70"
                              aria-label={title}
                              title={title}
                            >
                              {iconEl}
                            </a>
                          ) : (
                            <span
                              className="inline-flex items-center p-1.5"
                              aria-label={title}
                              title={title}
                            >
                              {iconEl}
                            </span>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </DetailRow>
              )}

              {resource.hours && (
                <DetailRow icon={ClockIcon} label="Hours & How to Access">
                  <span className="whitespace-pre-line">{resource.hours}</span>
                </DetailRow>
              )}

              {resource.nextEvent && (
                <DetailRow icon={CalendarIcon} label="Next Event">
                  {resource.nextEvent}
                </DetailRow>
              )}

              {resource.costStructure && (
                <DetailRow icon={DollarSignIcon} label="Cost">
                  {resource.costStructure}
                </DetailRow>
              )}

              {resource.eligibilityDetails && (
                <DetailRow icon={UsersIcon} label="Eligibility">
                  {resource.eligibilityDetails}
                </DetailRow>
              )}

              {resource.languages.length > 0 && (
                <DetailRow icon={LanguagesIcon} label="Languages">
                  <div className="flex flex-wrap gap-1.5">
                    {resource.languages.map((l) => (
                      <Badge key={l} variant="outline" className="font-normal">
                        {l}
                      </Badge>
                    ))}
                  </div>
                </DetailRow>
              )}

              {resource.requiredDocuments && (
                <DetailRow icon={FileTextIcon} label="Required Documents">
                  {resource.requiredDocuments}
                </DetailRow>
              )}

              {resource.additionalNotes && (
                <DetailRow icon={StickyNoteIcon} label="Notes">
                  <span className="whitespace-pre-line">
                    {resource.additionalNotes}
                  </span>
                </DetailRow>
              )}

              {resource.lastVerifiedISO && (
                <DetailRow icon={CheckCircle2Icon} label="Last Verified">
                  <time dateTime={resource.lastVerifiedISO}>
                    {formatVerifiedDateLong(resource.lastVerifiedISO)}
                  </time>
                </DetailRow>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
