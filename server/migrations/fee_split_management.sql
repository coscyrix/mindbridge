-- Migration: Create fee_split_management table with counselor-specific splits
-- Date: 2024-12-XX

-- Create fee_split_management table
CREATE TABLE IF NOT EXISTS `fee_split_management` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL,
  `counselor_user_id` int(11) DEFAULT NULL,
  `is_fee_split_enabled` tinyint(1) DEFAULT 0,
  `tenant_share_percentage` int(3) DEFAULT 0,
  `counselor_share_percentage` int(3) DEFAULT 100,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status_yn` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_tenant_counselor_fee_split` (`tenant_id`, `counselor_user_id`),
  KEY `idx_tenant_id` (`tenant_id`),
  KEY `idx_counselor_user_id` (`counselor_user_id`),
  KEY `idx_is_enabled` (`is_fee_split_enabled`),
  CONSTRAINT `fk_fee_split_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenant` (`tenant_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_fee_split_counselor_user` FOREIGN KEY (`counselor_user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default fee split management configuration for existing tenants
-- This creates a default configuration for each tenant (counselor_user_id = NULL for tenant-wide default)
INSERT INTO `fee_split_management` (`tenant_id`, `counselor_user_id`, `is_fee_split_enabled`, `tenant_share_percentage`, `counselor_share_percentage`)
SELECT 
  t.tenant_id,
  NULL, -- Default: tenant-wide configuration (no specific counselor)
  0, -- Default: fee split disabled
  0, -- Default: 0% tenant share
  100 -- Default: 100% counselor share
FROM `tenant` t
WHERE t.status_yn = 1
ON DUPLICATE KEY UPDATE 
  `updated_at` = CURRENT_TIMESTAMP;

-- Add comment to document the fee split management table
-- The table structure:
-- - tenant_id: References the tenant table
-- - counselor_user_id: References the user table (NULL for tenant-wide default)
-- - is_fee_split_enabled: Boolean flag (0=disabled, 1=enabled)
-- - tenant_share_percentage: Integer 0-100
-- - counselor_share_percentage: Integer 0-100
-- - When counselor_user_id is NULL: Tenant-wide default configuration
-- - When counselor_user_id is set: Counselor-specific configuration (user with counselor role)
-- - When is_fee_split_enabled = 0: System defaults to full allocation to counselor
-- - When is_fee_split_enabled = 1: Percentages must sum to 100% 