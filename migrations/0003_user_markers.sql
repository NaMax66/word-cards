CREATE TABLE IF NOT EXISTS user_markers (
  id INTEGER PRIMARY KEY,
  marker_uid TEXT NOT NULL UNIQUE,
  user_uid TEXT NOT NULL,
  title TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_uid) REFERENCES users(user_uid) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_markers_user_order
  ON user_markers(user_uid, sort_order, id);

ALTER TABLE pairs ADD COLUMN origin_marker_uid TEXT
  REFERENCES user_markers(marker_uid);

ALTER TABLE pairs ADD COLUMN translation_marker_uid TEXT
  REFERENCES user_markers(marker_uid);

CREATE INDEX IF NOT EXISTS idx_pairs_origin_marker_uid
  ON pairs(user_uid, origin_marker_uid);

CREATE INDEX IF NOT EXISTS idx_pairs_translation_marker_uid
  ON pairs(user_uid, translation_marker_uid);
