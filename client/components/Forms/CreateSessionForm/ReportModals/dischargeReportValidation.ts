import { z } from "zod";

export const dischargeReportSchema = z.object({
  treatmentSummary: z.string().min(1, "Treatment summary is required"),
  remainingConcerns: z.string().min(1, "Remaining concerns are required"),
  recommendations: z.string().min(1, "Recommendations are required"),
  clientUnderstanding: z.string().min(1, "Client/caregiver understanding is required"),
  dischargeReasonOtherText: z.string().optional(),
  therapistNotes: z.record(z.string()).optional(), // For assessment notes: { [assessmentIndex]: string }
});

