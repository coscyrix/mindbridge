-- Migration for feedback_gas table
CREATE TABLE IF NOT EXISTS feedback_gas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  goal VARCHAR(255) NOT NULL,
  total_score INT NOT NULL,
  responses_json JSON NOT NULL,
  feedback_id INT NOT NULL,
  tenant_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (feedback_id) REFERENCES feedback(feedback_id) ON DELETE CASCADE,
  INDEX idx_feedback_id (feedback_id),
  INDEX idx_tenant_id (tenant_id)
); 