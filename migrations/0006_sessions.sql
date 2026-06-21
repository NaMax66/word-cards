CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY,
  session_hash TEXT NOT NULL UNIQUE,
  user_uid TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  revoked_at INTEGER,
  created_at INTEGER NOT NULL,
  last_seen_at INTEGER NOT NULL,
  FOREIGN KEY (user_uid) REFERENCES users(user_uid) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_hash
  ON sessions(session_hash);

CREATE INDEX IF NOT EXISTS idx_sessions_user_uid
  ON sessions(user_uid);
