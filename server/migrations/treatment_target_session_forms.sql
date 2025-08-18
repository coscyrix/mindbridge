-- Migration for treatment_target_session_forms table
-- This table stores the relationship between sessions and forms based on treatment targets

CREATE TABLE IF NOT EXISTS treatment_target_session_forms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  req_id INT NOT NULL,
  session_id INT NOT NULL,
  client_id INT NOT NULL,
  counselor_id INT NOT NULL,
  treatment_target VARCHAR(255) NOT NULL,
  form_name VARCHAR(255) NOT NULL,
  form_id INT NOT NULL,
  config_id INT NOT NULL,
  purpose TEXT,
  session_number INT NOT NULL,
  is_sent TINYINT(1) DEFAULT 0,
  sent_at TIMESTAMP NULL,
  tenant_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes for better query performance
  INDEX idx_req_id (req_id),
  INDEX idx_session_id (session_id),
  INDEX idx_client_id (client_id),
  INDEX idx_counselor_id (counselor_id),
  INDEX idx_treatment_target (treatment_target),
  INDEX idx_form_name (form_name),
  INDEX idx_form_id (form_id),
  INDEX idx_config_id (config_id),
  INDEX idx_session_number (session_number),
  INDEX idx_tenant_id (tenant_id),
  INDEX idx_is_sent (is_sent),
  INDEX idx_req_session (req_id, session_id),
  INDEX idx_client_session (client_id, session_id),
  INDEX idx_treatment_session (treatment_target, session_number),
  
  -- Foreign key constraints
  FOREIGN KEY (req_id) REFERENCES thrpy_req(req_id) ON DELETE CASCADE,
  FOREIGN KEY (session_id) REFERENCES session(session_id) ON DELETE CASCADE,
  FOREIGN KEY (client_id) REFERENCES user_profile(user_profile_id) ON DELETE CASCADE,
  FOREIGN KEY (counselor_id) REFERENCES user_profile(user_profile_id) ON DELETE CASCADE,
  FOREIGN KEY (form_id) REFERENCES forms(form_id) ON DELETE CASCADE,
  FOREIGN KEY (config_id) REFERENCES treatment_target_feedback_config(id) ON DELETE CASCADE,
  
  -- Unique constraint to prevent duplicate form assignments for the same session
  UNIQUE KEY unique_session_form (session_id, form_id, treatment_target)
);

-- Add comments to explain the table purpose
ALTER TABLE treatment_target_session_forms 
COMMENT = 'Stores treatment target-based form assignments to sessions';

-- Insert sample data for testing (optional)
-- INSERT INTO treatment_target_session_forms 
-- (req_id, session_id, client_id, counselor_id, treatment_target, form_name, form_id, config_id, purpose, session_number, tenant_id) VALUES
-- (1, 1, 1, 2, 'Anxiety', 'GAD-7', 1, 1, 'Measure anxiety severity and track treatment progress', 1, 1),
-- (1, 5, 1, 2, 'Anxiety', 'GAD-7', 1, 1, 'Measure anxiety severity and track treatment progress', 5, 1);
