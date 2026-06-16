UPDATE user_markers
SET description = CASE code
  WHEN 'en' THEN 'English'
  WHEN 'ru' THEN 'Русский'
  WHEN 'fr' THEN 'Français'
  WHEN 'es' THEN 'Español'
  WHEN 'zh' THEN '中文'
  WHEN 'ar' THEN 'العربية'
  ELSE description
END
WHERE description IS NULL
  AND code IN ('en', 'ru', 'fr', 'es', 'zh', 'ar');
