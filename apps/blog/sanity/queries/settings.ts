import { defineQuery } from "groq"

export const SETTINGS_QUERY = defineQuery(`*[_type == "siteSettings"][0] {
  siteTitle,
  logo,
  "navLinks": mainNav[]{_key, ...@->{ title, "slug": slug.current } },
  socialLinks,
  socialIconStyle,
  callToActionText,
  callToActionLink,
  contactEmail,
  contactEmailSubject,
  signupLink,
  signupHeadline,
  signupDescription,
  signupImage
}`)
