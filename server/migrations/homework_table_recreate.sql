-- Migration: Drop and recreate homework table with new structure
-- Date: 2024-01-XX

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

-- Add indexes for better performance
CREATE INDEX `idx_homework_tenant_session` ON `homework` (`tenant_id`, `session_id`);
CREATE INDEX `idx_homework_created_status` ON `homework` (`created_at`, `status_yn`);

-- Insert sample data (optional - remove if not needed)
-- INSERT INTO `homework` (`homework_title`, `homework_filename`, `homework_file_path`, `tenant_id`, `session_id`, `file_size`, `file_type`) VALUES
-- ('Sample Homework Assignment', 'sample.pdf', 'uploads/homework/homework_file-1234567890-sample.pdf', 1, 1, 1024000, 'application/pdf'); 