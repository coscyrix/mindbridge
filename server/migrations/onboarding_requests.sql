-- Migration for onboarding_requests table
CREATE TABLE IF NOT EXISTS onboarding_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organization VARCHAR(255),
  contact VARCHAR(255),
  position VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  website VARCHAR(255),
  address VARCHAR(255),
  counselors INT,
  clients INT,
  features TEXT,
  demoTime DATETIME,
  notes TEXT,
  typedName VARCHAR(255),
  signature VARCHAR(255),
  date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 