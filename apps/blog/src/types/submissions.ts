/**
 * TypeScript shapes mirroring the D1 schema in
 * apps/blog/migrations/0001_init_submissions.sql. Keep in sync with migrations.
 */

import type { PortableTextBlock } from "@portabletext/types"

export type SubmissionStatus =
  | "pending"
  | "changes_requested"
  | "approved"
  | "rejected"

/** Status values valid for a row in the active `submissions` table. */
export type ActiveSubmissionStatus = Extract<
  SubmissionStatus,
  "pending" | "changes_requested"
>

/** Row in the active `submissions` table. */
export interface Submission {
  id: string
  discordUserId: string
  discordUsername: string
  email: string | null
  status: ActiveSubmissionStatus
  title: string
  /** Portable Text, stored as a JSON string in D1. */
  body: PortableTextBlock[]
  category: string | null
  revision: number
  publishedPostId: string | null
  createdAt: number
  updatedAt: number
}

export interface SubmissionImage {
  id: string
  submissionId: string
  r2Key: string
  mime: string
  bytes: number
  width: number | null
  height: number | null
  createdAt: number
}

export interface SubmissionComment {
  id: string
  submissionId: string
  authorType: "admin" | "user"
  authorLabel: string | null
  body: string
  createdAt: number
}

/** Slim, permanent record kept after a submission leaves the active table. */
export interface SubmissionArchiveEntry {
  id: string
  discordUserId: string
  title: string
  status: Extract<SubmissionStatus, "approved" | "rejected">
  publishedPostId: string | null
  decidedAt: number
}
