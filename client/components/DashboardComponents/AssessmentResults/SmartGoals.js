import React, { useState, useEffect, useMemo } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import CustomMultiSelect from "../../CustomMultiSelect";
import CustomInputField from "../../CustomInputField";
import CustomTextArea from "../../CustomTextArea";
import { SmartGoalDataContainer } from "./style";
import Spinner from "../../common/Spinner";
import { getGoalsForService } from "./smartGoalsConstants";

const SmartGoals = ({ smartGoalsData, loading, serviceCode, serviceName }) => {
  const methods = useForm({
    defaultValues: {
      goalSource: "library", // "library" or "client_defined"
      libraryGoalId: "",
      libraryGoal: "",
      smartGoalDraft: "",
      timeframe: "",
      goalWording: "",
      measurementMethod: {
        selfReport: true,
        symptomScale: false,
        functionalTolerance: false,
        sessionObservation: false,
      },
      editWording: false,
      approveAndLock: false,
      programAlignment: "locked",
    },
  });

  const [isApproved, setIsApproved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const watchedValues = methods.watch();
  const isLocked = watchedValues.approveAndLock;

  // Get filtered goals based on service
  const availableGoals = useMemo(() => {
    const serviceIdentifier = serviceCode || serviceName;
    return getGoalsForService(serviceIdentifier);
  }, [serviceCode, serviceName]);

  // When library goal is selected, update the draft
  useEffect(() => {
    if (watchedValues.goalSource === "library" && watchedValues.libraryGoalId) {
      const selectedGoal = availableGoals.find(
        (goal) => goal.id === watchedValues.libraryGoalId
      );
      if (selectedGoal) {
        methods.setValue("libraryGoal", selectedGoal.text);
        methods.setValue("smartGoalDraft", selectedGoal.text);
        methods.setValue("goalWording", selectedGoal.text);
        if (selectedGoal.timeframe) {
          methods.setValue("timeframe", selectedGoal.timeframe);
        }
      }
    } else if (watchedValues.goalSource === "library" && !watchedValues.libraryGoalId) {
      // Clear values if library is selected but no goal is chosen
      methods.setValue("libraryGoal", "");
      methods.setValue("smartGoalDraft", "");
      methods.setValue("goalWording", "");
    }
  }, [watchedValues.libraryGoalId, watchedValues.goalSource, availableGoals, methods]);

  const measurementMethods = [
    { id: "selfReport", label: "Self-report" },
    { id: "symptomScale", label: "Symptom scale" },
    { id: "functionalTolerance", label: "Functional tolerance" },
    { id: "sessionObservation", label: "Session observation" },
  ];

  useEffect(() => {
    setIsEditing(watchedValues.editWording && !isLocked);
  }, [watchedValues.editWording, isLocked]);

  useEffect(() => {
    if (watchedValues.approveAndLock) {
      setIsApproved(true);
      setIsEditing(false);
      methods.setValue("editWording", false);
    }
  }, [watchedValues.approveAndLock, methods]);

  // Generate final goal text based on current values
  const finalGoalText = useMemo(() => {
    if (isLocked) {
      return watchedValues.goalWording || watchedValues.smartGoalDraft || "";
    }
    // If goal wording is set, use it; otherwise use the draft
    return watchedValues.goalWording || watchedValues.smartGoalDraft || "";
  }, [watchedValues, isLocked]);

  return (
    <SmartGoalDataContainer>
      {loading ? (
        <div
          style={{
            width: "100%",
            height: "400px",
            position: "relative",
            top: "45%",
          }}
        >
          <Spinner color="#525252" />
        </div>
      ) : (
        <FormProvider {...methods}>
          <form className="smart-goal-form">
            {/* Goal Source Indicator */}
            <div className="form-section">
              <h3 className="section-title">Goal Source Indicator</h3>
              <div className="goal-source-options">
                <div className="checkbox-option">
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
                        />
                        <label htmlFor="library_goal">Library goal</label>
                      </>
                    )}
                  />
                </div>
                <div className="checkbox-option">
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
                        />
                        <label htmlFor="client_defined_goal">Client-defined goal</label>
                      </>
                    )}
                  />
                </div>
              </div>
              {watchedValues.goalSource === "library" && (
                <div className="library-goal-section" style={{ marginTop: "15px" }}>
                  <label htmlFor="library-goal-dropdown" style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                    Select Library Goal:
                  </label>
                  <Controller
                    name="libraryGoalId"
                    control={methods.control}
                    render={({ field }) => (
                      <select
                        {...field}
                        id="library-goal-dropdown"
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: "1px solid #ccc",
                          borderRadius: "4px",
                          fontSize: "14px",
                          backgroundColor: "#fff",
                          cursor: "pointer",
                        }}
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
                    <p style={{ marginTop: "8px", color: "#666", fontSize: "14px" }}>
                      No goals available for this service type. Please select "Client-defined goal" instead.
                    </p>
                  )}
                  {watchedValues.libraryGoalId && (
                    <div className="library-goal-selected" style={{ marginTop: "12px", padding: "8px", backgroundColor: "#f5f5f5", borderRadius: "4px" }}>
                      <strong>Selected goal:</strong>{" "}
                      {availableGoals.find((g) => g.id === watchedValues.libraryGoalId)?.text || watchedValues.libraryGoal}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* SMART Goal (Auto-Populated Draft) */}
            <div className="form-section">
              <h3 className="section-title">SMART Goal (Auto-Populated Draft)</h3>
              <div className="smart-goal-draft">
                <Controller
                  name="smartGoalDraft"
                  control={methods.control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      rows={3}
                      disabled={true}
                      className="draft-textarea"
                    />
                  )}
                />
              </div>
            </div>

            {/* Editable Fields (Clinician Control) */}
            <div className="form-section">
              <h3 className="section-title">Editable Fields (Clinician Control)</h3>
              <div className="editable-fields-list">
                <div className="field-item">
                  <span className="field-name">Timeframe –</span>
                  <span className="field-status editable">editable</span>
                  {!isLocked && (
                    <CustomInputField
                      name="timeframe"
                      placeholder="e.g., 6-8 weeks"
                      disabled={isLocked}
                    />
                  )}
                </div>
                <div className="field-item">
                  <span className="field-name">Goal wording –</span>
                  <span className="field-status editable">editable</span>
                  {!isLocked && (
                    <CustomTextArea
                      name="goalWording"
                      control={methods.control}
                      rows={3}
                      disabled={isLocked || !isEditing}
                    />
                  )}
                </div>
                <div className="field-item">
                  <span className="field-name">Measurement method –</span>
                  <span className="field-status editable">editable</span>
                </div>
                <div className="field-item">
                  <span className="field-name">Program alignment –</span>
                  <span className="field-status locked">locked</span>
                </div>
              </div>
            </div>

            {/* Measurement Method */}
            <div className="form-section">
              <h3 className="section-title">Measurement Method</h3>
              <div className="measurement-methods">
                {measurementMethods.map((method) => (
                  <div key={method.id} className="checkbox-option">
                    <Controller
                      name={`measurementMethod.${method.id}`}
                      control={methods.control}
                      render={({ field }) => (
                        <>
                          <input
                            type="checkbox"
                            id={method.id}
                            {...field}
                            checked={field.value || false}
                            disabled={isLocked}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                          <label htmlFor={method.id}>{method.label}</label>
                        </>
                      )}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Clinician Actions */}
            <div className="form-section">
              <h3 className="section-title">Clinician Actions</h3>
              <div className="clinician-actions">
                <div className="checkbox-option">
                  <Controller
                    name="editWording"
                    control={methods.control}
                    render={({ field }) => (
                      <>
                        <input
                          type="checkbox"
                          id="edit_wording"
                          {...field}
                          checked={field.value || false}
                          disabled={isLocked}
                          onChange={(e) => {
                            field.onChange(e.target.checked);
                            setIsEditing(e.target.checked);
                          }}
                        />
                        <label htmlFor="edit_wording">Edit wording</label>
                      </>
                    )}
                  />
                </div>
                <div className="checkbox-option">
                  <Controller
                    name="approveAndLock"
                    control={methods.control}
                    render={({ field }) => (
                      <>
                        <input
                          type="checkbox"
                          id="approve_and_lock"
                          {...field}
                          checked={field.value || false}
                          disabled={isApproved}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                        <label htmlFor="approve_and_lock">Approve and lock goal</label>
                      </>
                    )}
                  />
                </div>
                <p className="action-description">
                  Once approved, this goal becomes read-only and is used for
                  treatment planning, progress notes, and reporting.
                </p>
              </div>
            </div>

            {/* SYSTEM OUTPUT (Stored & Reported) */}
            <div className="form-section system-output">
              <h3 className="section-title">SYSTEM OUTPUT (Stored & Reported)</h3>
              <div className="system-output-content">
                <textarea
                  value={finalGoalText}
                  rows={3}
                  disabled={true}
                  readOnly
                  className="output-textarea"
                />
              </div>
            </div>
          </form>
        </FormProvider>
      )}
    </SmartGoalDataContainer>
  );
};

export default SmartGoals;
