import * as React from "react"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@tidewater-dsa/ui/lib/utils"

const cardVariants = cva(
  "group/card flex flex-col gap-6 overflow-hidden bg-card py-6 text-sm text-card-foreground has-[>img:first-child]:pt-0 data-[size=sm]:gap-4 data-[size=sm]:py-4",
  {
    variants: {
      variant: {
        default:
          "rounded-4xl shadow-md ring-1 ring-foreground/5 dark:ring-foreground/10 *:[img:first-child]:rounded-t-4xl *:[img:last-child]:rounded-b-4xl",
        editorial:
          "rounded-none border-2 border-foreground shadow-none transition-colors data-[interactive=true]:cursor-pointer data-[interactive=true]:hover:bg-foreground data-[interactive=true]:hover:text-background data-[interactive=true]:focus-visible:bg-foreground data-[interactive=true]:focus-visible:text-background data-[interactive=true]:focus-visible:outline-none",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

type CardOwnProps = {
  size?: "default" | "sm"
} & VariantProps<typeof cardVariants>

function Card({
  className,
  size = "default",
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"div"> & CardOwnProps) {
  const interactive = Boolean(render) || Boolean(props.onClick)

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        "data-slot": "card",
        "data-size": size,
        "data-interactive": interactive ? "true" : "false",
        className: cn(cardVariants({ variant }), className),
      } as React.HTMLAttributes<HTMLDivElement>,
      props
    ),
    render,
    state: {
      slot: "card",
      variant,
      size,
    },
  })
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1.5 rounded-t-4xl px-6 group-data-[size=sm]/card:px-4 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-6 group-data-[size=sm]/card:[.border-b]:pb-4",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("font-heading text-base font-medium", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6 group-data-[size=sm]/card:px-4", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center rounded-b-4xl px-6 group-data-[size=sm]/card:px-4 [.border-t]:pt-6 group-data-[size=sm]/card:[.border-t]:pt-4",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  cardVariants,
}
