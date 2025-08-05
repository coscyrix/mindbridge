-- Migration: Complete Homework Upload System Setup
-- Date: 2024-01-XX
-- This migration sets up the complete homework upload system with tenant configuration

-- =====================================================
-- 1. CREATE TENANT CONFIGURATION TABLE
-- =====================================================

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

-- =====================================================
-- 2. DROP AND RECREATE HOMEWORK TABLE
-- =====================================================

-- Drop existing homework table if it exists
DROP TABLE IF EXISTS `homework`;

-- Create new homework table with all required columns
CREATE TABLE `homework` (
  `homework_id` int(11) NOT NULL AUTO_INCREMENT,
  `homework_title` varchar(255) NOT NULL,
  `homework_filename` varchar(255) DEFAULT NULL,
  `homework_file_path` varchar(500) DEFAULT NULL,
  `tenant_id` int(11) NOT NULL,
  `session_id` int(11) DEFAULT NULL,
  `file_size` bigint(20) DEFAULT NULL,
  `file_type` varchar(100) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status_yn` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`homework_id`),
  KEY `idx_tenant_id` (`tenant_id`),
  KEY `idx_session_id` (`session_id`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_status_yn` (`status_yn`),
  CONSTRAINT `fk_homework_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenant` (`tenant_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_homework_session` FOREIGN KEY (`session_id`) REFERENCES `session` (`session_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add composite indexes for better performance
CREATE INDEX `idx_homework_tenant_session` ON `homework` (`tenant_id`, `session_id`);
CREATE INDEX `idx_homework_created_status` ON `homework` (`created_at`, `status_yn`);

-- =====================================================
-- 3. INSERT DEFAULT CONFIGURATIONS
-- =====================================================

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

-- =====================================================
-- 4. VERIFICATION QUERIES
-- =====================================================

-- Verify tenant_configuration table structure
DESCRIBE `tenant_configuration`;

-- Verify homework table structure
DESCRIBE `homework`;

-- Show existing tenant configurations
SELECT 
  tc.config_id,
  tc.tenant_id,
  t.tenant_name,
  tc.feature_name,
  tc.feature_value,
  tc.is_enabled,
  tc.created_at
FROM `tenant_configuration` tc
JOIN `tenant` t ON tc.tenant_id = t.tenant_id
WHERE tc.status_yn = 1
ORDER BY tc.tenant_id, tc.feature_name;

-- Show homework table indexes
SHOW INDEX FROM `homework`;

-- =====================================================
-- 5. MIGRATION COMPLETE
-- =====================================================

SELECT 'Homework Upload System Migration Completed Successfully!' as status; 