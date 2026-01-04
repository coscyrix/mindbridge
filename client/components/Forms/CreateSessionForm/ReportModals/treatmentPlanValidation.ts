import { z } from "zod";

export const treatmentPlanSchema = z.object({
  clinicalImpressions: z.string().min(1, "Clinical impressions are required"),
  longTermGoals: z.string().min(1, "Long-term goals are required"),
  shortTermGoals: z.string().min(1, "Short-term goals are required"),
  therapeuticApproaches: z
    .string()
    .min(1, "Therapeutic approaches are required"),
  sessionFrequency: z.string().min(1, "Session frequency is required"),
  progressMeasurement: z.string().min(1, "Progress measurement is required"),
  planReviewDate: z.string().min(1, "Plan review date is required"),
  updatesRevisions: z.string().min(1, "Updates/revisions are required"),
  signature: z
    .string()
    .min(1, "Signature is required")
    .regex(/^data:image\/png;base64,/, "Signature must be a base64 image"),
});
