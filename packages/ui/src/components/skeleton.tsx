import { cn } from "@tidewater-dsa/ui/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-sm bg-muted-foreground", className)}
      {...props}
    />
  )
}

export { Skeleton }
