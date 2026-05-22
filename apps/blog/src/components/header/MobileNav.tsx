import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@tidewater-dsa/ui/components/sheet"
import { Button } from "@tidewater-dsa/ui/components/button"
import { HeartIcon, MenuIcon } from "lucide-react"
import { cn } from "@tidewater-dsa/ui/lib/utils"
import type { Settings, ValidNavLink } from "@/types"

interface MobileNavProps {
  navLinks: ValidNavLink[]
  callToActionText: Settings["callToActionText"]
  callToActionLink: Settings["callToActionLink"]
}

export const MobileNav = ({
  navLinks = [],
  callToActionText,
  callToActionLink,
}: MobileNavProps) => {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="cursor-pointer rounded-sm border border-border lg:hidden"
          >
            <MenuIcon className="size-5 text-foreground" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        }
      />

      <SheetContent
        side="right"
        className="w-[88vw] bg-background p-6 pt-20 shadow-2xl sm:w-105"
      >
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

        <nav className="flex flex-col">
          {navLinks.map((link, idx) => (
            <a
              key={link.slug}
              href={`/${link.slug}`}
              className={cn(
                "font-heading text-2xl leading-none font-extrabold tracking-tight uppercase",
                "border-b border-border py-4 transition-colors hover:text-primary",
                idx === 0 && "border-t border-border"
              )}
              onClick={() => setOpen(false)}
            >
              {link.title}
            </a>
          ))}

          {callToActionLink && callToActionText && (
            <Button
              size="lg"
              className="mt-6 w-full cursor-pointer gap-1.5 rounded-md text-base font-bold text-foreground hover:bg-primary-deep"
              nativeButton={false}
              render={
                <a
                  href={callToActionLink}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setOpen(false)}
                />
              }
            >
              <HeartIcon className="size-4" fill="currentColor" />
              {callToActionText}
            </Button>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
