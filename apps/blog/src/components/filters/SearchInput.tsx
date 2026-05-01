import { SearchIcon, XIcon } from "lucide-react"
import { Input } from "@tidewater-dsa/ui/components/input"
import { cn } from "@tidewater-dsa/ui/lib/utils"

interface SearchInputProps {
  value: string
  onChange: (next: string) => void
  placeholder?: string
  ariaLabel: string
  className?: string
}

export const SearchInput = ({
  value,
  onChange,
  placeholder,
  ariaLabel,
  className,
}: SearchInputProps) => (
  <div className={cn("relative min-w-0 flex-1", className)}>
    <SearchIcon
      aria-hidden
      className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
    />
    <Input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="pl-9"
      aria-label={ariaLabel}
    />
    {value && (
      <button
        type="button"
        onClick={() => onChange("")}
        aria-label="Clear search"
        className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <XIcon className="h-4 w-4" />
      </button>
    )}
  </div>
)
