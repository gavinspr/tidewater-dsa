# @tidewater-dsa/ui

Shared UI components for Tidewater DSA apps, built on
[shadcn/ui](https://ui.shadcn.com) and [Base UI](https://base-ui.com). This
package also exports the shared Tailwind theme and utility functions.

## Structure

```
packages/ui/
└── src/
    ├── components/        # shadcn/ui components (Button, Card, Sheet, etc.)
    ├── hooks/             # Shared React hooks
    ├── lib/               # Utilities (cn helper, etc.)
    └── styles/
        └── globals.css    # Tailwind theme tokens and base styles
```

## Importing from this package

Apps in the monorepo import components, utilities, and styles directly:

```ts
// Components
import { Button } from "@tidewater-dsa/ui/components/button"
import { Card, CardHeader, CardTitle } from "@tidewater-dsa/ui/components/card"

// Utilities
import { cn } from "@tidewater-dsa/ui/lib/utils"

// Global styles (import once at the top of your app's entry)
import "@tidewater-dsa/ui/globals.css"
```

The exports are defined in this package's `package.json` under the `exports`
field and point directly at the source files — there's no build step.

## Adding components

From the repo root, run shadcn's CLI pointed at this package:

```bash
npx shadcn@latest add dialog -c packages/ui
```

This reads `packages/ui/components.json` and writes the component into
`packages/ui/src/components/`. The component will automatically be available
to import from `@tidewater-dsa/ui/components/dialog` in any app.

To see all available components, run `npx shadcn@latest add` with no
arguments and pick from the list, or browse
[ui.shadcn.com](https://ui.shadcn.com/docs/components).

## Theme and styling

Theme tokens live in `src/styles/globals.css` as CSS custom properties. The
file defines both light and dark mode values, plus Tailwind's `@theme`
mapping. To change brand colors, fonts, or radius values, edit the `:root`
and `.dark` blocks.

Apps import this file once (typically in their main layout) to get both the
theme and Tailwind's base styles.

## Conventions

- **One component per file**, matching shadcn's structure
- **Use `cn()`** from `lib/utils.ts` for conditional class names
- **Use `data-slot`** attributes on component internals for targeted styling
  from consuming apps (see `card.tsx` for examples)
- **Keep components framework-agnostic** — they should work in any React app,
  not just Astro. Don't import from `astro:*` or Astro-specific modules