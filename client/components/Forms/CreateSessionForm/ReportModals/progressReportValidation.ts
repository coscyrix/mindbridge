import { z } from "zod";

export const progressReportSchema = z.object({
  sessionSummary: z.string().min(1, "Session summary is required"),
  progressSinceLastSession: z.string().min(1, "Progress since last session is required"),
  riskScreeningNote: z.string().optional(),
  therapistNotes: z.record(z.string()).optional(),
});

