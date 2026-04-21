import { useEffect, useMemo, useState, type ChangeEvent } from "react"
import { useClient, set, unset, type StringInputProps } from "sanity"
import { Select, Stack, Text } from "@sanity/ui"
import { SANITY_API_VERSION } from "@/lib/sanity-config"

interface TaxonomyEntry {
  label: string | null
  value: { current: string | null } | null
}

interface TaxonomyOption {
  label: string
  value: string
}

const TAXONOMY_QUERY = `
  *[_type == "eventTypes" && _id == "eventTypes"][0].types[]{
    label,
    value
  }
`

const getErrorMessage = (err: Error | string): string =>
  err instanceof Error ? err.message : err

export const EventTypeInput = ({
  value,
  onChange,
  readOnly,
  elementProps,
}: StringInputProps) => {
  const [types, setTypes] = useState<TaxonomyEntry[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const client = useClient({ apiVersion: SANITY_API_VERSION })

  useEffect(() => {
    let active = true

    client
      .fetch<TaxonomyEntry[] | null>(TAXONOMY_QUERY)
      .then((result) => {
        if (active) setTypes(result ?? [])
      })
      .catch((err: Error) => {
        if (active) setError(getErrorMessage(err))
      })

    return () => {
      active = false
    }
  }, [client])

  const options: TaxonomyOption[] = useMemo(() => {
    if (!types) return []

    const result: TaxonomyOption[] = []

    for (const t of types) {
      const label = t.label ?? ""
      const value = t.value?.current ?? ""
      if (label && value) result.push({ label, value })
    }

    return result
  }, [types])

  const isOrphan = Boolean(
    value && options.length > 0 && !options.some((o) => o.value === value)
  )

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const next = event.currentTarget.value
    onChange(next ? set(next) : unset())
  }

  if (error) {
    return (
      <Stack space={2}>
        <Text size={1} muted>
          Could not load event types: {error}
        </Text>
      </Stack>
    )
  }

  if (!types) {
    return (
      <Text size={1} muted>
        Loading event types…
      </Text>
    )
  }

  if (options.length === 0) {
    return (
      <Stack space={2}>
        <Text size={1} muted>
          No event types defined yet. Create entries in the{" "}
          <strong>Event Types</strong> document under Settings to enable this
          dropdown.
        </Text>
      </Stack>
    )
  }

  return (
    <Select
      {...elementProps}
      value={value ?? ""}
      onChange={handleChange}
      readOnly={readOnly}
    >
      <option value="">— None —</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}

      {isOrphan && value && (
        <option value={value}>{value} (not in taxonomy)</option>
      )}
    </Select>
  )
}
