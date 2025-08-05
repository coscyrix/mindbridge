-- Migration: Add tenant configuration table for homework upload settings (Safe Version)
-- Date: 2024-01-XX

-- Create tenant_configuration table
CREATE TABLE IF NOT EXISTS `tenant_configuration` (
  `config_id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL,
  `feature_name` varchar(100) NOT NULL,
  `feature_value` text,
  `is_enabled` tinyint(1) DEFAULT 1,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status_yn` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`config_id`),
  UNIQUE KEY `unique_tenant_feature` (`tenant_id`, `feature_name`),
  KEY `idx_tenant_id` (`tenant_id`),
  KEY `idx_feature_name` (`feature_name`),
  CONSTRAINT `fk_tenant_config_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenant` (`tenant_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default homework upload configuration for existing tenants
INSERT INTO `tenant_configuration` (`tenant_id`, `feature_name`, `feature_value`, `is_enabled`)
SELECT 
  t.tenant_id,
  'homework_upload_enabled',
  'true',
  1
FROM `tenant` t
WHERE t.status_yn = 1
ON DUPLICATE KEY UPDATE `updated_at` = CURRENT_TIMESTAMP;

-- Safe column addition for homework table
-- Check if homework_file_path column exists, if not add it
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = DATABASE() 
   AND TABLE_NAME = 'homework' 
   AND COLUMN_NAME = 'homework_file_path') = 0,
  'ALTER TABLE `homework` ADD COLUMN `homework_file_path` varchar(500) DEFAULT NULL AFTER `homework_filename`',
  'SELECT "homework_file_path column already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if session_id column exists, if not add it
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = DATABASE() 
   AND TABLE_NAME = 'homework' 
   AND COLUMN_NAME = 'session_id') = 0,
  'ALTER TABLE `homework` ADD COLUMN `session_id` int(11) DEFAULT NULL AFTER `tenant_id`',
  'SELECT "session_id column already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if file_size column exists, if not add it
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = DATABASE() 
   AND TABLE_NAME = 'homework' 
   AND COLUMN_NAME = 'file_size') = 0,
  'ALTER TABLE `homework` ADD COLUMN `file_size` bigint(20) DEFAULT NULL AFTER `homework_file_path`',
  'SELECT "file_size column already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if file_type column exists, if not add it
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = DATABASE() 
   AND TABLE_NAME = 'homework' 
   AND COLUMN_NAME = 'file_type') = 0,
  'ALTER TABLE `homework` ADD COLUMN `file_type` varchar(100) DEFAULT NULL AFTER `file_size`',
  'SELECT "file_type column already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if idx_session_id index exists, if not add it
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
   WHERE TABLE_SCHEMA = DATABASE() 
   AND TABLE_NAME = 'homework' 
   AND INDEX_NAME = 'idx_session_id') = 0,
  'ALTER TABLE `homework` ADD INDEX `idx_session_id` (`session_id`)',
  'SELECT "idx_session_id index already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if fk_homework_session constraint exists, if not add it
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
   WHERE TABLE_SCHEMA = DATABASE() 
   AND TABLE_NAME = 'homework' 
   AND CONSTRAINT_NAME = 'fk_homework_session') = 0,
  'ALTER TABLE `homework` ADD CONSTRAINT `fk_homework_session` FOREIGN KEY (`session_id`) REFERENCES `session` (`session_id`) ON DELETE SET NULL',
  'SELECT "fk_homework_session constraint already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt; 