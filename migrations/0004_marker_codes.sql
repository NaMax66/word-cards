ALTER TABLE user_markers RENAME COLUMN title TO code;
ALTER TABLE user_markers ADD COLUMN description TEXT;

UPDATE user_markers
SET
  description = CASE code
    WHEN 'English' THEN 'English'
    WHEN 'Русский' THEN 'Русский'
    WHEN 'Français' THEN 'Français'
    WHEN 'Español' THEN 'Español'
    WHEN '中文' THEN '中文'
    WHEN 'العربية' THEN 'العربية'
    ELSE NULL
  END,
  code = CASE code
    WHEN 'English' THEN 'en'
    WHEN 'Русский' THEN 'ru'
    WHEN 'Français' THEN 'fr'
    WHEN 'Español' THEN 'es'
    WHEN '中文' THEN 'zh'
    WHEN 'العربية' THEN 'ar'
    ELSE code
  END;
