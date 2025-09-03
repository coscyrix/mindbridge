-- Migration: Create treatment_target_session_forms_template table
-- This table stores template configurations for treatment target forms
-- that can be copied to new tenants

CREATE TABLE IF NOT EXISTS treatment_target_session_forms_template (
  id INT AUTO_INCREMENT PRIMARY KEY,
  treatment_target VARCHAR(255) NOT NULL,
  form_name VARCHAR(255) NOT NULL,
  service_name VARCHAR(255) NULL,
  purpose TEXT,
  sessions JSON,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_treatment_target_form (treatment_target, form_name)
);

-- Insert default template configurations
INSERT INTO treatment_target_session_forms_template 
(treatment_target, form_name, service_name, purpose, sessions) VALUES
('Anxiety', 'GAD-7', NULL, 'Measure anxiety severity and track treatment progress', '[1, 5, 10, 15, 20]'),
('Anxiety', 'WHODAS', NULL, 'Assess functional impairment due to anxiety', '[1, 10, 20]'),
('Depression', 'PHQ-9', NULL, 'Measure depression severity and monitor treatment response', '[1, 5, 10, 15, 20]'),
('Depression', 'WHODAS', NULL, 'Assess functional impairment due to depression', '[1, 10, 20]'),
('PTSD', 'PCL-5', NULL, 'Assess PTSD symptoms and treatment progress', '[1, 5, 10, 15, 20]'),
('PTSD', 'WHODAS', NULL, 'Assess functional impairment due to PTSD', '[1, 10, 20]'),
('General Mental Health', 'GAS', NULL, 'Goal Attainment Scaling for treatment goal tracking', '["Trans 1", "Trans last"]'),
('General Mental Health', 'SMART Goals', NULL, 'Track progress on specific treatment goals', '["OTR", "-OTR"]'),
('General Mental Health', 'Consent Form', NULL, 'Document informed consent for treatment', '[1]'),
('General Mental Health', 'Attendance', NULL, 'Track session attendance and engagement', '[1, 5, 10, 15, 20]')
ON DUPLICATE KEY UPDATE
  purpose = VALUES(purpose),
  sessions = VALUES(sessions),
  updated_at = CURRENT_TIMESTAMP;

-- Create indexes for better performance
CREATE INDEX idx_template_treatment_target ON treatment_target_session_forms_template(treatment_target);
CREATE INDEX idx_template_form_name ON treatment_target_session_forms_template(form_name);
CREATE INDEX idx_template_active ON treatment_target_session_forms_template(is_active);
