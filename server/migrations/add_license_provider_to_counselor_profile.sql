-- Migration: Add license_provider column to counselor_profile table
-- This allows storing the provider/issuer of the counselor's license

-- Add license_provider column after license_number
ALTER TABLE counselor_profile 
ADD COLUMN license_provider VARCHAR(255) NULL AFTER license_number;

-- Add index for better query performance on license_provider
CREATE INDEX idx_license_provider ON counselor_profile(license_provider);
