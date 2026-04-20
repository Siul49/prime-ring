-- PrimeRing schema v1
-- Phase 1: SQLite migration (Firebase removal + JSON → SQLite)
-- Phase 2 fields (google_event_id, etag, sync_state, last_synced_at) are defined
-- now so that Phase 2 sync logic adds behavior only, not schema changes.

CREATE TABLE IF NOT EXISTS schema_meta (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS events (
  id                    TEXT PRIMARY KEY,
  title                 TEXT NOT NULL,
  description           TEXT,
  start_date            TEXT NOT NULL,
  end_date              TEXT NOT NULL,
  all_day               INTEGER NOT NULL DEFAULT 0,
  category_id           TEXT,
  tags                  TEXT NOT NULL DEFAULT '[]',
  color                 TEXT,
  priority              TEXT NOT NULL DEFAULT 'medium',
  recurrence_rrule      TEXT,
  recurrence_exceptions TEXT,
  metadata              TEXT,
  google_event_id       TEXT UNIQUE,
  etag                  TEXT,
  sync_state            TEXT NOT NULL DEFAULT 'local',
  last_synced_at        TEXT,
  created_at            TEXT NOT NULL,
  updated_at            TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_sync_state ON events(sync_state);

CREATE TABLE IF NOT EXISTS diaries (
  id            TEXT PRIMARY KEY,
  date          TEXT NOT NULL UNIQUE,
  title         TEXT NOT NULL,
  content       TEXT NOT NULL,
  mood          TEXT NOT NULL,
  template_type TEXT,
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS categories (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  color      TEXT NOT NULL,
  icon       TEXT,
  order_idx  INTEGER NOT NULL DEFAULT 0
);
