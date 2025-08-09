-- Migration: Add service_name column to treatment_target_feedback_config table
-- This allows for more granular configuration based on specific services

-- Add service_name column (optional field)
ALTER TABLE treatment_target_feedback_config 
ADD COLUMN service_name VARCHAR(255) NULL AFTER form_name;

-- Update the unique constraint to include service_name
-- First, drop the existing constraint
ALTER TABLE treatment_target_feedback_config 
DROP CONSTRAINT unique_treatment_target_form_tenant;

-- Add new unique constraint including service_name
ALTER TABLE treatment_target_feedback_config 
ADD CONSTRAINT unique_treatment_target_form_service_tenant 
UNIQUE (treatment_target, form_name, service_name, tenant_id);

-- Note: This new constraint allows:
-- 1. Same treatment_target + form_name + service_name for different tenant_id values
-- 2. Same treatment_target + form_name + service_name where one has tenant_id = NULL and another has a specific tenant_id
-- 3. Different service_name values for the same treatment_target + form_name combination
-- 4. Prevents duplicate combinations within the same tenant scope (including global scope where tenant_id = NULL) 