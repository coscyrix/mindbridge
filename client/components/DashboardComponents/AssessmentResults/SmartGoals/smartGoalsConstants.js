/**
 * SMART Goals Library
 * Organized by Program-Based and Modality/Treatment-Based goals
 */

// Program-Based Goals
export const PROGRAM_GOAL_LIBRARIES = {
  OTR: [
    {
      id: "otr_trauma_distress",
      text: "Within 4–6 weeks, the client will reduce trauma-related distress so it interferes less with daily functioning, as measured by self-report.",
      timeframe: "4-6 weeks",
    },
    {
      id: "otr_grounding_strategies",
      text: "Within 6–8 weeks, the client will identify and use at least two grounding strategies to manage trauma symptoms related to the workplace incident.",
      timeframe: "6-8 weeks",
    },
    {
      id: "otr_emotional_regulation",
      text: "Within 8 weeks, the client will demonstrate improved emotional regulation when exposed to trauma reminders.",
      timeframe: "8 weeks",
    },
    {
      id: "otr_sleep_consistency",
      text: "Within 6 weeks, the client will improve sleep consistency affected by trauma symptoms.",
      timeframe: "6 weeks",
    },
  ],
  OTR_Transition: [
    {
      id: "otr_transition_prepare",
      text: "Within 4 weeks, the client will prepare for transition to ongoing care by identifying continuing treatment needs and supports.",
      timeframe: "4 weeks",
    },
    {
      id: "otr_transition_readiness",
      text: "Within 6 weeks, the client will demonstrate readiness for transition through symptom stabilization.",
      timeframe: "6 weeks",
    },
    {
      id: "otr_transition_maintain",
      text: "Within the transition period, the client will maintain gains achieved during OTR intervention.",
      timeframe: "transition period",
    },
  ],
  RTW: [
    {
      id: "rtw_tolerance",
      text: "Within 6–8 weeks, the client will increase tolerance for work-related activities.",
      timeframe: "6-8 weeks",
    },
    {
      id: "rtw_anxiety_management",
      text: "Within 8 weeks, the client will identify strategies to manage anxiety related to returning to work.",
      timeframe: "8 weeks",
    },
    {
      id: "rtw_graded_return",
      text: "Within 12 weeks, the client will participate in a graded return-to-work plan.",
      timeframe: "12 weeks",
    },
  ],
  RTW_Extension: [
    {
      id: "rtw_ext_progress",
      text: "Within the extension period, the client will demonstrate continued progress toward RTW goals.",
      timeframe: "extension period",
    },
    {
      id: "rtw_ext_consolidate",
      text: "Within the approved extension timeframe, the client will consolidate functional gains.",
      timeframe: "extension timeframe",
    },
  ],
  Resiliency: [
    {
      id: "resiliency_coping",
      text: "Within 4–6 weeks, the client will strengthen coping strategies to manage stress.",
      timeframe: "4-6 weeks",
    },
    {
      id: "resiliency_strengths",
      text: "Within 6 weeks, the client will identify strengths and protective factors.",
      timeframe: "6 weeks",
    },
    {
      id: "resiliency_emotional_regulation",
      text: "Within 8 weeks, the client will demonstrate improved emotional regulation.",
      timeframe: "8 weeks",
    },
  ],
  Transition: [
    {
      id: "transition_prepare",
      text: "Within 4 weeks, the client will prepare for discharge or transition by identifying supports.",
      timeframe: "4 weeks",
    },
    {
      id: "transition_stability",
      text: "Within the transition period, the client will maintain symptom stability.",
      timeframe: "transition period",
    },
  ],
  Supplemental: [
    {
      id: "supplemental_targeted",
      text: "Within the approved timeframe, the client will address targeted supplemental treatment needs.",
      timeframe: "approved timeframe",
    },
    {
      id: "supplemental_progress",
      text: "Within the service period, the client will demonstrate progress toward supplemental outcomes.",
      timeframe: "service period",
    },
  ],
};

// Modality/Treatment-Based Goals
export const MODALITY_GOAL_LIBRARIES = {
  ACT: [
    {
      id: "act_values_engagement",
      text: "Within 6 weeks, the client will increase engagement in values-based activities despite emotional discomfort.",
      timeframe: "6 weeks",
    },
    {
      id: "act_psychological_flexibility",
      text: "Within 8 weeks, the client will demonstrate increased psychological flexibility.",
      timeframe: "8 weeks",
    },
  ],
  Art_Therapy: [
    {
      id: "art_emotional_expression",
      text: "Within 6 weeks, the client will use creative expression to identify and process emotions.",
      timeframe: "6 weeks",
    },
    {
      id: "art_emotional_awareness",
      text: "Within 8 weeks, the client will demonstrate improved emotional awareness through art-based activities.",
      timeframe: "8 weeks",
    },
  ],
  Behavioral_Activation: [
    {
      id: "ba_activity_participation",
      text: "Within 6 weeks, the client will increase participation in meaningful activities.",
      timeframe: "6 weeks",
    },
    {
      id: "ba_reduce_avoidance",
      text: "Within 8 weeks, the client will reduce avoidance behaviours linked to low mood.",
      timeframe: "8 weeks",
    },
  ],
  CBT: [
    {
      id: "cbt_reduce_thought_patterns",
      text: "Within 6–8 weeks, the client will reduce unhelpful thought patterns.",
      timeframe: "6-8 weeks",
    },
    {
      id: "cbt_cognitive_restructuring",
      text: "Within 8 weeks, the client will apply cognitive restructuring strategies.",
      timeframe: "8 weeks",
    },
  ],
  Cognitive_Therapy: [
    {
      id: "ct_challenge_cognitions",
      text: "Within 6–8 weeks, the client will identify and challenge maladaptive cognitions.",
      timeframe: "6-8 weeks",
    },
    {
      id: "ct_cognitive_coping",
      text: "Within 8 weeks, the client will demonstrate improved cognitive coping strategies.",
      timeframe: "8 weeks",
    },
  ],
  DBT: [
    {
      id: "dbt_emotion_regulation",
      text: "Within 6–8 weeks, the client will increase use of emotion regulation skills.",
      timeframe: "6-8 weeks",
    },
    {
      id: "dbt_distress_tolerance",
      text: "Within 8 weeks, the client will demonstrate improved distress tolerance.",
      timeframe: "8 weeks",
    },
  ],
  EFT: [
    {
      id: "eft_emotional_awareness",
      text: "Within 8 weeks, the client will improve emotional awareness and expression in relationships.",
      timeframe: "8 weeks",
    },
    {
      id: "eft_attachment_communication",
      text: "Within the treatment period, the client will strengthen attachment-related communication.",
      timeframe: "treatment period",
    },
  ],
  EMDR: [
    {
      id: "emdr_reduce_distress",
      text: "Within 8–12 weeks, the client will reduce distress associated with traumatic memories.",
      timeframe: "8-12 weeks",
    },
    {
      id: "emdr_grounding_skills",
      text: "Within 6 weeks, the client will develop grounding skills to support trauma processing.",
      timeframe: "6 weeks",
    },
  ],
  Family_Systems: [
    {
      id: "family_relational_patterns",
      text: "Within 8 weeks, the client/family will improve understanding of relational patterns.",
      timeframe: "8 weeks",
    },
    {
      id: "family_interaction_patterns",
      text: "Within the treatment period, the family will demonstrate healthier interaction patterns.",
      timeframe: "treatment period",
    },
  ],
  Group_CBT: [
    {
      id: "group_cbt_learn_skills",
      text: "Within the group program, the client will learn and apply CBT skills.",
      timeframe: "group program",
    },
    {
      id: "group_cbt_coping_strategies",
      text: "By program completion, the client will demonstrate improved coping strategies.",
      timeframe: "program completion",
    },
  ],
  Gottman_Method: [
    {
      id: "gottman_communication",
      text: "Within the treatment period, the client/couple will improve communication and conflict management skills.",
      timeframe: "treatment period",
    },
    {
      id: "gottman_relationship_strategies",
      text: "Within 8 weeks, the couple will increase use of healthy relationship strategies.",
      timeframe: "8 weeks",
    },
  ],
  IPT: [
    {
      id: "ipt_interpersonal_functioning",
      text: "Within 8 weeks, the client will improve interpersonal functioning.",
      timeframe: "8 weeks",
    },
    {
      id: "ipt_relationship_stressors",
      text: "Within the treatment period, the client will reduce symptoms linked to relationship stressors.",
      timeframe: "treatment period",
    },
  ],
  MBCT: [
    {
      id: "mbct_mindfulness_practice",
      text: "Within 6 weeks, the client will increase mindfulness practice.",
      timeframe: "6 weeks",
    },
    {
      id: "mbct_reduce_rumination",
      text: "Within 8 weeks, the client will reduce rumination and emotional reactivity.",
      timeframe: "8 weeks",
    },
  ],
  Narrative_Therapy: [
    {
      id: "narrative_reframe",
      text: "Within the treatment period, the client will reframe unhelpful personal narratives.",
      timeframe: "treatment period",
    },
    {
      id: "narrative_strengths",
      text: "Within 8 weeks, the client will identify strengths through narrative exploration.",
      timeframe: "8 weeks",
    },
  ],
  Occupational_Therapy: [
    {
      id: "ot_daily_routines",
      text: "Within 6 weeks, the client will improve engagement in daily routines.",
      timeframe: "6 weeks",
    },
    {
      id: "ot_functional_strategies",
      text: "Within 8 weeks, the client will develop adaptive functional strategies.",
      timeframe: "8 weeks",
    },
  ],
  Psychoeducational_Groups: [
    {
      id: "psychoed_understanding",
      text: "Within the group program, the client will increase understanding of symptoms and coping skills.",
      timeframe: "group program",
    },
    {
      id: "psychoed_apply_strategies",
      text: "By completion, the client will apply learned strategies outside sessions.",
      timeframe: "completion",
    },
  ],
  Psychodynamic_Therapy: [
    {
      id: "psychodynamic_insight",
      text: "Within the treatment period, the client will increase insight into emotional patterns.",
      timeframe: "treatment period",
    },
    {
      id: "psychodynamic_self_awareness",
      text: "Within 8 weeks, the client will demonstrate increased self-awareness.",
      timeframe: "8 weeks",
    },
  ],
  Play_Therapy: [
    {
      id: "play_emotional_expression",
      text: "Within the treatment period, the client will express emotions through play-based interventions.",
      timeframe: "treatment period",
    },
    {
      id: "play_emotional_regulation",
      text: "Within 8 weeks, the client will demonstrate improved emotional regulation.",
      timeframe: "8 weeks",
    },
  ],
  SFBT: [
    {
      id: "sfbt_solution_strategies",
      text: "Within 4–6 weeks, the client will identify and apply solution-focused strategies.",
      timeframe: "4-6 weeks",
    },
    {
      id: "sfbt_progress",
      text: "Within the treatment period, the client will demonstrate progress toward identified goals.",
      timeframe: "treatment period",
    },
  ],
  Support_Group: [
    {
      id: "support_connection",
      text: "Within the support group period, the client will increase sense of connection.",
      timeframe: "support group period",
    },
    {
      id: "support_peer_supports",
      text: "Within 4–6 weeks, the client will identify peer or community supports.",
      timeframe: "4-6 weeks",
    },
  ],
  TF_CBT: [
    {
      id: "tf_cbt_reduce_symptoms",
      text: "Within 8–12 weeks, the client will reduce trauma-related symptoms.",
      timeframe: "8-12 weeks",
    },
    {
      id: "tf_cbt_coping_strategies",
      text: "Within the treatment period, the client will develop coping strategies for trauma reminders.",
      timeframe: "treatment period",
    },
  ],
};

/**
 * Maps service codes to goal library keys
 * Only includes service codes that are actively used in the system
 */
export const SERVICE_TO_GOAL_LIBRARY_MAP = {
  // Program-Based Services
  OTR_ST: "OTR",                      // OTR Standard Treatment
  OTR_TS: "OTR_Transition",           // OTR Transition Session
  RTW: "RTW",                         // RTW Int Treatment Session
  RWT_EXTNS: "RTW_Extension",         // RTW Extns Treatment
  RS: "Resiliency",                   // Resiliency Session
  STT: "Transition",                  // Short Transition Treatment
  ST: "Supplemental",                 // Supplemental Treatment
  
  // Pre-Therapy Consultation (no specific goal library)
  PTC: null,
  
  // Modality/Treatment-Based Services
  ACT: "ACT",                         // Acceptance And Commitment Therapy
  AT: "Art_Therapy",                  // Art Therapy
  BA: "Behavioral_Activation",        // Behavioral Activation
  CBT: "CBT",                         // Cognitive Behavioural Therapy
  CT: "Cognitive_Therapy",            // Cognitive Therapy
  DBT: "DBT",                         // Dialectical Behavior Therapy
  EFT: "EFT",                         // Emotionally Focused Therapy
  EMDR: "EMDR",                       // Eye Movement Desensitization And Reprocessing
  FST: "Family_Systems",              // Family Systems Therapy
  GCBT: "Group_CBT",                  // Group CBT
  GM: "Gottman_Method",               // Gottman Method
  IPT: "IPT",                         // Interpersonal Psychotherapy
  MBCT: "MBCT",                       // Mindfulness-Based Cognitive Therapy
  NT: "Narrative_Therapy",            // Narrative Therapy
  OT: "Occupational_Therapy",         // Occupational Therapy
  PG: "Psychoeducational_Groups",     // Psychoeducational Groups
  PST: "Psychodynamic_Therapy",       // Psychodynamic Therapy
  PT: "Play_Therapy",                 // Play Therapy
  SFBT: "SFBT",                       // Solution Focused Brief Therapy
  SG: "Support_Group",                // Support Group
  TF_CBT: "TF_CBT",                   // Trauma-Focused CBT
};

/**
 * Get goals for a service code
 * @param {string} serviceCodeOrName - The service code (e.g., "OTR_ST", "CBT", "PT")
 * @returns {Array} Array of goal objects with id, text, and timeframe
 */
export const getGoalsForService = (serviceCodeOrName) => {
  if (!serviceCodeOrName) return [];

  // Normalize the input (uppercase, handle spaces/dashes)
  const normalized = String(serviceCodeOrName)
    .toUpperCase()
    .replace(/[\s-]/g, "_")
    .trim();

  // Check if service code exists in the map
  if (normalized in SERVICE_TO_GOAL_LIBRARY_MAP) {
    const libraryKey = SERVICE_TO_GOAL_LIBRARY_MAP[normalized];
    
    // Handle service codes with no goal library (e.g., PTC)
    if (libraryKey === null) {
      return [];
    }
    
    // Get goals from either program-based or modality-based libraries
    const goals = PROGRAM_GOAL_LIBRARIES[libraryKey] || MODALITY_GOAL_LIBRARIES[libraryKey];
    return goals || [];
  }

  // No match found
  return [];
};

/**
 * Get all available goal libraries (for dropdown options)
 */
export const getAllGoalLibraries = () => {
  return {
    ...PROGRAM_GOAL_LIBRARIES,
    ...MODALITY_GOAL_LIBRARIES,
  };
};

