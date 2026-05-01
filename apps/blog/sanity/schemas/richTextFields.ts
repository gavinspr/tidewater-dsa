import { defineField } from "sanity"
import type { FieldDefinition, Rule } from "sanity"

interface RichTextBodyOptions {
  name?: string
  title?: string
  description?: string
  group?: string
  allowImages?: boolean
}

/**
 * Shared rich-text body field factory for page-like documents.
 *
 * Consumers can override name, title, description, group, and whether
 * inline images are allowed. The portable-text config stays centralized
 * here so adding a new mark or block style updates every page at once.
 */
export const defineRichTextBody = ({
  name = "body",
  title = "Page Content",
  description,
  group,
  allowImages = true,
}: RichTextBodyOptions = {}): FieldDefinition<"array"> => {
  const blockType = {
    type: "block" as const,
    styles: [
      { title: "Normal", value: "normal" },
      { title: "H2", value: "h2" },
      { title: "H3", value: "h3" },
      { title: "Quote", value: "blockquote" },
    ],
    marks: {
      decorators: [
        { title: "Bold", value: "strong" },
        { title: "Italic", value: "em" },
      ],
      annotations: [
        {
          name: "link",
          type: "object",
          title: "Link",
          fields: [
            {
              name: "href",
              type: "url",
              title: "URL",
              validation: (rule: Rule) =>
                rule.uri({
                  allowRelative: true,
                  scheme: ["http", "https", "mailto"],
                }),
            },
            {
              name: "blank",
              type: "boolean",
              title: "Open in new tab",
              initialValue: true,
            },
          ],
        },
      ],
    },
  }

  const imageType = {
    type: "image" as const,
    options: { hotspot: true },
    fields: [
      {
        name: "alt",
        type: "string",
        title: "Alt text",
        description: "Describe the image for accessibility",
        validation: (rule: Rule) => rule.required(),
      },
      {
        name: "caption",
        type: "string",
        title: "Caption",
        description: "Optional text displayed below the image",
      },
      {
        name: "displaySize",
        title: "Display Size",
        type: "string",
        options: {
          list: [
            { title: "Small", value: "sm" },
            { title: "Medium", value: "md" },
            { title: "Large", value: "lg" },
            { title: "Full Width", value: "full" },
          ],
          layout: "radio",
        },
        initialValue: "md",
      },
    ],
  }

  return defineField({
    name,
    title,
    type: "array",
    description,
    ...(group ? { group } : {}),
    of: allowImages ? [blockType, imageType] : [blockType],
  })
}
