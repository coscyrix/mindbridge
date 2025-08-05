# GAS Form API Documentation

## Overview
The GAS (Goal Attainment Scaling) Form API allows clients to submit goal progress tracking questionnaires. This form uses a structured -2 to +2 scale to monitor client progress and support therapy adjustments.

## Endpoint
```
POST /api/feedback/gas
```

## Request Body
```json
{
  "goal": "Improving_Emotional_Regulation_in_Therapy",
  "responses": [
    {
      "question": "How often do you use emotional regulation techniques?",
      "selectedLabel": "Regularly (5-6 times per week)",
      "score": 1
    },
    {
      "question": "How effective are these techniques in reducing your emotional distress?",
      "selectedLabel": "They are effective in most situations",
      "score": 1
    }
  ],
  "session_id": 123,
  "client_id": 456
}
```

## Request Parameters

### Required Fields
- `goal` (string): The selected treatment goal from the available options
- `responses` (array): Array of response objects containing:
  - `question` (string): The question text
  - `selectedLabel` (string|null): The selected option label
  - `score` (number): The score value (-2 to +2)
- `session_id` (number): The session ID
- `client_id` (number): The client ID

### Available Goals
- `Improving_Emotional_Regulation_in_Therapy`
- `Depression`
- `Stress_Management`
- `Self_Esteem_and_Self_Confidence_Issues`
- `Addiction_and_Substance_Abuse`
- `Work_and_Career_Related_Issues`
- `Anger_Management`
- `Eating_Disorders_and_Body_Image_Issues`
- `Life_Transitions`

## Response

### Success Response (200)
```json
{
  "message": "Feedback created successfully"
}
```

### Error Response (400)
```json
{
  "message": "Error message",
  "error": -1
}
```

## Database Schema

### feedback_gas Table
```sql
CREATE TABLE feedback_gas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  goal VARCHAR(255) NOT NULL,
  total_score INT NOT NULL,
  responses_json JSON NOT NULL,
  feedback_id INT NOT NULL,
  tenant_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (feedback_id) REFERENCES feedback(feedback_id) ON DELETE CASCADE
);
```

## Features
- Validates session existence
- Prevents duplicate submissions for the same session
- Calculates total score from individual responses
- Stores responses as JSON for flexibility
- Supports tenant-based data isolation
- Integrates with existing feedback system

## Client Integration
The frontend can use the `CommonServices.submitGASForm(payload)` method to submit GAS form data.

## Form ID
The GAS form uses `form_id: 25` in the feedback system. 