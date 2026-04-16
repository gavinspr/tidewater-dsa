import { clean } from "./stega"

export const extractAnInfo = (
  url: string
): { type: string; slug: string } | null => {
  const cleaned = clean(url)
  const match = cleaned.match(/actionnetwork\.org\/(events|forms)\/([^/?#]+)/)

  if (!match) return null
  return { type: match[1] === "events" ? "event" : "form", slug: match[2] }
}

export const ensureStylesLoaded = () => {
  if (!document.querySelector("link[data-an-styles]")) {
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = "https://actionnetwork.org/css/style-embed-whitelabel-v3.css"
    link.setAttribute("data-an-styles", "true")
    document.head.appendChild(link)
  }
}
