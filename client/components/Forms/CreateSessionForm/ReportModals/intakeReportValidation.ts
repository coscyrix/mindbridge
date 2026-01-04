import { z } from "zod";

export const intakeReportSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  emergencyContact: z.string().optional(),
  reasonForTherapy: z.string().min(1, "Reason for seeking therapy is required"),
  durationOfConcern: z.string().min(1, "Duration of concern is required"),
  otherSymptoms: z.string().optional(),
  currentMedications: z.string().optional(),
  medicalConditions: z.string().optional(),
  immediateSafetyConcerns: z.string().optional(),
  clinicalImpression: z.string().min(1, "Initial clinical impression is required"),
});

