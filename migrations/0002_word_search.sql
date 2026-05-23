ALTER TABLE pairs ADD COLUMN origin_search TEXT NOT NULL DEFAULT '';
ALTER TABLE pairs ADD COLUMN translation_search TEXT NOT NULL DEFAULT '';

UPDATE pairs
SET
  origin_search = lower(trim(origin)),
  translation_search = lower(trim(translation))
WHERE origin_search = '' AND translation_search = '';

CREATE INDEX IF NOT EXISTS idx_pairs_user_id ON pairs(user_uid, id);
