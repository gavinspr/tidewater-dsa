import { defineQuery } from "groq"

export const SITE_SETTINGS_QUERY = defineQuery(`*[_type == "siteSettings"][0] {
  siteTitle,
  logo,
  "navLinks": mainNav[]{
    _key,
    "title": @->title,
    "slug": select(
      @->_type == "eventsPage" => "events",
      @->slug.current
    )
  },
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
