-- Migration: Add unique constraint for treatment_target, form_name, and tenant_id combination
-- This ensures that duplicate combinations cannot be created at the database level

-- Add unique constraint for the combination of treatment_target, form_name, and tenant_id
-- This allows the same combination to exist for different tenants, but prevents duplicates within the same tenant scope
ALTER TABLE treatment_target_feedback_config 
ADD CONSTRAINT unique_treatment_target_form_tenant 
UNIQUE (treatment_target, form_name, tenant_id);

-- Note: This constraint allows:
-- 1. Same treatment_target + form_name for different tenant_id values
-- 2. Same treatment_target + form_name where one has tenant_id = NULL and another has a specific tenant_id
-- 3. Prevents duplicate combinations within the same tenant scope (including global scope where tenant_id = NULL) 