-- Add treatment_target column to thrpy_req table
-- This column stores the treatment target determined from the client's target outcome

-- Add the treatment_target column
ALTER TABLE thrpy_req ADD COLUMN treatment_target VARCHAR(255) NULL AFTER tenant_id;

-- Add index for better query performance
CREATE INDEX idx_treatment_target ON thrpy_req(treatment_target);

-- Verify the column was added
DESCRIBE thrpy_req;
