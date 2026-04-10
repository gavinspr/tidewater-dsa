import {
  Instagram,
  Facebook,
  Twitter,
} from "@tidewater-dsa/ui/components/icons"
import { Link as LinkIcon } from "lucide-react"

export const getSocialIcon = (platform: string) => {
  const name = platform.toLowerCase()
  if (name.includes("instagram")) return Instagram
  if (name.includes("facebook")) return Facebook
  if (name.includes("x") || name.includes("twitter")) return Twitter
  return LinkIcon
}
