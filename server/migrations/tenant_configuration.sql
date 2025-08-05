-- Migration: Add tenant configuration table for homework upload settings
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

-- Add columns to homework table (will fail gracefully if columns already exist)
-- Note: Run these statements one by one if you encounter errors

-- Add homework_file_path column
ALTER TABLE `homework` 
ADD COLUMN `homework_file_path` varchar(500) DEFAULT NULL AFTER `homework_filename`;

-- Add session_id column  
ALTER TABLE `homework` 
ADD COLUMN `session_id` int(11) DEFAULT NULL AFTER `tenant_id`;

-- Add file_size column
ALTER TABLE `homework` 
ADD COLUMN `file_size` bigint(20) DEFAULT NULL AFTER `homework_file_path`;

-- Add file_type column
ALTER TABLE `homework` 
ADD COLUMN `file_type` varchar(100) DEFAULT NULL AFTER `file_size`;

-- Add index for session_id (will fail if index already exists)
ALTER TABLE `homework` 
ADD INDEX `idx_session_id` (`session_id`);

-- Add foreign key constraint (will fail if constraint already exists)
ALTER TABLE `homework` 
ADD CONSTRAINT `fk_homework_session` FOREIGN KEY (`session_id`) REFERENCES `session` (`session_id`) ON DELETE SET NULL; 