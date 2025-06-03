-- Add unique constraint to ensure one counselor can only have one profile
ALTER TABLE counselor_profile
ADD CONSTRAINT unique_counselor_profile UNIQUE (user_profile_id); 