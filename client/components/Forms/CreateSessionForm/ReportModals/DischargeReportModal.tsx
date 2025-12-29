import moment from "moment";
import React, { useEffect, useState } from "react";
import { FormProvider } from "react-hook-form";
import { toast } from "react-toastify";
import CommonServices from "../../../../services/CommonServices";
import { useMutationData } from "../../../../utils/hooks/useMutationData";
import { useQueryData } from "../../../../utils/hooks/useQueryData";
import useZodForm from "../../../../utils/hooks/useZodForm";
import Button from "../../../Button";
import CustomModal from "../../../CustomModal";
import CustomTextArea from "../../../CustomTextArea";
import Spinner from "../../../common/Spinner";
import { ProgressReportModalWrapper } from "../style";
import ReportValidationCheckbox from "./ReportValidationCheckbox";
import styles from "./styles.module.scss";
import { dischargeReportSchema } from "./dischargeReportValidation";

interface DischargeReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionRow: any;
  initialData?: any;
}

const DischargeReportModal: React.FC<DischargeReportModalProps> = ({
  isOpen,
  onClose,
  sessionRow,
  initialData,
}) => {
  const reqId = sessionRow?.thrpy_req_id || initialData?.req_id;
  const sessionId = sessionRow?.session_id;
  const reportId = sessionRow?.report_id;

  // State for discharge reason radio button (only one can be selected)
  const [dischargeReason, setDischargeReason] = useState<string | null>(null);

  // State for validation checkbox
  const [isAccepted, setIsAccepted] = useState(false);

  // Initialize form with useZodForm
  const defaultValues = {
    treatmentSummary: "",
    remainingConcerns: "",
    recommendations: "",
    clientUnderstanding: "",
    dischargeReasonOtherText: "",
    therapistNotes: {} as Record<string, string>,
  };

  const methods = useZodForm(
    dischargeReportSchema,
    undefined, // No mutation passed - we'll handle it manually
    defaultValues
  );

  const {
    reset,
    control,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors },
  } = methods;

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset(defaultValues);
      setDischargeReason(null);
      setIsAccepted(false);
    }
  }, [isOpen, reset]);

  // Fetch discharge report data
  const {
    data: dischargeReportResponse,
    isPending: isLoadingReport,
    isFetching: isFetchingReport,
  } = useQueryData(
    ["discharge-report-data", reqId, sessionId],
    async () => {
      if (!reqId) return null;
      const params: any = { thrpy_req_id: reqId };
      if (sessionId) {
        params.session_id = sessionId;
      }
      const response = await CommonServices.getDischargeReportData(params);
      return response?.status === 200 && response?.data?.rec
        ? response.data.rec
        : null;
    },
    isOpen && !!reqId
  );

  const reportData = dischargeReportResponse as any;
  const loading = isLoadingReport || isFetchingReport;

  const formatDate = (date: string | null | undefined) => {
    if (!date) return "N/A";
    return moment(date).format("MMMM DD, YYYY");
  };

  // Extract data from new format (meta, client, practice, therapist, report, sign_off)
  // Fallback to old format or sessionRow/initialData if needed
  const clientFullName =
    reportData?.client?.full_name ||
    (reportData?.client_first_name && reportData?.client_last_name
      ? `${reportData.client_first_name} ${reportData.client_last_name}`
      : sessionRow?.client_first_name && sessionRow?.client_last_name
      ? `${sessionRow.client_first_name} ${sessionRow.client_last_name}`
      : initialData?.client_first_name && initialData?.client_last_name
      ? `${initialData.client_first_name} ${initialData.client_last_name}`
      : "N/A");

  const clientID =
    reportData?.client?.client_id_reference ||
    reportData?.client_clam_num ||
    sessionRow?.client_clam_num ||
    initialData?.client_clam_num ||
    "N/A";

  const therapistName =
    reportData?.therapist?.name ||
    (reportData?.counselor_first_name && reportData?.counselor_last_name
      ? `${reportData.counselor_first_name} ${reportData.counselor_last_name}`
      : sessionRow?.counselor_first_name && sessionRow?.counselor_last_name
      ? `${sessionRow.counselor_first_name} ${sessionRow.counselor_last_name}`
      : initialData?.counselor_first_name && initialData?.counselor_last_name
      ? `${initialData.counselor_first_name} ${initialData.counselor_last_name}`
      : "N/A");

  const therapistDesignation =
    reportData?.therapist?.designation ||
    reportData?.counselor_designation ||
    "Therapist";

  const practiceName =
    reportData?.practice?.practice_name || reportData?.service_name || "N/A";

  const treatmentBlockName =
    reportData?.practice?.treatment_block_name ||
    reportData?.treatment_target ||
    reportData?.service_name ||
    "N/A";

  const reportDate = formatDate(
    reportData?.meta?.report_date ||
      reportData?.session_date ||
      sessionRow?.intake_date ||
      sessionRow?.scheduled_time
  );

  const totalSessionsCompleted =
    reportData?.meta?.total_sessions_completed ||
    reportData?.total_sessions_completed ||
    0;

  const assessments =
    reportData?.report?.assessments || reportData?.assessments || [];

  // Populate form fields when data is loaded
  useEffect(() => {
    if (reportData && !loading) {
      // Handle new format (reportData.report contains the form data)
      if (reportData.report) {
        // Populate text fields from report section
        if (reportData.report.treatment_summary) {
          setValue("treatmentSummary", reportData.report.treatment_summary);
        }
        if (reportData.report.remaining_concerns) {
          setValue("remainingConcerns", reportData.report.remaining_concerns);
        }
        if (reportData.report.recommendations) {
          setValue("recommendations", reportData.report.recommendations);
        }
        if (reportData.report.client_understanding) {
          setValue(
            "clientUnderstanding",
            reportData.report.client_understanding
          );
        }
        // Populate discharge reason from flags (find which one is true)
        // This matches the format we send: discharge_reason_flags object with one flag set to true
        if (reportData.report.discharge_reason_flags) {
          const flags = reportData.report.discharge_reason_flags;
          // Check each flag and set the corresponding radio button value
          // Since we use radio buttons, only one should be true
          if (flags.goals_met === true) {
            setDischargeReason("goals_met");
          } else if (flags.client_withdrew === true) {
            setDischargeReason("client_withdrew");
          } else if (flags.referral_made === true) {
            setDischargeReason("referral_made");
          } else if (flags.other === true) {
            setDischargeReason("other");
            if (reportData.report.discharge_reason_other) {
              setValue(
                "dischargeReasonOtherText",
                reportData.report.discharge_reason_other
              );
            }
          }
        }

        // Populate therapist notes for assessments
        if (
          reportData.report.assessments &&
          Array.isArray(reportData.report.assessments)
        ) {
          const notes: Record<string, string> = {};
          reportData.report.assessments.forEach(
            (assessment: any, index: number) => {
              if (assessment.therapist_notes) {
                notes[index.toString()] = assessment.therapist_notes;
              }
            }
          );
          if (Object.keys(notes).length > 0) {
            setValue("therapistNotes", notes);
          }
        }
      }
    }
  }, [reportData, loading, setValue]);

  // Save discharge report mutation
  const { mutate: saveDischargeReport, isPending: isSaving } = useMutationData(
    ["saveDischargeReport"],
    async () => {
      const formValues = getValues();

      // Validate that a discharge reason is selected
      if (!dischargeReason) {
        toast.error("Please select a reason for discharge");
        throw new Error("No discharge reason selected");
      }

      // Prepare assessments with therapist notes
      // Handle both new format (assessment.tool) and old format (assessment.form_cde)
      const assessmentsWithNotes = assessments.map(
        (assessment: any, index: number) => {
          const noteKey = index.toString();
          const therapistNote = formValues.therapistNotes?.[noteKey] || "";
          return {
            tool:
              assessment?.tool ||
              assessment?.form_cde ||
              assessment?.form_name ||
              `Assessment ${index + 1}`,
            score: assessment?.score || "N/A",
            therapist_notes: therapistNote || assessment?.therapist_notes || "",
          };
        }
      );

      // Prepare discharge reason flags (convert radio selection to flags format)
      // This matches the format expected by backend: discharge_reason_flags object
      // Since we use radio buttons, only one flag will be true
      const dischargeReasonFlags = {
        goals_met: dischargeReason === "goals_met",
        client_withdrew: dischargeReason === "client_withdrew",
        referral_made: dischargeReason === "referral_made",
        other: dischargeReason === "other",
      };

      // Get report date and format it
      const reportDateValue =
        reportData?.meta?.report_date ||
        reportData?.session_date ||
        sessionRow?.intake_date ||
        moment().toISOString();

      // Format date as YYYY-MM-DD
      const reportDateFormatted = moment(reportDateValue).format("YYYY-MM-DD");

      // Get session number and total sessions completed
      const sessionNumberValue =
        reportData?.meta?.session_number || reportData?.session_number || null;

      const totalSessionsCompletedValue =
        reportData?.meta?.total_sessions_completed ||
        reportData?.total_sessions_completed ||
        0;

      // Get client ID as string
      const clientIdValue =
        sessionRow?.client_id ||
        reportData?.meta?.client_id ||
        reportData?.client?.client_id_reference ||
        null;
      const clientIdString = clientIdValue ? String(clientIdValue) : null;

      // Get report_id if available (for updates) or session_id (for creates)
      const reportIdToUse =
        sessionRow?.report_id || reportData?.report_id || null;

      // Structure payload to match backend format
      const payload = {
        ...(reportIdToUse
          ? { report_id: reportIdToUse }
          : { session_id: sessionId || reportData?.meta?.session_id }),
        metadata: {
          meta: {
            client_id: clientIdString,
            session_id: sessionId || reportData?.meta?.session_id || null,
            session_number: sessionNumberValue,
            total_sessions_completed: totalSessionsCompletedValue,
            report_date: reportDateFormatted,
          },
          client: {
            full_name: clientFullName !== "N/A" ? clientFullName : null,
            client_id_reference: clientID !== "N/A" ? String(clientID) : null,
          },
          practice: {
            frequency:
              reportData?.practice?.frequency ||
              reportData?.frequency ||
              "Other",
            practice_name: practiceName !== "N/A" ? practiceName : null,
            treatment_block_name:
              treatmentBlockName !== "N/A" ? treatmentBlockName : null,
          },
          therapist: {
            name: therapistName !== "N/A" ? therapistName : null,
            designation: therapistDesignation || "Therapist",
          },
          report: {
            assessments: assessmentsWithNotes,
            treatment_summary: formValues.treatmentSummary || null,
            remaining_concerns: formValues.remainingConcerns || null,
            recommendations: formValues.recommendations || null,
            client_understanding: formValues.clientUnderstanding || null,
            discharge_reason_flags: dischargeReasonFlags,
            discharge_reason_other: formValues.dischargeReasonOtherText || null,
          },
          sign_off: {
            method: "Electronic",
            approved_by: therapistName !== "N/A" ? therapistName : null,
            approved_on: reportDateFormatted,
          },
        },
      };

      return await CommonServices.saveDischargeReport(payload);
    },
    ["discharge-report-data"],
    () => {
      toast.success("Discharge report saved successfully");
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
        saveDischargeReport({});
      },
      (validationErrors) => {
        toast.error("Please fill in all required fields.");
      }
    )();
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onRequestClose={onClose}
      title="DISCHARGE REPORT"
      icon={null}
      customStyles={{ maxWidth: "800px" }}
    >
      {loading ? (
        <ProgressReportModalWrapper>
          <div className="loading-container">
            <Spinner color="#000" width="40px" height="40px" />
            <p className="loading-text">Loading discharge report data...</p>
          </div>
        </ProgressReportModalWrapper>
      ) : (
        <ProgressReportModalWrapper className={styles.reportModalWrapper}>
          <FormProvider {...methods}>
            {/* Header */}
            <div className="header-section">
              <div className="header-field">
                <strong>Name of Practice:</strong> {practiceName}
              </div>
              <div className="header-field">
                <strong>Therapist Name:</strong> {therapistName}{" "}
                <strong>Designation:</strong> {therapistDesignation}
              </div>
              <div className="header-field">
                <strong>Date of Discharge Report:</strong> {reportDate}
              </div>
              <div>
                <strong>Treatment Block:</strong> {treatmentBlockName}
              </div>
            </div>

            {/* Client Information */}
            <div className="client-information">
              <h3 className="client-info-title">CLIENT INFORMATION</h3>
              <div className="client-info-field">
                <strong>Full Name:</strong> {clientFullName}
              </div>
              <div className="client-info-field">
                <strong>Client ID / Reference:</strong> {clientID}
              </div>
              <div className="header-field">
                <strong>Date of Discharge Session:</strong> {reportDate}
              </div>
              <div>
                <strong>Total Sessions Completed:</strong>{" "}
                {totalSessionsCompleted}
              </div>
            </div>

            <div className={styles.divider}></div>

            {/* Reason for Discharge */}
            <div className={styles.treatmentPlanSection}>
              <h3 className={styles.sectionHeading}>Reason for Discharge</h3>
              <div className={styles.radioGroup}>
                <label>
                  <input
                    type="radio"
                    name="dischargeReason"
                    value="goals_met"
                    checked={dischargeReason === "goals_met"}
                    onChange={(e) => setDischargeReason(e.target.value)}
                  />{" "}
                  Treatment goals met
                </label>
                <label>
                  <input
                    type="radio"
                    name="dischargeReason"
                    value="client_withdrew"
                    checked={dischargeReason === "client_withdrew"}
                    onChange={(e) => setDischargeReason(e.target.value)}
                  />{" "}
                  Client withdrew
                </label>
                <label>
                  <input
                    type="radio"
                    name="dischargeReason"
                    value="referral_made"
                    checked={dischargeReason === "referral_made"}
                    onChange={(e) => setDischargeReason(e.target.value)}
                  />{" "}
                  Referral made
                </label>
                <label>
                  <input
                    type="radio"
                    name="dischargeReason"
                    value="other"
                    checked={dischargeReason === "other"}
                    onChange={(e) => setDischargeReason(e.target.value)}
                  />{" "}
                  Other
                </label>
              </div>
              {dischargeReason === "other" && (
                <div className={styles.formField} style={{ marginTop: "10px" }}>
                  <CustomTextArea
                    label="If 'Other':"
                    name="dischargeReasonOtherText"
                    control={control}
                    isError={!!errors.dischargeReasonOtherText}
                    disabled={false}
                    placeholder="Please specify other reason..."
                    rows={3}
                    helperText={undefined}
                  />
                </div>
              )}
            </div>

            <div className={styles.divider}></div>

            {/* Treatment Summary */}
            <div className={styles.treatmentPlanSection}>
              <h3 className={styles.sectionHeading}>Treatment Summary</h3>
              <div className={styles.formField}>
                <CustomTextArea
                  label="Treatment Summary:"
                  name="treatmentSummary"
                  control={control}
                  isError={!!errors.treatmentSummary}
                  disabled={false}
                  placeholder="Enter treatment summary..."
                  rows={4}
                  helperText={undefined}
                />
              </div>
            </div>

            <div className={styles.divider}></div>

            {/* Final Assessment */}
            <div className={styles.treatmentPlanSection}>
              <h3 className={styles.sectionHeading}>
                Final Assessment (Auto-Filled)
              </h3>
              {assessments.length > 0
                ? assessments
                    .slice(0, 5)
                    .map((assessment: any, index: number) => {
                      // Handle both new format (assessment.tool) and old format (assessment.form_cde)
                      const formName =
                        assessment?.tool ||
                        assessment?.form_cde ||
                        `Assessment ${index + 1}`;
                      const score = assessment?.score || "N/A";
                      const noteKey = index.toString();

                      return (
                        <div key={index} className={styles.formField}>
                          <div style={{ marginBottom: "8px" }}>
                            <strong>Tool:</strong> {formName}{" "}
                            <strong>Score:</strong> {score}
                          </div>
                          <CustomTextArea
                            label="Therapist Notes:"
                            name={`therapistNotes.${noteKey}`}
                            control={control}
                            isError={false}
                            disabled={false}
                            placeholder="Enter therapist notes for this assessment..."
                            rows={3}
                            helperText={undefined}
                          />
                        </div>
                      );
                    })
                : null}

              {/* Remaining concerns */}
              <div className={styles.formField} style={{ marginTop: "20px" }}>
                <CustomTextArea
                  label="Remaining concerns:"
                  name="remainingConcerns"
                  control={control}
                  isError={!!errors.remainingConcerns}
                  disabled={false}
                  placeholder="Enter remaining concerns..."
                  rows={4}
                  helperText={undefined}
                />
              </div>
            </div>

            <div className={styles.divider}></div>

            {/* Recommendations Post-Discharge */}
            <div className={styles.treatmentPlanSection}>
              <h3 className={styles.sectionHeading}>
                Recommendations Post-Discharge
              </h3>
              <div className={styles.formField}>
                <CustomTextArea
                  label="Recommendations:"
                  name="recommendations"
                  control={control}
                  isError={!!errors.recommendations}
                  disabled={false}
                  placeholder="Enter recommendations post-discharge..."
                  rows={4}
                  helperText={undefined}
                />
              </div>
            </div>

            <div className={styles.divider}></div>

            {/* Client/caregiver understanding */}
            <div className={styles.treatmentPlanSection}>
              <h3 className={styles.sectionHeading}>
                Client/caregiver understanding:
              </h3>
              <div className={styles.formField}>
                <CustomTextArea
                  label="Client/caregiver understanding:"
                  name="clientUnderstanding"
                  control={control}
                  isError={!!errors.clientUnderstanding}
                  disabled={false}
                  placeholder="Enter client/caregiver understanding..."
                  rows={4}
                  helperText={undefined}
                />
              </div>
            </div>

            <div className={styles.divider}></div>

            {/* Therapist Sign-Off */}
            <div className="therapist-signoff">
              <h3 className="signoff-title">THERAPIST SIGN-OFF</h3>
              <div className="signoff-text">
                Electronically approved by <strong>{therapistName}</strong>,{" "}
                <strong>{therapistDesignation}</strong> on{" "}
                <strong>{reportDate}</strong> via MindBridge.
              </div>
            </div>

            {/* Validation Checkbox */}
            <ReportValidationCheckbox
              isAccepted={isAccepted}
              onAcceptanceChange={setIsAccepted}
              text="I hereby confirm that I have reviewed and accept the accuracy of all information provided in this discharge report. I understand that this report will be submitted as an official record of the client's discharge from treatment."
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

export default DischargeReportModal;
