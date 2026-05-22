CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  user_uid TEXT NOT NULL UNIQUE,
  name TEXT,
  given_name TEXT,
  email TEXT,
  picture TEXT
);

CREATE TABLE IF NOT EXISTS pairs (
  id INTEGER PRIMARY KEY,
  user_uid TEXT NOT NULL,
  pair_uid TEXT NOT NULL UNIQUE,
  origin TEXT NOT NULL,
  origin_lang TEXT NOT NULL,
  translation TEXT NOT NULL,
  translation_lang TEXT NOT NULL,
  FOREIGN KEY (user_uid) REFERENCES users(user_uid) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_pairs_user_uid ON pairs(user_uid);

CREATE TABLE IF NOT EXISTS user_settings (
  id INTEGER PRIMARY KEY,
  user_uid TEXT NOT NULL UNIQUE,
  settings TEXT NOT NULL,
  FOREIGN KEY (user_uid) REFERENCES users(user_uid) ON DELETE CASCADE
);
