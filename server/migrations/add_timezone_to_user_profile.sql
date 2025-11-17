-- Migration: Add timezone column to user_profile
SET @column_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'user_profile'
    AND COLUMN_NAME = 'timezone'
);

SET @sql := IF(
  @column_exists = 0,
  'ALTER TABLE `user_profile` ADD COLUMN `timezone` VARCHAR(64) NULL DEFAULT NULL AFTER `country_code`;',
  'SELECT "timezone column already exists" AS message;'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

