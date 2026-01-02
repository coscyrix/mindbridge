import React, { useState, useEffect, useMemo, useRef } from "react";
import { FormProvider, Controller } from "react-hook-form";
import CustomTextArea from "../../../CustomTextArea";
import Button from "../../../Button";
import styles from "./SmartGoals.module.scss";
import Spinner from "../../../common/Spinner";
import { getGoalsForService } from "./smartGoalsConstants";
import CommonServices from "../../../../services/CommonServices";
import { toast } from "react-toastify";
import useZodForm from "../../../../utils/hooks/useZodForm";
import { useMutationData } from "../../../../utils/hooks/useMutationData";
import { z } from "zod";

// Zod schema for form validation
const smartGoalSchema = z.object({
  libraryGoalId: z.string().optional(),
  libraryGoal: z.string().optional(),
  goalWording: z.string().optional(),
  measurementMethod: z.string().default("selfReport"),
  clinicianAction: z.string().optional(),
  programAlignment: z.string().default("locked"),
  systemOutput: z.string().optional(),
  expectationMet: z.boolean().optional(),
});

const SmartGoals = ({
  smartGoalsData,
  loading,
  serviceCode,
  serviceName,
  session_id,
  client_id,
  feedback_id,
  onClose,
}) => {
  const methods = useZodForm(smartGoalSchema, undefined, {
    libraryGoalId: "",
    libraryGoal: "",
    goalWording: "",
    measurementMethod: "selfReport",
    clinicianAction: "",
    programAlignment: "locked",
    systemOutput: "",
    expectationMet: undefined,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [clientGoalData, setClientGoalData] = useState(null);

  const watchedValues = methods.watch();

  // Ref to track if we're updating from library goal selection (to prevent timeframe effect from triggering)
  const isUpdatingFromLibrary = useRef(false);

  // Mutation for submitting/updating smart goals
  const { mutate: submitSmartGoal, isPending: isSubmitting } = useMutationData(
    ["submit-smart-goal"],
    async (payload: any) => {
      if (payload.feedback_id) {
        return await CommonServices.updateSMARTGoalForm(payload);
      } else {
        return await CommonServices.submitSMARTGoalForm(payload);
      }
    },
    undefined,
    () => {
      if (methods.getValues("clinicianAction") === "approveAndLock") {
        setIsLocked(true);
      }
      if (onClose && typeof onClose === "function") {
        setTimeout(() => onClose(), 500);
      }
    }
  );

  // Populate form with existing data from smartGoalsData
  useEffect(() => {
    if (smartGoalsData && !loading) {
      const records = Array.isArray(smartGoalsData?.rec)
        ? smartGoalsData.rec
        : smartGoalsData?.rec
        ? [smartGoalsData.rec]
        : [];

      if (records.length > 0) {
        let feedbackRec = null;

        // If session_id is provided, filter by that session_id first
        if (session_id) {
          const currentSessionId = Number(session_id);
          // Filter records matching the current session_id
          const sessionRecords = records.filter(
            (rec) => Number(rec.session_id) === currentSessionId
          );

          if (sessionRecords.length > 0) {
            // Sort by created_at descending (latest first), then by updated_at descending
            sessionRecords.sort((a, b) => {
              const dateA = new Date(
                a.created_at || a.updated_at || 0
              ).getTime();
              const dateB = new Date(
                b.created_at || b.updated_at || 0
              ).getTime();
              return dateB - dateA; // Descending order (latest first)
            });
            feedbackRec = sessionRecords[0]; // Get the latest record for this session
          }
        }

        // If no session_id provided or no matching records found, get the latest record overall
        if (!feedbackRec) {
          records.sort((a, b) => {
            const dateA = new Date(a.created_at || a.updated_at || 0).getTime();
            const dateB = new Date(b.created_at || b.updated_at || 0).getTime();
            return dateB - dateA; // Descending order (latest first)
          });
          feedbackRec = records[0];
        }

        if (feedbackRec) {
          // Get client goal data from feedback_smart_client_goal
          let clientGoal = null;
          if (Array.isArray(feedbackRec.feedback_smart_client_goal)) {
            if (feedbackRec.feedback_smart_client_goal.length > 0) {
              const sorted = [...feedbackRec.feedback_smart_client_goal].sort(
                (a, b) => {
                  const dateA = new Date(
                    a.created_at || a.updated_at || 0
                  ).getTime();
                  const dateB = new Date(
                    b.created_at || b.updated_at || 0
                  ).getTime();
                  return dateB - dateA;
                }
              );
              clientGoal = sorted[0];
            }
          } else if (feedbackRec.feedback_smart_client_goal) {
            clientGoal = feedbackRec.feedback_smart_client_goal;
          }

          // Set client goal data for display
          setClientGoalData(clientGoal);

          // Get smart goal data from feedback record
          // Handle both array and single object cases, and if array, get the latest one
          let smartGoalData = null;
          if (Array.isArray(feedbackRec.feedback_smart_goal)) {
            if (feedbackRec.feedback_smart_goal.length > 0) {
              // If multiple smart goal entries, sort by created_at/updated_at and get latest
              const sorted = [...feedbackRec.feedback_smart_goal].sort(
                (a, b) => {
                  const dateA = new Date(
                    a.created_at || a.updated_at || 0
                  ).getTime();
                  const dateB = new Date(
                    b.created_at || b.updated_at || 0
                  ).getTime();
                  return dateB - dateA; // Descending order (latest first)
                }
              );
              smartGoalData = sorted[0];
            }
          } else if (feedbackRec.feedback_smart_goal) {
            smartGoalData = feedbackRec.feedback_smart_goal;
          }

          if (smartGoalData) {
            // Set flag to prevent library goal selection from triggering
            isUpdatingFromLibrary.current = true;

            // Prepare form data object
            // Handle expectation_met: convert 0/1 to boolean, or keep undefined if null
            let expectationMetValue = undefined;
            if (
              smartGoalData.expectation_met !== undefined &&
              smartGoalData.expectation_met !== null
            ) {
              // Convert 0/1 to boolean, or use boolean value directly
              expectationMetValue =
                smartGoalData.expectation_met === 1 ||
                smartGoalData.expectation_met === true;
            }

            const formData = {
              libraryGoalId: smartGoalData.library_goal_id || "",
              libraryGoal: smartGoalData.library_goal || "",
              goalWording: smartGoalData.goal_wording || "",
              measurementMethod:
                smartGoalData.measurement_method || "selfReport",
              clinicianAction: smartGoalData.clinician_action || "",
              programAlignment: smartGoalData.program_alignment || "locked",
              expectationMet: expectationMetValue,
            };

            // Populate form fields (use reset to ensure all fields are properly set)
            methods.reset(formData);

            // Set locked state if goal is locked
            if (
              smartGoalData.is_locked === true ||
              smartGoalData.is_locked === 1
            ) {
              setIsLocked(true);
              // If locked, also set clinicianAction to approveAndLock to reflect the state
              if (!smartGoalData.clinician_action) {
                methods.setValue("clinicianAction", "approveAndLock");
              }
            } else {
              setIsLocked(false);
            }

            // Reset flag after a brief delay
            setTimeout(() => {
              isUpdatingFromLibrary.current = false;
            }, 100);
          } else {
            console.log("SmartGoals: No smartGoalData found in feedbackRec");
            // If no smart goal data found, reset to defaults
            setIsLocked(false);
          }
        } else {
          console.log("SmartGoals: No feedbackRec found");
        }
      } else {
        console.log("SmartGoals: No records found in smartGoalsData");
      }
    } else {
      console.log("SmartGoals: useEffect condition not met", {
        hasSmartGoalsData: !!smartGoalsData,
        loading,
        session_id,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [smartGoalsData, loading, session_id]);

  // Get filtered goals based on service
  const availableGoals = useMemo(() => {
    const serviceIdentifier = serviceCode || serviceName;
    return getGoalsForService(serviceIdentifier);
  }, [serviceCode, serviceName]);

  // When library goal is selected, update the draft
  useEffect(() => {
    // Skip if we're updating from data population
    if (isUpdatingFromLibrary.current) {
      return;
    }

    if (watchedValues.libraryGoalId) {
      const selectedGoal = availableGoals.find(
        (goal) => goal.id === watchedValues.libraryGoalId
      );
      if (selectedGoal) {
        isUpdatingFromLibrary.current = true;
        methods.setValue("libraryGoal", selectedGoal.text);
        methods.setValue("goalWording", selectedGoal.text);
        // Reset flag after a brief delay to allow form values to update
        setTimeout(() => {
          isUpdatingFromLibrary.current = false;
        }, 100);
      }
    } else if (!watchedValues.libraryGoalId) {
      // Clear values if no goal is chosen
      methods.setValue("libraryGoal", "");
      methods.setValue("goalWording", "");
    }
  }, [watchedValues.libraryGoalId, availableGoals, methods]);

  const measurementMethods = [
    { id: "selfReport", label: "Self-report" },
    { id: "symptomScale", label: "Symptom scale" },
    { id: "functionalTolerance", label: "Functional tolerance" },
    { id: "sessionObservation", label: "Session observation" },
  ];

  // Update isEditing based on clinicianAction
  useEffect(() => {
    setIsEditing(watchedValues.clinicianAction === "editWording" && !isLocked);
  }, [watchedValues.clinicianAction, isLocked]);

  // Generate final goal text based on current values
  // System output updates automatically when goalWording changes
  const finalGoalText = useMemo(() => {
    return watchedValues.goalWording || "";
  }, [watchedValues.goalWording]);

  // Update systemOutput form field when finalGoalText changes
  useEffect(() => {
    methods.setValue("systemOutput", finalGoalText);
  }, [finalGoalText, methods]);

  // Helper function to get feedback record from smartGoalsData
  const getFeedbackRecord = () => {
    const records = Array.isArray(smartGoalsData?.rec)
      ? smartGoalsData.rec
      : smartGoalsData?.rec
      ? [smartGoalsData.rec]
      : [];

    if (records.length === 0) return null;

    const currentSessionId = Number(session_id);
    const sessionRecords = records.filter(
      (rec) => Number(rec.session_id) === currentSessionId
    );

    if (sessionRecords.length > 0) {
      sessionRecords.sort((a, b) => {
        const dateA = new Date(a.created_at || a.updated_at || 0).getTime();
        const dateB = new Date(b.created_at || b.updated_at || 0).getTime();
        return dateB - dateA;
      });
      return sessionRecords[0];
    }

    records.sort((a, b) => {
      const dateA = new Date(a.created_at || a.updated_at || 0).getTime();
      const dateB = new Date(b.created_at || b.updated_at || 0).getTime();
      return dateB - dateA;
    });
    return records[0];
  };

  // Handle form submission
  const handleFormSubmit = (formData: any) => {
    const feedbackRec = getFeedbackRecord();
    const effectiveSessionId = feedbackRec?.session_id || session_id;
    const effectiveClientId = feedbackRec?.client_id || client_id;
    const existingFeedbackId = feedbackRec?.feedback_id || feedback_id;

    if (!effectiveSessionId || !effectiveClientId) {
      toast.error("Missing session ID or client ID. Cannot submit form.");
      return;
    }

    const payload: any = {
      session_id: Number(effectiveSessionId),
      client_id: Number(effectiveClientId),
      goal_source: "library",
      library_goal_id: formData.libraryGoalId || null,
      library_goal: formData.libraryGoal || null,
      goal_wording: formData.goalWording || null,
      measurement_method: formData.measurementMethod || null,
      clinician_action: formData.clinicianAction || null,
      program_alignment: formData.programAlignment || "locked",
      is_locked: formData.clinicianAction === "approveAndLock",
      expectation_met:
        formData.expectationMet !== undefined ? formData.expectationMet : null,
    };

    if (existingFeedbackId) {
      payload.feedback_id = Number(existingFeedbackId);
    }

    submitSmartGoal(payload);
  };

  // Handle form validation errors
  const handleFormError = (errors: any) => {
    const errorMessages = Object.values(errors)
      .map((error: any) => {
        if (error?.message) return error.message;
        if (typeof error === "string") return error;
        return null;
      })
      .filter(Boolean);

    if (errorMessages.length > 0) {
      toast.error(errorMessages[0]);
    } else {
      toast.error("Please fill in all required fields");
    }
  };

  return (
    <div className={styles["smart-goal-data-container"]}>
      {loading ? (
        <div className={styles["loading-container"]}>
          <Spinner color="#525252" />
        </div>
      ) : (
        <FormProvider {...methods}>
          <form className={styles["smart-goal-form"]}>
            {/* Client's Goal Expectations Card */}
            {clientGoalData && (
              <div className={styles["card"]}>
                <div className={styles["section-header"]}>
                  <h3 className={styles["section-title"]}>
                    Client's Goal Expectations
                  </h3>
                  <span
                    className={`${styles["section-badge"]} ${styles["client-input"]}`}
                  >
                    Client Input
                  </span>
                </div>
                <div className={styles["fields-grid"]}>
                  <div className={styles["field-row"]}>
                    <div className={styles["field-header"]}>
                      <span className={styles["field-label"]}>Goal Theme</span>
                    </div>
                    <div className={styles["field-value"]}>
                      {clientGoalData.client_goal_theme
                        ?.replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase()) ||
                        "Not specified"}
                    </div>
                  </div>
                  {clientGoalData.goal_theme_other &&
                    clientGoalData.goal_theme_other.trim() !== "" && (
                      <div className={styles["field-row"]}>
                        <div className={styles["field-header"]}>
                          <span className={styles["field-label"]}>
                            Other Goal Details
                          </span>
                        </div>
                        <div className={styles["field-value"]}>
                          {clientGoalData.goal_theme_other}
                        </div>
                      </div>
                    )}
                  <div className={styles["field-row"]}>
                    <div className={styles["field-header"]}>
                      <span className={styles["field-label"]}>Timeframe</span>
                    </div>
                    <div className={styles["field-value"]}>
                      {clientGoalData.timeframe
                        ?.replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase()) ||
                        "Not specified"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Smart Goal Card */}
            {!isLocked && (
              <div className={`${styles["card"]} ${styles["smart-goal-card"]}`}>
                <div className={styles["section-header"]}>
                  <h3 className={styles["section-title"]}>Smart Goal</h3>
                  <span
                    className={`${styles["section-badge"]} ${styles["editable"]}`}
                  >
                    Clinician Control
                  </span>
                </div>
                <div className={styles["library-selector"]}>
                  <label htmlFor="library-goal-dropdown">
                    Select Library Goal
                  </label>
                  <Controller
                    name="libraryGoalId"
                    control={methods.control}
                    render={({ field }) => (
                      <select
                        {...field}
                        id="library-goal-dropdown"
                        disabled={isLocked}
                      >
                        <option value="">-- Select a goal --</option>
                        {availableGoals.map((goal) => (
                          <option key={goal.id} value={goal.id}>
                            {goal.text}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  {availableGoals.length === 0 && (
                    <div className={styles["empty-state"]}>
                      No goals available for this service type.
                    </div>
                  )}
                </div>
                <div className={styles["fields-grid"]}>
                  <div className={styles["field-row"]}>
                    <div className={styles["field-header"]}>
                      <span className={styles["field-label"]}>
                        Goal Wording
                      </span>
                    </div>
                    <CustomTextArea
                      name="goalWording"
                      label=""
                      control={methods.control}
                      rows={4}
                      disabled={!isEditing && !isLocked}
                      isError={false}
                      helperText=""
                    />
                  </div>
                  <div className={styles["field-row"]}>
                    <div className={styles["field-header"]}>
                      <span className={styles["field-label"]}>
                        Measurement Method
                      </span>
                    </div>
                    {!isLocked && (
                      <div className={styles["methods-grid"]}>
                        {measurementMethods.map((method) => (
                          <div
                            key={method.id}
                            className={styles["method-item"]}
                            data-selected={
                              watchedValues.measurementMethod === method.id
                            }
                            onClick={() =>
                              !isLocked &&
                              methods.setValue("measurementMethod", method.id)
                            }
                          >
                            <Controller
                              name="measurementMethod"
                              control={methods.control}
                              render={({ field }) => (
                                <>
                                  <input
                                    type="radio"
                                    id={method.id}
                                    {...field}
                                    value={method.id}
                                    checked={field.value === method.id}
                                    disabled={isLocked}
                                    onChange={() => field.onChange(method.id)}
                                  />
                                  <div className={styles["option-content"]}>
                                    <div
                                      className={styles["radio-indicator"]}
                                    ></div>
                                    <label
                                      htmlFor={method.id}
                                      className={styles["option-label"]}
                                    >
                                      {method.label}
                                    </label>
                                  </div>
                                </>
                              )}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* <div className={styles["field-row"]}>
                    <div className={styles["field-header"]}>
                      <span className={styles["field-label"]}>
                        Program Alignment
                      </span>
                      <span
                        className={`${styles["section-badge"]} ${styles["locked"]}`}
                      >
                        Locked
                      </span>
                    </div>
                  </div> */}
                </div>
              </div>
            )}

            {/* Actions Card */}
            {!isLocked && (
              <div className={`${styles["card"]} ${styles["actions-card"]}`}>
                <div className={styles["section-header"]}>
                  <h3 className={styles["section-title"]}>Clinician Actions</h3>
                </div>
                <div className={styles["source-options"]}>
                  <div
                    className={styles["source-option"]}
                    data-selected={
                      watchedValues.clinicianAction === "editWording"
                    }
                    onClick={() =>
                      !isLocked &&
                      methods.setValue("clinicianAction", "editWording")
                    }
                  >
                    <Controller
                      name="clinicianAction"
                      control={methods.control}
                      render={({ field }) => (
                        <>
                          <input
                            type="radio"
                            id="edit_wording"
                            {...field}
                            value="editWording"
                            checked={field.value === "editWording"}
                            disabled={isLocked}
                          />
                          <div className={styles["option-content"]}>
                            <div className={styles["radio-indicator"]}></div>
                            <label
                              htmlFor="edit_wording"
                              className={styles["option-label"]}
                            >
                              Enable Editing for Goal Wording
                            </label>
                          </div>
                        </>
                      )}
                    />
                  </div>
                  <div
                    className={styles["source-option"]}
                    data-selected={
                      watchedValues.clinicianAction === "approveAndLock"
                    }
                    onClick={() =>
                      !isLocked &&
                      methods.setValue("clinicianAction", "approveAndLock")
                    }
                  >
                    <Controller
                      name="clinicianAction"
                      control={methods.control}
                      render={({ field }) => (
                        <>
                          <input
                            type="radio"
                            id="approve_and_lock"
                            {...field}
                            value="approveAndLock"
                            checked={field.value === "approveAndLock"}
                            disabled={isLocked}
                          />
                          <div className={styles["option-content"]}>
                            <div className={styles["radio-indicator"]}></div>
                            <label
                              htmlFor="approve_and_lock"
                              className={styles["option-label"]}
                            >
                              Approve and Lock Goal
                            </label>
                          </div>
                        </>
                      )}
                    />
                  </div>
                </div>
                {watchedValues.clinicianAction === "approveAndLock" && (
                  <div className={styles["action-info"]}>
                    <p>
                      Once approved, this goal becomes read-only and is used for
                      treatment planning, progress notes, and reporting.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* System Output Card */}
            <div
              className={`${styles["card"]} ${styles["system-output-card"]}`}
            >
              <div className={styles["section-header"]}>
                <h3 className={styles["section-title"]}>System Output</h3>
                <span
                  className={`${styles["section-badge"]} ${styles["locked"]}`}
                >
                  Stored & Reported
                </span>
              </div>
              <div className={styles["output-content"]}>
                <CustomTextArea
                  name="systemOutput"
                  label=""
                  control={methods.control}
                  rows={4}
                  disabled={true}
                  isError={false}
                  helperText=""
                />
              </div>
            </div>

            {/* Expectation Met Card */}
            {!isLocked && (
              <div
                className={`${styles["card"]} ${styles["expectation-met-card"]}`}
              >
                <div className={styles["section-header"]}>
                  <h3 className={styles["section-title"]}>Expectations Met</h3>
                </div>
                <div className={styles["source-options"]}>
                  <div
                    className={styles["source-option"]}
                    data-selected={
                      watchedValues.expectationMet === true ? "true" : "false"
                    }
                    onClick={() =>
                      !isLocked && methods.setValue("expectationMet", true)
                    }
                  >
                    <Controller
                      name="expectationMet"
                      control={methods.control}
                      render={({ field }) => (
                        <>
                          <input
                            type="radio"
                            id="expectation_met_yes"
                            checked={field.value === true}
                            disabled={isLocked}
                            onChange={() => field.onChange(true)}
                          />
                          <div className={styles["option-content"]}>
                            <div className={styles["radio-indicator"]}></div>
                            <label
                              htmlFor="expectation_met_yes"
                              className={styles["option-label"]}
                            >
                              YES
                            </label>
                          </div>
                        </>
                      )}
                    />
                  </div>
                  <div
                    className={styles["source-option"]}
                    data-selected={
                      watchedValues.expectationMet === false ? "true" : "false"
                    }
                    onClick={() =>
                      !isLocked && methods.setValue("expectationMet", false)
                    }
                  >
                    <Controller
                      name="expectationMet"
                      control={methods.control}
                      render={({ field }) => (
                        <>
                          <input
                            type="radio"
                            id="expectation_met_no"
                            checked={field.value === false}
                            disabled={isLocked}
                            onChange={() => field.onChange(false)}
                          />
                          <div className={styles["option-content"]}>
                            <div className={styles["radio-indicator"]}></div>
                            <label
                              htmlFor="expectation_met_no"
                              className={styles["option-label"]}
                            >
                              NO
                            </label>
                          </div>
                        </>
                      )}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            {!isLocked && (
              <div className={styles["submit-button-wrapper"]}>
                <Button
                  type="submit"
                  variant="primary"
                  size="large"
                  disabled={isSubmitting}
                  onClick={(e) => {
                    e.preventDefault();
                    methods.handleSubmit(handleFormSubmit, handleFormError)();
                  }}
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              </div>
            )}
          </form>
        </FormProvider>
      )}
    </div>
  );
};

export default SmartGoals;
