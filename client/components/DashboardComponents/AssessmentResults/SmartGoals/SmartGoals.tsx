import React, { useState, useEffect, useMemo, useRef } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import CustomMultiSelect from "../../../CustomMultiSelect";
import CustomInputField from "../../../CustomInputField";
import CustomTextArea from "../../../CustomTextArea";
import Button from "../../../Button";
import styles from "./SmartGoals.module.scss";
import Spinner from "../../../common/Spinner";
import { getGoalsForService } from "./smartGoalsConstants";
import CommonServices from "../../../../services/CommonServices";
import { toast } from "react-toastify";

const SmartGoals = ({ smartGoalsData, loading, serviceCode, serviceName, session_id, client_id, feedback_id, onClose }) => {
  const methods = useForm({
    defaultValues: {
      goalSource: "library", // "library" or "client_defined"
      libraryGoalId: "",
      libraryGoal: "",
      timeframe: "",
      goalWording: "",
      measurementMethod: "selfReport", // Changed to single value instead of object
      clinicianAction: "", // "editWording" or "approveAndLock" - radio button selection
      programAlignment: "locked",
      systemOutput: "", // System output field (read-only display)
    },
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const watchedValues = methods.watch();
  
  // Ref to track if we're updating from library goal selection (to prevent timeframe effect from triggering)
  const isUpdatingFromLibrary = useRef(false);

  // Populate form with existing data from smartGoalsData
  useEffect(() => {
    if (smartGoalsData && !loading) {
      const records = Array.isArray(smartGoalsData?.rec) 
        ? smartGoalsData.rec 
        : smartGoalsData?.rec ? [smartGoalsData.rec] : [];
      
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
              const dateA = new Date(a.created_at || a.updated_at || 0).getTime();
              const dateB = new Date(b.created_at || b.updated_at || 0).getTime();
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
          // Get smart goal data from feedback record
          // Handle both array and single object cases, and if array, get the latest one
          let smartGoalData = null;
          if (Array.isArray(feedbackRec.feedback_smart_goal)) {
            if (feedbackRec.feedback_smart_goal.length > 0) {
              // If multiple smart goal entries, sort by created_at/updated_at and get latest
              const sorted = [...feedbackRec.feedback_smart_goal].sort((a, b) => {
                const dateA = new Date(a.created_at || a.updated_at || 0).getTime();
                const dateB = new Date(b.created_at || b.updated_at || 0).getTime();
                return dateB - dateA; // Descending order (latest first)
              });
              smartGoalData = sorted[0];
            }
          } else if (feedbackRec.feedback_smart_goal) {
            smartGoalData = feedbackRec.feedback_smart_goal;
          }

          if (smartGoalData) {
            // Set flag to prevent library goal selection from triggering
            isUpdatingFromLibrary.current = true;

            // Prepare form data object
            const formData = {
              goalSource: smartGoalData.goal_source || "library",
              libraryGoalId: smartGoalData.library_goal_id || "",
              libraryGoal: smartGoalData.library_goal || "",
              timeframe: smartGoalData.timeframe || "",
              goalWording: smartGoalData.goal_wording || "",
              measurementMethod: smartGoalData.measurement_method || "selfReport",
              clinicianAction: smartGoalData.clinician_action || "",
              programAlignment: smartGoalData.program_alignment || "locked",
            };

            console.log("SmartGoals: Populating form with data:", {
              session_id_from_props: session_id,
              selected_feedbackRec_session_id: feedbackRec.session_id,
              feedback_id: feedbackRec.feedback_id,
              smartGoalData,
              formData,
            });

            // Populate form fields (use reset to ensure all fields are properly set)
            methods.reset(formData);

            // Set locked state if goal is locked
            if (smartGoalData.is_locked === true || smartGoalData.is_locked === 1) {
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

    if (watchedValues.goalSource === "library" && watchedValues.libraryGoalId) {
      const selectedGoal = availableGoals.find(
        (goal) => goal.id === watchedValues.libraryGoalId
      );
      if (selectedGoal) {
        isUpdatingFromLibrary.current = true;
        methods.setValue("libraryGoal", selectedGoal.text);
        methods.setValue("goalWording", selectedGoal.text);
        if (selectedGoal.timeframe) {
          methods.setValue("timeframe", selectedGoal.timeframe);
        }
        // Reset flag after a brief delay to allow form values to update
        setTimeout(() => {
          isUpdatingFromLibrary.current = false;
        }, 100);
      }
    } else if (watchedValues.goalSource === "library" && !watchedValues.libraryGoalId) {
      // Clear values if library is selected but no goal is chosen
      methods.setValue("libraryGoal", "");
      methods.setValue("goalWording", "");
    }
  }, [watchedValues.libraryGoalId, watchedValues.goalSource, availableGoals, methods]);

  // When timeframe changes, update goal wording to include the new timeframe
  useEffect(() => {
    // Skip if updating from library goal selection
    if (isUpdatingFromLibrary.current || isLocked) {
      return;
    }

    const currentGoalWording = watchedValues.goalWording || "";
    const newTimeframe = watchedValues.timeframe?.trim();

    // Only proceed if we have both timeframe and goal wording
    if (!newTimeframe || !currentGoalWording) {
      return;
    }

    // Function to update goal wording with new timeframe
    const updateGoalWordingWithTimeframe = (goalText, timeframe) => {
      // Pattern to match "Within [timeframe], " or "Within [timeframe] " at the start
      const timeframePattern = /^Within\s+[^,]+(,\s*|\s+)/i;
      
      if (timeframePattern.test(goalText)) {
        // Replace existing timeframe
        return goalText.replace(timeframePattern, `Within ${timeframe}, `);
      } else {
        // Prepend timeframe if not present
        return `Within ${timeframe}, ${goalText}`;
      }
    };

    const updatedGoalWording = updateGoalWordingWithTimeframe(currentGoalWording, newTimeframe);
    
    // Only update if the text actually changed
    if (updatedGoalWording !== currentGoalWording) {
      methods.setValue("goalWording", updatedGoalWording, { shouldDirty: true });
    }
  }, [watchedValues.timeframe, watchedValues.goalWording, isLocked, methods]);

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

  return (
    <div className={styles["smart-goal-data-container"]}>
      {loading ? (
        <div className={styles["loading-container"]}>
          <Spinner color="#525252" />
        </div>
      ) : (
        <FormProvider {...methods}>
          <form className={styles["smart-goal-form"]}>
            {/* Goal Source Card */}
            {!isLocked && (
            <div className={`${styles["card"]} ${styles["goal-source-card"]}`}>
              <div className={styles["section-header"]}>
                <h3 className={styles["section-title"]}>Goal Source</h3>
              </div>
              <div className={styles["source-options"]}>
                <div 
                  className={styles["source-option"]}
                  data-selected={watchedValues.goalSource === "library"}
                  onClick={() => !isLocked && methods.setValue("goalSource", "library")}
                >
                  <Controller
                    name="goalSource"
                    control={methods.control}
                    render={({ field }) => (
                      <>
                        <input
                          type="radio"
                          id="library_goal"
                          {...field}
                          value="library"
                          checked={field.value === "library"}
                          disabled={isLocked}
                        />
                        <div className={styles["option-content"]}>
                          <div className={styles["radio-indicator"]}></div>
                          <label htmlFor="library_goal" className={styles["option-label"]}>
                            Library Goal
                          </label>
                        </div>
                      </>
                    )}
                  />
                </div>
                <div 
                  className={styles["source-option"]}
                  data-selected={watchedValues.goalSource === "client_defined"}
                  onClick={() => !isLocked && methods.setValue("goalSource", "client_defined")}
                >
                  <Controller
                    name="goalSource"
                    control={methods.control}
                    render={({ field }) => (
                      <>
                        <input
                          type="radio"
                          id="client_defined_goal"
                          {...field}
                          value="client_defined"
                          checked={field.value === "client_defined"}
                          disabled={isLocked}
                        />
                        <div className={styles["option-content"]}>
                          <div className={styles["radio-indicator"]}></div>
                          <label htmlFor="client_defined_goal" className={styles["option-label"]}>
                            Client-Defined Goal
                          </label>
                        </div>
                      </>
                    )}
                  />
                </div>
              </div>
              {watchedValues.goalSource === "library" && (
                <div className={styles["library-selector"]}>
                  <label htmlFor="library-goal-dropdown">Select Library Goal</label>
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
                      No goals available for this service type. Please select "Client-defined goal" instead.
                    </div>
                  )}
     
                </div>
              )}
            </div>
            )}

            {/* Editable Fields Card */}
            {!isLocked && (
            <div className={`${styles["card"]} ${styles["editable-fields-card"]}`}>
              <div className={styles["section-header"]}>
                <h3 className={styles["section-title"]}>Editable Fields</h3>
                <span className={`${styles["section-badge"]} ${styles["editable"]}`}>Clinician Control</span>
              </div>
              <div className={styles["fields-grid"]}>
                <div className={styles["field-row"]}>
                  <div className={styles["field-header"]}>
                    <span className={styles["field-label"]}>Timeframe</span>
                  </div>
                  <CustomInputField
                    name="timeframe"
                    placeholder="e.g., 6-8 weeks"
                    disabled={isLocked}
                  />
                </div>
                <div className={styles["field-row"]}>
                  <div className={styles["field-header"]}>
                    <span className={styles["field-label"]}>Goal Wording</span>
                  </div>
                  <CustomTextArea
                    name="goalWording"
                    control={methods.control}
                    rows={4}
                    disabled={watchedValues.goalSource !== "client_defined"}
                  />
                </div>
                <div className={styles["field-row"]}>
                  <div className={styles["field-header"]}>
                    <span className={styles["field-label"]}>Measurement Method</span>
                    <span className={`${styles["section-badge"]} ${styles["editable"]}`}>Editable</span>
                  </div>
                  {!isLocked && (
                    <div className={styles["methods-grid"]}>
                      {measurementMethods.map((method) => (
                        <div 
                          key={method.id} 
                          className={styles["method-item"]}
                          data-selected={watchedValues.measurementMethod === method.id}
                          onClick={() => !isLocked && methods.setValue("measurementMethod", method.id)}
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
                                  <div className={styles["radio-indicator"]}></div>
                                  <label htmlFor={method.id} className={styles["option-label"]}>{method.label}</label>
                                </div>
                              </>
                            )}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className={styles["field-row"]}>
                  <div className={styles["field-header"]}>
                    <span className={styles["field-label"]}>Program Alignment</span>
                    <span className={`${styles["section-badge"]} ${styles["locked"]}`}>Locked</span>
                  </div>
                </div>
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
                  data-selected={watchedValues.clinicianAction === "editWording"}
                  onClick={() => !isLocked && methods.setValue("clinicianAction", "editWording")}
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
                          <label htmlFor="edit_wording" className={styles["option-label"]}>
                            Enable Editing for Goal Wording
                          </label>
                        </div>
                      </>
                    )}
                  />
                </div>
                <div 
                  className={styles["source-option"]}
                  data-selected={watchedValues.clinicianAction === "approveAndLock"}
                  onClick={() => !isLocked && methods.setValue("clinicianAction", "approveAndLock")}
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
                          <label htmlFor="approve_and_lock" className={styles["option-label"]}>
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
                    Once approved, this goal becomes read-only and is used for treatment planning, progress notes, and reporting.
                  </p>
                </div>
              )}
            </div>
            )}

            {/* System Output Card */}
            <div className={`${styles["card"]} ${styles["system-output-card"]}`}>
              <div className={styles["section-header"]}>
                <h3 className={styles["section-title"]}>System Output</h3>
                <span className={`${styles["section-badge"]} ${styles["locked"]}`}>Stored & Reported</span>
              </div>
              <div className={styles["output-content"]}>
                <CustomTextArea
                  name="systemOutput"
                  control={methods.control}
                  rows={4}
                  disabled={true}
                />
              </div>
            </div>

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
                  methods.handleSubmit(async (formData) => {
                    setIsSubmitting(true);
                    try {
                      // Extract session_id and client_id from smartGoalsData (most reliable source)
                      // or fallback to props if available
                      const records = Array.isArray(smartGoalsData?.rec) 
                        ? smartGoalsData.rec 
                        : smartGoalsData?.rec ? [smartGoalsData.rec] : [];
                      
                      const currentSessionId = Number(session_id);
                      let feedbackRec = null;
                      
                      if (records.length > 0) {
                        // Filter records matching the current session_id
                        const sessionRecords = records.filter(
                          (rec) => Number(rec.session_id) === currentSessionId
                        );
                        
                        if (sessionRecords.length > 0) {
                          // Sort by created_at descending (latest first), then by updated_at descending
                          sessionRecords.sort((a, b) => {
                            const dateA = new Date(a.created_at || a.updated_at || 0).getTime();
                            const dateB = new Date(b.created_at || b.updated_at || 0).getTime();
                            return dateB - dateA; // Descending order (latest first)
                          });
                          feedbackRec = sessionRecords[0]; // Get the latest record
                        } else {
                          // Fallback: if no matching session_id, get the latest record overall
                          records.sort((a, b) => {
                            const dateA = new Date(a.created_at || a.updated_at || 0).getTime();
                            const dateB = new Date(b.created_at || b.updated_at || 0).getTime();
                            return dateB - dateA; // Descending order (latest first)
                          });
                          feedbackRec = records[0];
                        }
                      }
                      
                      const effectiveSessionId = feedbackRec?.session_id || session_id;
                      const effectiveClientId = feedbackRec?.client_id || client_id;
                      const existingFeedbackId = feedbackRec?.feedback_id || feedback_id;

                      // Final validation - if still missing, show error
                      if (!effectiveSessionId || !effectiveClientId) {
                        console.error("Missing IDs:", {
                          session_id: effectiveSessionId,
                          client_id: effectiveClientId,
                          smartGoalsData,
                          feedbackRec,
                          props: { session_id, client_id }
                        });
                        toast.error("Missing session ID or client ID. Cannot submit form.");
                        setIsSubmitting(false);
                        return;
                      }

                      // Transform camelCase form data to snake_case API format
                      const payload = {
                        session_id: Number(effectiveSessionId),
                        client_id: Number(effectiveClientId),
                        // Client submission fields (these might be empty for clinician-only forms)
                        client_goal_theme: formData.client_goal_theme || "",
                        goal_theme_other: formData.goal_theme_other || "",
                        timeframe: formData.timeframe || "",
                        // Counselor/clinician fields - new schema
                        goal_source: formData.goalSource || null,
                        library_goal_id: formData.libraryGoalId || null,
                        library_goal: formData.libraryGoal || null,
                        goal_wording: formData.goalWording || null,
                        measurement_method: formData.measurementMethod || null,
                        clinician_action: formData.clinicianAction || null,
                        program_alignment: formData.programAlignment || "locked",
                        is_locked: formData.clinicianAction === "approveAndLock",
                      };

                      // Determine if we should update or create

                      let response;
                      if (existingFeedbackId) {
                        // Update existing feedback
                        payload.feedback_id = Number(existingFeedbackId);
                        response = await CommonServices.updateSMARTGoalForm(payload);
                      } else {
                        // Create new feedback
                        response = await CommonServices.submitSMARTGoalForm(payload);
                      }
                      
                      if (response.status === 200) {
                        toast.success(existingFeedbackId ? "Smart Goal updated successfully!" : "Smart Goal submitted successfully!");
                        // Lock the form if approveAndLock was selected
                        if (formData.clinicianAction === "approveAndLock") {
                          setIsLocked(true);
                        }
                        // Close modal after successful submission
                        if (onClose && typeof onClose === "function") {
                          setTimeout(() => {
                            onClose();
                          }, 500); // Small delay to show the success toast
                        }
                      } else {
                        toast.error(response.data?.message || (existingFeedbackId ? "Failed to update Smart Goal" : "Failed to submit Smart Goal"));
                      }
                    } catch (error) {
                      console.error("Error submitting Smart Goal:", error);
                      toast.error(
                        error.response?.data?.message || 
                        error.message || 
                        "An error occurred while submitting the form"
                      );
                    } finally {
                      setIsSubmitting(false);
                    }
                  })();
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
