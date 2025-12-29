import React, { useEffect, useState } from "react";
import { FormProvider, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import CustomModal from "../../../CustomModal";
import Spinner from "../../../common/Spinner";
import { ProgressReportModalWrapper } from "../style";
import { useQueryData } from "../../../../utils/hooks/useQueryData";
import { useMutationData } from "../../../../utils/hooks/useMutationData";
import useZodForm from "../../../../utils/hooks/useZodForm";
import CustomInputField from "../../../CustomInputField";
import CustomTextArea from "../../../CustomTextArea";
import Button from "../../../Button";
import ReportValidationCheckbox from "./ReportValidationCheckbox";
import styles from "./styles.module.scss";
import { intakeReportSchema } from "./intakeReportValidation";
import { api } from "../../../../utils/auth";
import CommonServices from "../../../../services/CommonServices";
import {
  IntakeReportDataResponse,
  IntakeSymptomsFormState,
  IntakeReportPayload,
} from "./types";

interface IntakeReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionRow: any;
  initialData?: any;
}

const IntakeReportModal: React.FC<IntakeReportModalProps> = ({
  isOpen,
  onClose,
  sessionRow,
  initialData,
}) => {
  const reqId = sessionRow?.thrpy_req_id || initialData?.req_id;
  const sessionId = sessionRow?.session_id;

  // State for symptoms checkboxes (not part of form schema)
  const [symptoms, setSymptoms] = useState<IntakeSymptomsFormState>({
    anxiety: false,
    depression: false,
    stress: false,
    sleepIssues: false,
    moodChanges: false,
    relationshipIssues: false,
  });

  // State for radio button selections (not part of form schema)
  const [previousTherapy, setPreviousTherapy] = useState<string>("");
  const [thoughtsOfSelfHarm, setThoughtsOfSelfHarm] = useState<string>("");
  const [thoughtsOfHarmingOthers, setThoughtsOfHarmingOthers] =
    useState<string>("");

  // State for validation checkbox
  const [isAccepted, setIsAccepted] = useState(false);

  // Initialize form with useZodForm
  const defaultValues = {
    fullName: "",
    phone: "",
    email: "",
    emergencyContact: "",
    reasonForTherapy: "",
    durationOfConcern: "",
    otherSymptoms: "",
    currentMedications: "",
    medicalConditions: "",
    immediateSafetyConcerns: "",
    clinicalImpression: "",
  };

  const methods = useZodForm(
    intakeReportSchema,
    undefined, // No mutation passed - we'll handle it manually
    defaultValues
  );

  const {
    reset,
    control,
    setValue,
    getValues,
    handleSubmit,
    watch,
    formState: { errors },
  } = methods;

  const durationOfConcern = watch("durationOfConcern");

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset(defaultValues);
      setSymptoms({
        anxiety: false,
        depression: false,
        stress: false,
        sleepIssues: false,
        moodChanges: false,
        relationshipIssues: false,
      });
      setPreviousTherapy("");
      setThoughtsOfSelfHarm("");
      setThoughtsOfHarmingOthers("");
      setIsAccepted(false);
    }
  }, [isOpen, reset]);

  // Fetch intake report data - using the new getIntakeReportData endpoint
  const {
    data: intakeReportResponse,
    isPending: isLoadingReport,
    isFetching: isFetchingReport,
  } = useQueryData(
    ["intake-report-data", reqId, sessionId],
    async () => {
      if (!reqId) return null;
      const params: any = { thrpy_req_id: reqId };
      if (sessionId) {
        params.session_id = sessionId;
      }
      try {
        const response = await CommonServices.getIntakeReportData(params);
        return response?.status === 200 && response?.data?.rec
          ? response.data.rec
          : null;
      } catch (error) {
        console.error("Error fetching intake report:", error);
        return null;
      }
    },
    isOpen && !!reqId
  );

  const reportData = intakeReportResponse as IntakeReportDataResponse | null;
  const loading = isLoadingReport || isFetchingReport;

  // Populate form fields when data is loaded
  useEffect(() => {
    if (reportData && !loading) {
      // Handle new format (reportData.report contains the form data)
      if (reportData.report) {
        // Populate client information
        // Use report.client_information if available, fallback to client header
        const clientInfo = reportData.report.client_information;
        const clientHeader = reportData.client;

        setValue(
          "fullName",
          clientInfo?.full_name || clientHeader?.full_name || ""
        );
        setValue("phone", clientInfo?.phone || "");
        setValue("email", clientInfo?.email || "");
        setValue("emergencyContact", clientInfo?.emergency_contact || "");

        // Populate presenting problem
        const presentingProblem = reportData.report.presenting_problem;
        if (presentingProblem) {
          setValue("reasonForTherapy", presentingProblem.reason || "");
          if (presentingProblem.duration) {
            setValue("durationOfConcern", presentingProblem.duration);
          }
        }

        // Populate symptoms
        const symptomsData = reportData.report.symptoms;
        if (symptomsData && Object.keys(symptomsData).length > 0) {
          setSymptoms({
            anxiety: symptomsData.anxiety === true,
            depression: symptomsData.depression === true,
            stress: symptomsData.stress === true,
            sleepIssues: symptomsData.sleep_issues === true,
            moodChanges: symptomsData.mood_changes === true,
            relationshipIssues: symptomsData.relationship_issues === true,
          });
          setValue("otherSymptoms", symptomsData.other || "");
        }

        // Populate mental health history
        const mentalHealthHistory = reportData.report.mental_health_history;
        if (mentalHealthHistory) {
          setPreviousTherapy(mentalHealthHistory.previous_therapy || "");
          setValue(
            "currentMedications",
            mentalHealthHistory.current_medications || ""
          );
          setValue(
            "medicalConditions",
            mentalHealthHistory.medical_conditions || ""
          );
        }

        // Populate safety assessment
        const safetyAssessment = reportData.report.safety_assessment;
        if (safetyAssessment) {
          setThoughtsOfSelfHarm(safetyAssessment.thoughts_of_self_harm || "");
          setThoughtsOfHarmingOthers(
            safetyAssessment.thoughts_of_harming_others || ""
          );
          setValue(
            "immediateSafetyConcerns",
            safetyAssessment.immediate_safety_concerns || ""
          );
        }

        // Populate clinical impression
        if (reportData.report.clinical_impression) {
          setValue("clinicalImpression", reportData.report.clinical_impression);
        }
      }
    }
  }, [reportData, loading, setValue]);

  // Save intake report mutation
  const { mutate: saveIntakeReport, isPending: isSaving } = useMutationData(
    ["saveIntakeReport"],
    async () => {
      const formValues = getValues();

      // Get existing report_id if available
      const existingReportId = reportData?.report_id;

      // The API now supports session_id and will auto-create report if needed
      // Based on the schema, metadata is stored as JSON
      const payload: IntakeReportPayload = {
        // Pass report_id if exists, otherwise pass session_id for auto-creation
        ...(existingReportId
          ? { report_id: existingReportId }
          : {
              session_id: sessionId,
              client_id: sessionRow?.client_id || initialData?.client_id,
              counselor_id:
                sessionRow?.counselor_id || initialData?.counselor_id,
            }),
        metadata: {
          report: {
            client_information: {
              full_name: formValues.fullName,
              phone: formValues.phone || null,
              email: formValues.email || null,
              emergency_contact: formValues.emergencyContact || null,
            },
            presenting_problem: {
              reason: formValues.reasonForTherapy || null,
              duration:
                (formValues.durationOfConcern as
                  | "less_than_1_month"
                  | "1_6_months"
                  | "6_12_months"
                  | "over_1_year") || null,
            },
            symptoms: {
              anxiety: symptoms.anxiety,
              depression: symptoms.depression,
              stress: symptoms.stress,
              sleep_issues: symptoms.sleepIssues,
              mood_changes: symptoms.moodChanges,
              relationship_issues: symptoms.relationshipIssues,
              other: formValues.otherSymptoms || undefined,
            },
            mental_health_history: {
              previous_therapy: (previousTherapy as "yes" | "no") || null,
              current_medications: formValues.currentMedications || null,
              medical_conditions: formValues.medicalConditions || null,
            },
            safety_assessment: {
              thoughts_of_self_harm:
                (thoughtsOfSelfHarm as "no" | "past" | "current") || null,
              thoughts_of_harming_others:
                (thoughtsOfHarmingOthers as "yes" | "no") || null,
              immediate_safety_concerns:
                formValues.immediateSafetyConcerns || null,
            },
            clinical_impression: formValues.clinicalImpression || null,
          },
        },
      };

      const response = await api.post("/report-data/intake", payload);
      return response;
    },
    ["intake-report-data"],
    () => {
      toast.success("Intake report saved successfully");
      onClose();
    }
  );

  const handleSave = () => {
    if (!isAccepted) {
      toast.error(
        "Please confirm that you accept the above information before saving."
      );
      return;
    }

    handleSubmit(
      (data) => {
        saveIntakeReport({});
      },
      (validationErrors) => {
        toast.error("Please fill in all required fields.");
      }
    )();
  };

  const handleSymptomChange = (
    symptom: keyof IntakeSymptomsFormState,
    checked: boolean
  ) => {
    setSymptoms((prev) => ({
      ...prev,
      [symptom]: checked,
    }));
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onRequestClose={onClose}
      title="INTAKE REPORT"
      icon={null}
      customStyles={{ maxWidth: "800px" }}
    >
      {loading ? (
        <ProgressReportModalWrapper>
          <div className="loading-container">
            <Spinner color="#000" width="40px" height="40px" />
            <p className="loading-text">Loading intake report data...</p>
          </div>
        </ProgressReportModalWrapper>
      ) : (
        <ProgressReportModalWrapper className={styles.reportModalWrapper}>
          <FormProvider {...methods}>
            {/* Client Information */}
            <div className={styles.treatmentPlanSection}>
              <h3 className={styles.sectionHeading}>Client Information</h3>
              <div className={styles.formField}>
                <CustomInputField
                  name="fullName"
                  label="Full Name:"
                  type="text"
                  placeholder="Enter full name"
                  validationRules={{}}
                  icon={undefined}
                  helperText={undefined}
                  handleShowPassword={undefined}
                  value={undefined}
                  prefix={undefined}
                />
              </div>
              <div className={styles.formField}>
                <label>Phone:</label>
                <div className="phone-input-wrapper">
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field, fieldState }) => (
                      <>
                        <PhoneInput
                          international
                          defaultCountry="US"
                          value={field.value || ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          className={
                            fieldState.error ? "phone-input-error" : ""
                          }
                          inputProps={{
                            name: "phone",
                            placeholder: "Enter phone number",
                          }}
                        />
                        {fieldState.error && (
                          <span
                            style={{
                              color: "#d32f2f",
                              fontSize: "12px",
                              marginTop: "4px",
                              display: "block",
                            }}
                          >
                            {fieldState.error.message}
                          </span>
                        )}
                      </>
                    )}
                  />
                </div>
              </div>
              <div className={styles.formField}>
                <CustomInputField
                  name="email"
                  label="Email:"
                  type="email"
                  placeholder="Enter email address"
                  validationRules={{}}
                  icon={undefined}
                  helperText={undefined}
                  handleShowPassword={undefined}
                  value={undefined}
                  prefix={undefined}
                />
              </div>
              <div className={styles.formField}>
                <label>Emergency Contact:</label>
                <div className="phone-input-wrapper">
                  <Controller
                    name="emergencyContact"
                    control={control}
                    render={({ field, fieldState }) => (
                      <>
                        <PhoneInput
                          international
                          defaultCountry="US"
                          value={field.value || ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          className={
                            fieldState.error ? "phone-input-error" : ""
                          }
                          inputProps={{
                            name: "emergencyContact",
                            placeholder: "Enter emergency contact phone",
                          }}
                        />
                        {fieldState.error && (
                          <span
                            style={{
                              color: "#d32f2f",
                              fontSize: "12px",
                              marginTop: "4px",
                              display: "block",
                            }}
                          >
                            {fieldState.error.message}
                          </span>
                        )}
                      </>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className={styles.divider}></div>

            {/* Presenting Problem */}
            <div className={styles.treatmentPlanSection}>
              <h3 className={styles.sectionHeading}>Presenting Problem</h3>
              <div className={styles.formField}>
                <CustomTextArea
                  label="Reason for seeking therapy:"
                  name="reasonForTherapy"
                  control={control}
                  isError={!!errors.reasonForTherapy}
                  disabled={false}
                  placeholder="Enter reason for seeking therapy"
                  rows={4}
                  helperText={undefined}
                />
              </div>
              <div className={styles.formField}>
                <label>Duration of concern:</label>
                <div className={styles.radioGroup}>
                  <label>
                    <input
                      type="radio"
                      name="duration"
                      value="less_than_1_month"
                      checked={durationOfConcern === "less_than_1_month"}
                      onChange={(e) =>
                        setValue("durationOfConcern", e.target.value)
                      }
                    />{" "}
                    Less than 1 month
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="duration"
                      value="1_6_months"
                      checked={durationOfConcern === "1_6_months"}
                      onChange={(e) =>
                        setValue("durationOfConcern", e.target.value)
                      }
                    />{" "}
                    1-6 months
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="duration"
                      value="6_12_months"
                      checked={durationOfConcern === "6_12_months"}
                      onChange={(e) =>
                        setValue("durationOfConcern", e.target.value)
                      }
                    />{" "}
                    6-12 months
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="duration"
                      value="over_1_year"
                      checked={durationOfConcern === "over_1_year"}
                      onChange={(e) =>
                        setValue("durationOfConcern", e.target.value)
                      }
                    />{" "}
                    Over 1 year
                  </label>
                </div>
                {errors.durationOfConcern && (
                  <span
                    style={{
                      color: "#d32f2f",
                      fontSize: "12px",
                      marginTop: "4px",
                      display: "block",
                    }}
                  >
                    {errors.durationOfConcern?.message?.toString() ||
                      "Duration of concern is required"}
                  </span>
                )}
              </div>
            </div>

            <div className={styles.divider}></div>

            {/* Symptoms */}
            <div className={styles.treatmentPlanSection}>
              <h3 className={styles.sectionHeading}>Symptoms</h3>
              <div className={styles.checkboxGroup}>
                <label>
                  <input
                    type="checkbox"
                    checked={symptoms.anxiety}
                    onChange={(e) =>
                      handleSymptomChange("anxiety", e.target.checked)
                    }
                  />{" "}
                  Anxiety
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={symptoms.depression}
                    onChange={(e) =>
                      handleSymptomChange("depression", e.target.checked)
                    }
                  />{" "}
                  Depression
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={symptoms.stress}
                    onChange={(e) =>
                      handleSymptomChange("stress", e.target.checked)
                    }
                  />{" "}
                  Stress
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={symptoms.sleepIssues}
                    onChange={(e) =>
                      handleSymptomChange("sleepIssues", e.target.checked)
                    }
                  />{" "}
                  Sleep issues
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={symptoms.moodChanges}
                    onChange={(e) =>
                      handleSymptomChange("moodChanges", e.target.checked)
                    }
                  />{" "}
                  Mood changes
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={symptoms.relationshipIssues}
                    onChange={(e) =>
                      handleSymptomChange(
                        "relationshipIssues",
                        e.target.checked
                      )
                    }
                  />{" "}
                  Relationship issues
                </label>
              </div>
              <div className={styles.formField} style={{ marginTop: "12px" }}>
                <CustomInputField
                  name="otherSymptoms"
                  label="Other:"
                  type="text"
                  placeholder="Enter other symptoms"
                  validationRules={{}}
                  icon={undefined}
                  helperText={undefined}
                  handleShowPassword={undefined}
                  value={undefined}
                  prefix={undefined}
                />
              </div>
            </div>

            <div className={styles.divider}></div>

            {/* Mental Health & Medical History */}
            <div className={styles.treatmentPlanSection}>
              <h3 className={styles.sectionHeading}>
                Mental Health & Medical History
              </h3>
              <div className={styles.formField}>
                <label>Previous therapy:</label>
                <div className={styles.radioGroup}>
                  <label>
                    <input
                      type="radio"
                      name="previousTherapy"
                      value="yes"
                      checked={previousTherapy === "yes"}
                      onChange={(e) => setPreviousTherapy(e.target.value)}
                    />{" "}
                    Yes
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="previousTherapy"
                      value="no"
                      checked={previousTherapy === "no"}
                      onChange={(e) => setPreviousTherapy(e.target.value)}
                    />{" "}
                    No
                  </label>
                </div>
              </div>
              <div className={styles.formField}>
                <CustomInputField
                  name="currentMedications"
                  label="Current medications:"
                  type="text"
                  placeholder="Enter current medications"
                  validationRules={{}}
                  icon={undefined}
                  helperText={undefined}
                  handleShowPassword={undefined}
                  value={undefined}
                  prefix={undefined}
                />
              </div>
              <div className={styles.formField}>
                <CustomInputField
                  name="medicalConditions"
                  label="Medical conditions (if any):"
                  type="text"
                  placeholder="Enter medical conditions"
                  validationRules={{}}
                  icon={undefined}
                  helperText={undefined}
                  handleShowPassword={undefined}
                  value={undefined}
                  prefix={undefined}
                />
              </div>
            </div>

            <div className={styles.divider}></div>

            {/* Safety Assessment */}
            <div className={styles.treatmentPlanSection}>
              <h3 className={styles.sectionHeading}>Safety Assessment</h3>
              <div className={styles.formField}>
                <label>Thoughts of self-harm:</label>
                <div className={styles.radioGroup}>
                  <label>
                    <input
                      type="radio"
                      name="selfHarm"
                      value="no"
                      checked={thoughtsOfSelfHarm === "no"}
                      onChange={(e) => setThoughtsOfSelfHarm(e.target.value)}
                    />{" "}
                    No
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="selfHarm"
                      value="past"
                      checked={thoughtsOfSelfHarm === "past"}
                      onChange={(e) => setThoughtsOfSelfHarm(e.target.value)}
                    />{" "}
                    Past
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="selfHarm"
                      value="current"
                      checked={thoughtsOfSelfHarm === "current"}
                      onChange={(e) => setThoughtsOfSelfHarm(e.target.value)}
                    />{" "}
                    Current
                  </label>
                </div>
              </div>
              <div className={styles.formField}>
                <label>Thoughts of harming others:</label>
                <div className={styles.radioGroup}>
                  <label>
                    <input
                      type="radio"
                      name="harmingOthers"
                      value="no"
                      checked={thoughtsOfHarmingOthers === "no"}
                      onChange={(e) =>
                        setThoughtsOfHarmingOthers(e.target.value)
                      }
                    />{" "}
                    No
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="harmingOthers"
                      value="yes"
                      checked={thoughtsOfHarmingOthers === "yes"}
                      onChange={(e) =>
                        setThoughtsOfHarmingOthers(e.target.value)
                      }
                    />{" "}
                    Yes
                  </label>
                </div>
              </div>
              <div className={styles.formField}>
                <CustomInputField
                  name="immediateSafetyConcerns"
                  label="Immediate safety concerns noted:"
                  type="text"
                  placeholder="Enter immediate safety concerns"
                  validationRules={{}}
                  icon={undefined}
                  helperText={undefined}
                  handleShowPassword={undefined}
                  value={undefined}
                  prefix={undefined}
                />
              </div>
            </div>

            <div className={styles.divider}></div>

            {/* Initial Clinical Impression */}
            <div className={styles.treatmentPlanSection}>
              <h3 className={styles.sectionHeading}>
                Initial Clinical Impression
              </h3>
              <div className={styles.formField}>
                <CustomTextArea
                  label="Initial Clinical Impression:"
                  name="clinicalImpression"
                  control={control}
                  isError={!!errors.clinicalImpression}
                  disabled={false}
                  placeholder="Enter initial clinical impression"
                  rows={6}
                  helperText={undefined}
                />
              </div>
            </div>

            <div className={styles.divider}></div>

            {/* Consent */}
            <div className={styles.treatmentPlanSection}>
              <h3 className={styles.sectionHeading}>Consent</h3>
              <div className={styles.consentText}>
                Client has provided informed consent to begin therapy services.
              </div>
            </div>

            {/* Validation Checkbox */}
            <ReportValidationCheckbox
              isAccepted={isAccepted}
              onAcceptanceChange={setIsAccepted}
              text="I hereby confirm that I have reviewed and accept the accuracy of all information provided in this intake report. I understand that this report will be submitted as an official record."
            />

            {/* Save Button */}
            <div style={{ marginTop: "20px", textAlign: "right" }}>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={isSaving || !isAccepted}
                loading={isSaving}
              >
                Save
              </Button>
            </div>
          </FormProvider>
        </ProgressReportModalWrapper>
      )}
    </CustomModal>
  );
};

export default IntakeReportModal;
