-- Migration: Ensure v_user_profile exposes tenant timezone
SET @has_timezone_column := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'v_user_profile'
    AND COLUMN_NAME = 'tenant_timezone'
);

SET @sql := (
  SELECT CASE
    WHEN @has_timezone_column = 0 THEN
      CONCAT(
        'CREATE OR REPLACE VIEW `v_user_profile` AS ',
        'SELECT base_view.*, t.timezone AS tenant_timezone FROM (',
        VIEW_DEFINITION,
        ') AS base_view ',
        'LEFT JOIN `tenant` AS t ON base_view.tenant_id = t.tenant_id'
      )
    ELSE
      'SELECT "tenant_timezone already exists on v_user_profile" AS message;'
  END
  FROM INFORMATION_SCHEMA.VIEWS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'v_user_profile'
);

SET @sql := IFNULL(@sql, 'SELECT "View v_user_profile not found" AS message;');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

