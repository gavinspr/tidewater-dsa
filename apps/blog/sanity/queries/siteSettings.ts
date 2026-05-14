import { defineQuery } from "groq"

export const SITE_SETTINGS_QUERY = defineQuery(`*[_type == "siteSettings"][0] {
  siteTitle,
  siteShortName,
  logo,
  logoTagline,
  "navLinks": mainNav[]{
    _key,
    "title": @->title,
    "slug": select(
      @->_type == "eventsPage" => "events",
      @->slug.current
    )
  },
  callToActionText,
  callToActionLink,
  showRibbon,
  ribbonText,
  nextMeetingLabel,
  nextMeetingMatch,
  nextMeetingTextOverride,
  nextMeetingLinkOverride,
  bannerWords,
  signupLink,
  signupEyebrow,
  signupHeadline,
  signupDescription,
  socialLinks,
  socialIconStyle,
  contactEmail,
  contactEmailSubject,
  footerTagline,
 footerColumns[]{
    _key,
    title,
    links[]{ _key, label, href }
  }
}`)
