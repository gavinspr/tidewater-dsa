import { defineQuery } from "groq"

export const SETTINGS_QUERY = defineQuery(`*[_type == "siteSettings"][0] {
  siteTitle,
  logo,
  newsletterUrl,
  "navLinks": mainNav[]->{ title, "slug": slug.current },
  socialLinks,
  heroImage
}`)
