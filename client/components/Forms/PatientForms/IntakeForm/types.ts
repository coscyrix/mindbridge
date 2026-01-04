// Types for IntakeForm component

export interface AppointmentData {
  id: number;
  counselor_profile_id: number;
  customer_email: string;
  customer_name: string;
  service: string;
  appointment_date: string;
  sent_at: string;
  created_at: string;
  updated_at: string;
  contact_number: string | null;
  country_code: string | null;
  send_intake_form: number | boolean;
  intake_form_submitted: number | boolean;
}

export interface IntakeFormData {
  full_name: string;
  phone: string;
  email: string;
  emergency_contact_name: string;
  emergency_contact_relationship: string;
  emergency_contact_phone: string;
  using_insurance: string;
  insurance_provider: string;
  policyholder_name: string;
  policyholder_date_of_birth: Date | null;
  member_id: string;
  group_number: string;
  reason_for_therapy: string;
  duration: string;
  symptoms: {
    anxiety: boolean;
    depression: boolean;
    stress: boolean;
    sleep_issues: boolean;
    mood_changes: boolean;
    relationship_issues: boolean;
    other: boolean;
  };
  other_symptom: string;
  thoughts_self_harm: string;
  thoughts_harm_others: string;
  therapy_goals: string;
  consent: boolean;
  signature: string | null;
}

export interface IntakeFormPayload {
  counselor_id: number;
  appointment_id: number;
  intake_form_id: number;
  full_name: string;
  phone: string;
  email: string;
  emergency_contact_name: string;
  emergency_contact_relationship: string;
  emergency_contact_phone: string;
  using_insurance: string;
  insurance_provider: string;
  policyholder_name: string;
  policyholder_date_of_birth: string | null;
  member_id: string;
  group_number: string;
  reason_for_therapy: string;
  duration: string;
  symptoms: string[];
  thoughts_self_harm: string;
  thoughts_harm_others: string;
  therapy_goals: string;
  consent: boolean;
  signature: string | null;
}

