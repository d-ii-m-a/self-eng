-- Migration number: 0002 	 2026-07-03T00:00:00.000Z
CREATE TABLE IF NOT EXISTS english_mistakes (
    id          INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    original    TEXT NOT NULL,
    correction  TEXT NOT NULL,
    explanation TEXT NOT NULL,
    pattern     TEXT NOT NULL,
    subpattern  TEXT,
    context     TEXT
);
