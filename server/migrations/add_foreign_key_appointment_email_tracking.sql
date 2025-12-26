-- Add foreign key constraint to appointment_email_tracking table
-- This links counselor_profile_id to counselor_profile table

ALTER TABLE appointment_email_tracking
ADD CONSTRAINT appointment_email_tracking_ibfk_1
FOREIGN KEY (counselor_profile_id)
REFERENCES counselor_profile(counselor_profile_id)
ON DELETE CASCADE
ON UPDATE NO ACTION;

