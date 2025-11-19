-- Migration: Add country_code column to user_profile
SET @column_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'user_profile'
    AND COLUMN_NAME = 'country_code'
);

SET @sql := IF(
  @column_exists = 0,
  'ALTER TABLE `user_profile` ADD COLUMN `country_code` VARCHAR(5) NULL DEFAULT NULL AFTER `user_phone_nbr`;',
  'SELECT "country_code column already exists" AS message;'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;