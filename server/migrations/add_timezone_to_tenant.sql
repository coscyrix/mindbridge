-- Migration: Add timezone column to tenant
SET @column_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'tenant'
    AND COLUMN_NAME = 'timezone'
);

SET @sql := IF(
  @column_exists = 0,
  'ALTER TABLE `tenant` ADD COLUMN `timezone` VARCHAR(64) NULL DEFAULT NULL AFTER `tax_percent`;',
  'SELECT "timezone column already exists" AS message;'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

