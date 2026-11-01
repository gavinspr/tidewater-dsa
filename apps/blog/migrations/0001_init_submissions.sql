-- Content submission flow — initial schema
-- See docs/submission-flow.md §4 for the data model rationale.
-- Timestamps are epoch milliseconds (INTEGER). IDs are UUID strings.

PRAGMA foreign_keys = ON;

-- Active submissions only (pending / changes_requested). Approved & rejected rows
-- are moved to submission_archive and deleted from here.
CREATE TABLE submissions (
  id                 TEXT PRIMARY KEY,
  discord_user_id    TEXT NOT NULL,
  discord_username   TEXT NOT NULL,
  email              TEXT,
  status             TEXT NOT NULL DEFAULT 'pending'
                       CHECK (status IN ('pending', 'changes_requested')),
  title              TEXT NOT NULL,
  body_pt            TEXT NOT NULL,            -- Portable Text as JSON
  category           TEXT,
  revision           INTEGER NOT NULL DEFAULT 1,
  published_post_id  TEXT,                     -- set transiently during approve
  created_at         INTEGER NOT NULL,
  updated_at         INTEGER NOT NULL
);

CREATE INDEX idx_submissions_user   ON submissions (discord_user_id);
CREATE INDEX idx_submissions_status ON submissions (status);

-- One row per uploaded image. r2_key points into the private SUBMISSION_IMAGES bucket.
CREATE TABLE submission_images (
  id             TEXT PRIMARY KEY,
  submission_id  TEXT NOT NULL REFERENCES submissions (id) ON DELETE CASCADE,
  r2_key         TEXT NOT NULL,
  mime           TEXT NOT NULL,
  bytes          INTEGER NOT NULL,
  width          INTEGER,
  height         INTEGER,
  created_at     INTEGER NOT NULL
);

CREATE INDEX idx_submission_images_submission ON submission_images (submission_id);

-- The request-changes <-> resubmit conversation thread.
CREATE TABLE submission_comments (
  id             TEXT PRIMARY KEY,
  submission_id  TEXT NOT NULL REFERENCES submissions (id) ON DELETE CASCADE,
  author_type    TEXT NOT NULL CHECK (author_type IN ('admin', 'user')),
  author_label   TEXT,
  body           TEXT NOT NULL,
  created_at     INTEGER NOT NULL
);

CREATE INDEX idx_submission_comments_submission ON submission_comments (submission_id);

-- Slim, permanent record kept after a submission leaves the active table.
-- Powers "My submissions" history + audit without retaining body or images.
CREATE TABLE submission_archive (
  id                 TEXT PRIMARY KEY,
  discord_user_id    TEXT NOT NULL,
  title              TEXT NOT NULL,
  status             TEXT NOT NULL CHECK (status IN ('approved', 'rejected')),
  published_post_id  TEXT,
  decided_at         INTEGER NOT NULL
);

CREATE INDEX idx_submission_archive_user ON submission_archive (discord_user_id);
CREATE INDEX idx_submission_archive_status_decided
  ON submission_archive (status, decided_at);

-- Per-user, per-day submission counter. "day" is UTC YYYY-MM-DD.
-- Admin "clear limit" resets count to 0 (or deletes the row).
CREATE TABLE rate_limits (
  discord_user_id  TEXT NOT NULL,
  day              TEXT NOT NULL,
  count            INTEGER NOT NULL DEFAULT 0,
  updated_at       INTEGER NOT NULL,
  PRIMARY KEY (discord_user_id, day)
);
