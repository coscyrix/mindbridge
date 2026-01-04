/**
 * Types for User Info and Form Status API Response
 */

export interface UserInfo {
  user_first_name: string;
  user_last_name: string;
  intake_date?: string | null;
  service_name: string;
  service_id: number | null;
}

export interface FormDetails {
  form_id: number;
  form_cde: string;
  form_description: string | null;
}

export interface UserInfoAndFormStatusRecord {
  user_info: UserInfo;
  form_submitted: boolean;
  form_id: number;
  session_id: number;
  form_details: FormDetails | null;
}

export interface UserInfoAndFormStatusResponse {
  rec: UserInfoAndFormStatusRecord[];
  error: number;
}

/**
 * Transformed form data for SMART Goals form component
 */
export interface SMARTGoalFormData {
  client_first_name: string;
  client_last_name: string;
  intake_date: string;
  service_name: string;
  service_id?: number | null;
}
