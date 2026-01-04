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

/**
 * ============================================
 * TREATMENT PLAN REPORT TYPES
 * ============================================
 */

/**
 * Review & Updates section of treatment plan report
 */
export interface TreatmentPlanReviewUpdates {
  review_date: string;
  updates: string;
}

/**
 * Treatment Goals section of treatment plan report
 */
export interface TreatmentPlanTreatmentGoals {
  long_term: string;
  short_term: string;
}

/**
 * Clinical Assessment section of treatment plan report
 */
export interface TreatmentPlanClinicalAssessment {
  clinical_impressions: string;
}

/**
 * Progress Measurement section of treatment plan report
 */
export interface TreatmentPlanProgressMeasurement {
  how_measured: string;
}

/**
 * Planned Interventions section of treatment plan report
 */
export interface TreatmentPlanPlannedInterventions {
  session_frequency: string;
  therapeutic_approaches: string;
}

/**
 * Report section of treatment plan metadata (contains all report data)
 */
export interface TreatmentPlanReportContent {
  review_updates: TreatmentPlanReviewUpdates;
  treatment_goals: TreatmentPlanTreatmentGoals;
  clinical_assessment: TreatmentPlanClinicalAssessment;
  progress_measurement: TreatmentPlanProgressMeasurement;
  planned_interventions: TreatmentPlanPlannedInterventions;
}

/**
 * Client Information section of treatment plan report
 */
export interface TreatmentPlanClientInformation {
  client_name: string;
  treatment_plan_date: string; // ISO timestamp format: 2026-01-18T18:30:00.000Z
}

/**
 * Therapist Acknowledgment section of treatment plan report
 */
export interface TreatmentPlanTherapistAcknowledgment {
  date: string; // ISO timestamp format: 2025-12-29T07:12:24.236Z
  signature: string; // Base64 encoded image: data:image/png;base64,...
  therapist_name: string;
}

/**
 * Complete treatment plan report metadata structure
 *
 * This matches the nested JSON structure stored in the database metadata column
 */
export interface TreatmentPlanMetadata {
  report: TreatmentPlanReportContent;
  client_information: TreatmentPlanClientInformation;
  therapist_acknowledgment: TreatmentPlanTherapistAcknowledgment;
}

/**
 * Treatment plan report database record structure
 */
export interface TreatmentPlanReportResponse {
  id: number;
  report_id: number;
  created_at: string; // Format: "2025-12-28 19:18:50"
  updated_at: string; // Format: "2025-12-29 07:12:24"
  tenant_id: number;
  metadata: TreatmentPlanMetadata;
}

/**
 * Payload structure for creating/updating treatment plan report
 */
export interface TreatmentPlanReportPayload {
  report_id: number;
  metadata: TreatmentPlanMetadata;
}

/**
 * ============================================
 * DISCHARGE REPORT TYPES
 * ============================================
 */

/**
 * Symptoms state for discharge report
 */
export interface DischargeSymptoms {
  anxiety: boolean;
  depression: boolean;
  stress: boolean;
  sleepIssues: boolean;
  moodChanges: boolean;
  relationshipIssues: boolean;
}

/**
 * Client Information section of discharge report
 */
export interface DischargeClientInformation {
  client_name: string;
  client_id?: string;
  diagnosis?: string;
  treatment_start_date: string;
  treatment_end_date: string;
  total_sessions_attended: number;
}

/**
 * Treatment Summary section of discharge report
 */
export interface DischargeTreatmentSummary {
  treatment_goals: string;
  progress_summary: string;
  presenting_concerns: string;
}

/**
 * Discharge Information section
 */
export interface DischargeInformation {
  discharge_reason: "goals_met" | "client_withdrew" | "referral_made" | "other";
  discharge_reason_other?: string;
  recommendations: string;
}

/**
 * Therapist Acknowledgment section of discharge report
 */
export interface DischargeTherapistAcknowledgment {
  therapist_name: string;
  date: string;
  signature: string;
}

/**
 * Complete discharge report metadata structure
 */
export interface DischargeReportMetadata {
  client_information: DischargeClientInformation;
  treatment_summary: DischargeTreatmentSummary;
  discharge_information: DischargeInformation;
  therapist_acknowledgment: DischargeTherapistAcknowledgment;
}

/**
 * Discharge report database record structure
 */
export interface DischargeReportResponse {
  id: number;
  report_id: number;
  created_at: string;
  updated_at: string;
  tenant_id: number;
  metadata: DischargeReportMetadata;
}

/**
 * Payload structure for creating/updating discharge report
 */
export interface DischargeReportPayload {
  report_id: number;
  metadata: DischargeReportMetadata;
}

/**
 * ============================================
 * INTAKE REPORT TYPES
 * ============================================
 */

/**
 * Meta information section of intake report response
 */
export interface IntakeReportMeta {
  client_id: string | null;
  session_id: number;
  session_number: number | null;
  total_sessions_completed: number | null;
  report_date: string | null; // Format: "YYYY-MM-DD"
}

/**
 * Client header section of intake report response
 */
export interface IntakeReportClientHeader {
  full_name: string | null;
  client_id_reference: string | null;
}

/**
 * Practice information section of intake report response
 */
export interface IntakeReportPractice {
  frequency: string;
  practice_name: string | null;
  treatment_block_name: string | null;
}

/**
 * Therapist information section of intake report response
 */
export interface IntakeReportTherapist {
  name: string | null;
  designation: string | null;
}

/**
 * Symptoms state for intake report (form state)
 */
export interface IntakeSymptoms {
  anxiety: boolean;
  depression: boolean;
  stress: boolean;
  sleep_issues: boolean;
  mood_changes: boolean;
  relationship_issues: boolean;
  other?: string;
}

/**
 * Client Information section within report content
 */
export interface IntakeClientInformation {
  full_name: string | null;
  phone: string | null;
  email: string | null;
  emergency_contact: string | null;
}

/**
 * Presenting Problem section within report content
 */
export interface IntakePresentingProblem {
  reason: string | null;
  duration: "less_than_1_month" | "1_6_months" | "6_12_months" | "over_1_year" | null;
}

/**
 * Mental Health History section within report content
 */
export interface IntakeMentalHealthHistory {
  previous_therapy: "yes" | "no" | null;
  current_medications: string | null;
  medical_conditions: string | null;
}

/**
 * Safety Assessment section within report content
 */
export interface IntakeSafetyAssessment {
  thoughts_of_self_harm: "no" | "past" | "current" | null;
  thoughts_of_harming_others: "yes" | "no" | null;
  immediate_safety_concerns: string | null;
}

/**
 * Report content section of intake report
 */
export interface IntakeReportContent {
  client_information: IntakeClientInformation;
  presenting_problem: IntakePresentingProblem;
  symptoms: Partial<IntakeSymptoms>;
  mental_health_history: IntakeMentalHealthHistory;
  safety_assessment: IntakeSafetyAssessment;
  clinical_impression: string | null;
}

/**
 * Sign-off section of intake report
 */
export interface IntakeReportSignOff {
  method: "Electronic" | string;
  approved_by: string | null;
  approved_on: string | null; // Format: "YYYY-MM-DD"
}

/**
 * Complete intake report response from getIntakeReportData endpoint
 */
export interface IntakeReportDataResponse {
  report_id: number | null;
  meta: IntakeReportMeta;
  client: IntakeReportClientHeader;
  practice: IntakeReportPractice;
  therapist: IntakeReportTherapist;
  report: IntakeReportContent;
  sign_off: IntakeReportSignOff;
}

/**
 * Metadata structure for saving intake report
 */
export interface IntakeReportSaveMetadata {
  report: IntakeReportContent;
}

/**
 * Payload structure for creating/updating intake report
 */
export interface IntakeReportPayload {
  report_id?: number;
  session_id?: number;
  client_id?: number;
  counselor_id?: number;
  metadata: IntakeReportSaveMetadata;
}

/**
 * Form state for symptoms checkboxes (UI state with camelCase)
 */
export interface IntakeSymptomsFormState {
  anxiety: boolean;
  depression: boolean;
  stress: boolean;
  sleepIssues: boolean;
  moodChanges: boolean;
  relationshipIssues: boolean;
}

/**
 * ============================================
 * SHARED/COMMON TYPES
 * ============================================
 */

/**
 * Common session row data passed to report modals
 */
export interface SessionRowData {
  report_id?: number;
  client_name?: string;
  client_id?: string;
  therapist_name?: string;
  therapist_designation?: string;
  practice_name?: string;
  treatment_block_name?: string;
  session_number?: number;
  total_sessions?: number;
  session_date?: string;
  treatment_start_date?: string;
  treatment_end_date?: string;
  diagnosis?: string;
}

/**
 * Common modal props interface
 */
export interface ReportModalProps {
  initialData?: any;
  refetch?: () => void;
}
