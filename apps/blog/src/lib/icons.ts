import {
  Instagram,
  Facebook,
  Twitter,
  Bluesky,
  Linktree,
} from "@tidewater-dsa/ui/components/icons"
import { Link as LinkIcon } from "lucide-react"
import type { Settings } from "@/lib/types"

export type IconVariant = NonNullable<Settings["socialIconStyle"]>

export const getSocialIcon = (platform: string) => {
  const name = platform.toLowerCase()

  if (name.includes("instagram"))
    return { icon: Instagram, color: "text-pink-600", bg: "bg-pink-600" }

  if (name.includes("facebook"))
    return { icon: Facebook, color: "text-blue-600", bg: "bg-blue-600" }

  if (name.includes("bluesky") || name.includes("bsky"))
    return { icon: Bluesky, color: "text-blue-500", bg: "bg-blue-500" }

  if (name.includes("x") || name.includes("twitter"))
    return { icon: Twitter, color: "text-foreground", bg: "bg-foreground" }

  if (name.includes("linktree"))
    return { icon: Linktree, color: "text-green-500", bg: "bg-green-500" }

  return {
    icon: LinkIcon,
    color: "text-muted-foreground",
    bg: "bg-muted-foreground",
  }
}
