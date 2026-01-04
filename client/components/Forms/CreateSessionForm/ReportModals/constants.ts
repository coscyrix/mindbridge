/**
 * Constants for Report Modals
 * Shared options and configuration values used across all report types
 */

// Duration of concern options for Intake Report
export const DURATION_OPTIONS = [
  { value: "less_than_1_month", label: "Less than 1 month" },
  { value: "1_6_months", label: "1-6 months" },
  { value: "6_12_months", label: "6-12 months" },
  { value: "over_1_year", label: "Over 1 year" },
] as const;

// Symptom options for Intake Report
export const SYMPTOM_OPTIONS = [
  { key: "anxiety", label: "Anxiety" },
  { key: "depression", label: "Depression" },
  { key: "stress", label: "Stress" },
  { key: "sleepIssues", label: "Sleep issues" },
  { key: "moodChanges", label: "Mood changes" },
  { key: "relationshipIssues", label: "Relationship issues" },
] as const;

// Previous therapy options
export const YES_NO_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
] as const;

// Self-harm thoughts options
export const SELF_HARM_OPTIONS = [
  { value: "no", label: "No" },
  { value: "past", label: "Past" },
  { value: "current", label: "Current" },
] as const;

// Harming others options
export const HARMING_OTHERS_OPTIONS = [
  { value: "no", label: "No" },
  { value: "yes", label: "Yes" },
] as const;

// Discharge reason options
export const DISCHARGE_REASON_OPTIONS = [
  { value: "goals_met", label: "Treatment goals met" },
  { value: "client_withdrew", label: "Client withdrew" },
  { value: "referral_made", label: "Referral made" },
  { value: "other", label: "Other" },
] as const;

// Risk screening options for Progress Report
export const RISK_SCREENING_OPTIONS = [
  { key: "no_risk", label: "No risk" },
  { key: "suicidal_ideation", label: "Suicidal ideation" },
  { key: "self_harm", label: "Self-harm" },
  { key: "substance_concerns", label: "Substance concerns" },
] as const;

// Frequency options
export const FREQUENCY_OPTIONS = [
  { value: "Weekly", label: "Weekly" },
  { value: "Biweekly", label: "Biweekly" },
  { value: "Other", label: "Other" },
] as const;

// Default symptoms state
export const DEFAULT_SYMPTOMS = {
  anxiety: false,
  depression: false,
  stress: false,
  sleepIssues: false,
  moodChanges: false,
  relationshipIssues: false,
} as const;

// Default risk screening flags
export const DEFAULT_RISK_FLAGS = {
  no_risk: false,
  suicidal_ideation: false,
  self_harm: false,
  substance_concerns: false,
} as const;

// Type exports
export type DurationOption = (typeof DURATION_OPTIONS)[number]["value"];
export type SymptomKey = (typeof SYMPTOM_OPTIONS)[number]["key"];
export type DischargeReason = (typeof DISCHARGE_REASON_OPTIONS)[number]["value"];
export type RiskFlagKey = (typeof RISK_SCREENING_OPTIONS)[number]["key"];
export type FrequencyOption = (typeof FREQUENCY_OPTIONS)[number]["value"];

