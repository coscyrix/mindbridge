-- Migration to add form_submit column to treatment_target_session_forms table
-- This column tracks whether a form has been submitted by the client

ALTER TABLE treatment_target_session_forms 
ADD COLUMN form_submit TINYINT(1) DEFAULT 0 COMMENT 'Whether the form has been submitted by the client';

-- Add index for better query performance
ALTER TABLE treatment_target_session_forms 
ADD INDEX idx_form_submit (form_submit);

-- Add index for combined queries
ALTER TABLE treatment_target_session_forms 
ADD INDEX idx_session_form_submit (session_id, form_submit);
