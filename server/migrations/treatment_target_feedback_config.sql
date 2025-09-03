-- Migration for treatment_target_feedback_config table
CREATE TABLE IF NOT EXISTS treatment_target_feedback_config (
  id INT AUTO_INCREMENT PRIMARY KEY,
  treatment_target VARCHAR(255) NOT NULL,
  form_name VARCHAR(255) NOT NULL,
  purpose TEXT,
  sessions JSON NOT NULL, -- Store session numbers as JSON array [1, 5, 10, 15, 20]
  tenant_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes for better query performance
  INDEX idx_treatment_target (treatment_target),
  INDEX idx_form_name (form_name),
  INDEX idx_tenant_id (tenant_id),
  INDEX idx_treatment_tenant (treatment_target, tenant_id),
  
  -- Unique constraint to prevent duplicate configurations for same treatment target, form, and tenant
  UNIQUE KEY unique_treatment_form_tenant (treatment_target, form_name, tenant_id)
);

-- Insert sample data for common treatment targets
INSERT INTO treatment_target_feedback_config (treatment_target, form_name, purpose, sessions, tenant_id) VALUES
('Anxiety', 'GAD-7', 'Measure anxiety severity and track treatment progress', '[1, 5, 10, 15, 20]', NULL),
('Anxiety', 'WHODAS', 'Assess functional impairment due to anxiety', '[1, 10, 20]', NULL),
('Depression', 'PHQ-9', 'Measure depression severity and monitor treatment response', '[1, 5, 10, 15, 20]', NULL),
('Depression', 'WHODAS', 'Assess functional impairment due to depression', '[1, 10, 20]', NULL),
('PTSD', 'PCL-5', 'Assess PTSD symptoms and treatment progress', '[1, 5, 10, 15, 20]', NULL),
('PTSD', 'WHODAS', 'Assess functional impairment due to PTSD', '[1, 10, 20]', NULL),
('General Mental Health', 'GAS', 'Goal Attainment Scaling for treatment goal tracking', '["Trans 1", "Trans last"]', NULL),
('General Mental Health', 'SMART Goals', 'Track progress on specific treatment goals', '["OTR", "-OTR"]', NULL),
('General Mental Health', 'Consent Form', 'Document informed consent for treatment', '[1]', NULL),
('General Mental Health', 'Attendance', 'Track session attendance and engagement', '[1, 5, 10, 15, 20]', NULL); 