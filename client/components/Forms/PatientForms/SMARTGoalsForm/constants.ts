import { z } from "zod";

// Client Info Questions
export const CLIENT_INFO_QUESTIONS = [
  { id: "client_name", label: "Client Name: ", type: "string" },
  {
    id: "service_description",
    label: "Service Description: ",
    type: "string",
  },
  { id: "intake_date", label: "Intake Date: ", type: "text" },
] as const;

// Rating Options
export const RATINGS = Array.from({ length: 10 }, (_, i) => ({
  label: `${i + 1}`,
  value: `${i + 1}`,
}));

// Dropdown Options
export const DROPDOWN_OPTIONS = {
  common: [
    { label: "Not Achieved", value: "not_achieved" },
    { label: "Needs Improvement", value: "needs_improvement" },
    { label: "Reviewed and Met", value: "reviewed_and_met" },
    { label: "Completed", value: "completed" },
  ],
  ratings: RATINGS,
} as const;

// Goal Theme Options
export const GOAL_THEMES = [
  {
    id: "feeling_less_anxious_about_work",
    label: "Feeling less anxious about work",
    description: "This goal helps reduce distress linked to work situations.",
  },
  {
    id: "sleeping_better",
    label: "Sleeping better",
    description: "This goal helps improve sleep quality and establish healthy sleep patterns.",
  },
  {
    id: "managing_stress",
    label: "Managing stress",
    description: "This goal helps develop effective stress management strategies and coping skills.",
  },
  {
    id: "return_to_work_readiness",
    label: "Return to work readiness",
    description: "This goal helps prepare for a successful return to the workplace.",
  },
  {
    id: "something_else",
    label: "Something else (please describe)",
    description: "",
  },
] as const;

// Timeframe Options
export const TIMEFRAMES = [
  { id: "2_4_weeks", label: "2-4 weeks" },
  { id: "6_8_weeks", label: "6-8 weeks" },
  { id: "not_sure_yet", label: "Not sure yet" },
] as const;

// Form Header Content
export const FORM_HEADER = {
  title: "Smart Goal Tracker Questionnaire",
  description:
    "Set and track your therapeutic goals using the SMART framework (Specific, Measurable, Achievable, Relevant, Time-bound). This questionnaire helps you and your therapist identify clear objectives, establish realistic timeframes, and monitor your progress throughout your treatment journey.",
} as const;

// Section Instructions
export const SECTION_INSTRUCTIONS = {
  goalTheme:
    "Please select the goal that best fits what you want to work on right now.",
} as const;

// Zod Schema for SMART Goals Form
export const smartGoalsSchema = z
  .object({
    client_name: z.string().optional(),
    date: z.string().optional(),
    intake_date: z.string().optional(),
    service_description: z.string().optional(),
    client_goal_theme: z.string().min(1, "Please select a goal theme"),
    goal_theme_other: z.string().optional(),
    timeframe: z.string().min(1, "Please select a timeframe"),
  })
  .refine(
    (data) => {
      // If "something_else" is selected, goal_theme_other is required
      if (data.client_goal_theme === "something_else") {
        return data.goal_theme_other && data.goal_theme_other.trim().length > 0;
      }
      return true;
    },
    {
      message: "Please describe your goal",
      path: ["goal_theme_other"],
    }
  );

