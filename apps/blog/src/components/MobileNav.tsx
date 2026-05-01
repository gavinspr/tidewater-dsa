import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@tidewater-dsa/ui/components/sheet"
import { Button } from "@tidewater-dsa/ui/components/button"
import { MenuIcon } from "lucide-react"
import type { ValidNavLink } from "@/types"

interface MobileNavProps {
  navLinks: ValidNavLink[]
}

export const MobileNav = ({ navLinks = [] }: MobileNavProps) => {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger>
        <Button
          variant="ghost"
          size="icon"
          className="cursor-pointer lg:hidden"
        >
          <MenuIcon className="size-6 text-foreground" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-[85vw] bg-background p-6 pt-16 shadow-2xl sm:w-87.5"
      >
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

        <nav className="flex flex-col gap-6">
          {navLinks.map((link) => (
            <a
              key={link.slug}
              href={`/${link.slug}`}
              className="text-xl font-bold tracking-tight transition-colors hover:text-primary"
              onClick={() => setOpen(false)}
            >
              {link.title}
            </a>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
