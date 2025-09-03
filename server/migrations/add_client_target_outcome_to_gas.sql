-- Migration to add client_target_outcome_id column to feedback_gas table
-- This will allow tracking which target outcome the client was working on when the GAS form was submitted

ALTER TABLE feedback_gas 
ADD COLUMN client_target_outcome_id INT NULL AFTER tenant_id,
ADD INDEX idx_client_target_outcome_id (client_target_outcome_id),
ADD CONSTRAINT fk_gas_client_target_outcome 
FOREIGN KEY (client_target_outcome_id) REFERENCES ref_target_outcomes(target_id) ON DELETE SET NULL; 