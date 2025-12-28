/**
 * Type definitions for Report Modals
 *
 * This file contains TypeScript interfaces and types for report metadata structures.
 */

/**
 * Risk screening flags for progress reports
 */
export interface RiskScreeningFlags {
  no_risk: boolean;
  suicidal_ideation: boolean;
  self_harm: boolean;
  substance_concerns: boolean;
}

/**
 * Assessment data structure
 */
export interface Assessment {
  tool: string;
  score: string | number;
  therapist_notes: string;
}

/**
 * Meta information section of progress report metadata
 */
export interface ProgressReportMeta {
  session_id?: number;
  client_id?: string; // Client reference ID (e.g., "61234151")
  session_number?: number;
  total_sessions_completed?: number;
  report_date?: string; // Format: "YYYY-MM-DD"
}

/**
 * Practice information section of progress report metadata
 */
export interface ProgressReportPractice {
  practice_name?: string;
  treatment_block_name?: string;
  frequency?: "Weekly" | "Biweekly" | "Other";
}

/**
 * Therapist information section of progress report metadata
 */
export interface ProgressReportTherapist {
  name?: string;
  designation?: string;
}

/**
 * Client information section of progress report metadata
 */
export interface ProgressReportClient {
  full_name?: string;
  client_id_reference?: string;
}

/**
 * Risk screening nested within report section
 */
export interface ProgressReportRiskScreening {
  note?: string;
  flags?: RiskScreeningFlags;
}

/**
 * Report content section of progress report metadata
 */
export interface ProgressReportContent {
  session_summary?: string;
  progress_since_last_session?: string;
  risk_screening?: ProgressReportRiskScreening;
  assessments?: Assessment[];
}

/**
 * Sign-off section of progress report metadata
 */
export interface ProgressReportSignOff {
  approved_by?: string;
  approved_on?: string; // Format: "YYYY-MM-DD"
  method?: "Electronic" | string;
}

/**
 * Complete progress report metadata structure
 *
 * This matches the nested JSON structure stored in the database metadata column
 */
export interface ProgressReportMetadata {
  meta?: ProgressReportMeta;
  practice?: ProgressReportPractice;
  therapist?: ProgressReportTherapist;
  client?: ProgressReportClient;
  report?: ProgressReportContent;
  sign_off?: ProgressReportSignOff;
}

/**
 * Progress report database record structure
 */
export interface ProgressReportRecord {
  id?: number;
  report_id: number;
  metadata?: ProgressReportMetadata;
  created_at?: string;
  updated_at?: string;
  tenant_id?: number;
}
