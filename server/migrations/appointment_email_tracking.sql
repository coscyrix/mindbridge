-- Create appointment email tracking table
CREATE TABLE IF NOT EXISTS appointment_email_tracking (
    id INT AUTO_INCREMENT PRIMARY KEY,
    counselor_profile_id INT NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    service VARCHAR(255) NOT NULL,
    appointment_date DATETIME NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_counselor_customer (counselor_profile_id, customer_email),
    INDEX idx_sent_at (sent_at)
);
