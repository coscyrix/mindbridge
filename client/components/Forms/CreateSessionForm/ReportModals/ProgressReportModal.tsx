import React, { useState, useEffect } from "react";
import { FormProvider } from "react-hook-form";
import CustomModal from "../../../CustomModal";
import moment from "moment";
import CommonServices from "../../../../services/CommonServices";
import { useQueryData } from "../../../../utils/hooks/useQueryData";
import { useMutationData } from "../../../../utils/hooks/useMutationData";
import useZodForm from "../../../../utils/hooks/useZodForm";
import { ProgressReportModalWrapper } from "../style";
import { toast } from "react-toastify";
import {
  ReportHeader,
  ClientInfoSection,
  CheckboxGroup,
  TherapistSignOff,
  LoadingState,
} from "./components";
import ReportValidationCheckbox from "./ReportValidationCheckbox";
import Button from "../../../Button";
import CustomTextArea from "../../../CustomTextArea";
import { RISK_SCREENING_OPTIONS, DEFAULT_RISK_FLAGS } from "./constants";
import { progressReportSchema } from "./progressReportValidation";
import type { RiskScreeningFlags } from "./types";

interface ProgressReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionRow: any;
  initialData?: any;
}

const ProgressReportModal: React.FC<ProgressReportModalProps> = ({
  isOpen,
  onClose,
  sessionRow,
  initialData,
}) => {
  const reqId = sessionRow?.thrpy_req_id || initialData?.req_id;
  const sessionId = sessionRow?.session_id;

  // State for non-form fields (not part of validation schema)
  const [therapistNotes, setTherapistNotes] = useState<Record<number, string>>(
    {}
  );
  const [riskScreeningFlags, setRiskScreeningFlags] =
    useState<RiskScreeningFlags>({ ...DEFAULT_RISK_FLAGS });
  const [isAccepted, setIsAccepted] = useState(false);

  // Initialize form with useZodForm
  const defaultValues = {
    sessionSummary: "",
    progressSinceLastSession: "",
    riskScreeningNote: "",
    therapistNotes: {},
  };

  const methods = useZodForm(
    progressReportSchema,
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
      setTherapistNotes({});
      setRiskScreeningFlags({ ...DEFAULT_RISK_FLAGS });
      setIsAccepted(false);
    }
  }, [isOpen, reset]);

  // Fetch progress report data
  const {
    data: progressReportResponse,
    isPending: isLoadingReport,
    isFetching: isFetchingReport,
  } = useQueryData(
    ["progress-report-data", reqId, sessionId],
    async () => {
      if (!reqId) return null;
      const params: any = { thrpy_req_id: reqId };
      if (sessionId) {
        params.session_id = sessionId;
      }
      const response = await CommonServices.getProgressReportData(params);
      return response?.status === 200 && response?.data?.rec
        ? response.data.rec
        : null;
    },
    isOpen && !!reqId
  );

  const reportData = progressReportResponse as any;
  const loading = isLoadingReport || isFetchingReport;

  const formatDate = (date: string | null | undefined) => {
    if (!date) return "N/A";
    return moment(date).format("MMMM DD, YYYY");
  };

  // Extract data for the report
  const practiceName = reportData?.practice?.practice_name || "N/A";
  const therapistName = reportData?.therapist?.name || "N/A";
  const therapistDesignation =
    reportData?.therapist?.designation || "Therapist";
  const rawReportDate =
    reportData?.meta?.report_date ||
    reportData?.sign_off?.approved_on ||
    sessionRow?.intake_date ||
    sessionRow?.scheduled_time;
  const reportDate = formatDate(rawReportDate);
  const treatmentBlockName =
    reportData?.practice?.treatment_block_name || "N/A";
  const clientFullName = reportData?.client?.full_name || "N/A";
  const clientID =
    reportData?.client?.client_id_reference || reportData?.meta?.client_id;
  const sessionNumber = reportData?.meta?.session_id ?? "N/A";
  const totalSessionsCompleted =
    reportData?.meta?.total_sessions_completed || 0;
  const frequency = reportData?.practice?.frequency || "Other";
  const assessments = reportData?.report?.assessments || [];

  // Populate form fields when data is loaded
  useEffect(() => {
    if (reportData && !loading) {
      if (reportData.report?.session_summary) {
        setValue("sessionSummary", reportData.report.session_summary);
      }
      if (reportData.report?.progress_since_last_session) {
        setValue(
          "progressSinceLastSession",
          reportData.report.progress_since_last_session
        );
      }
      if (reportData.report?.risk_screening?.note) {
        setValue("riskScreeningNote", reportData.report.risk_screening.note);
      }
      if (reportData.report?.risk_screening?.flags) {
        setRiskScreeningFlags({
          no_risk: reportData.report.risk_screening.flags.no_risk || false,
          suicidal_ideation:
            reportData.report.risk_screening.flags.suicidal_ideation || false,
          self_harm: reportData.report.risk_screening.flags.self_harm || false,
          substance_concerns:
            reportData.report.risk_screening.flags.substance_concerns || false,
        });
      }
      if (
        reportData.report?.assessments &&
        Array.isArray(reportData.report.assessments)
      ) {
        const notes: Record<number, string> = {};
        reportData.report.assessments.forEach(
          (assessment: any, index: number) => {
            if (assessment.therapist_notes) {
              notes[index] = assessment.therapist_notes;
            }
          }
        );
        setTherapistNotes(notes);
      }
    }
  }, [reportData, loading, setValue]);

  // Save progress report mutation
  const { mutate: saveProgressReport, isPending: isSaving } = useMutationData(
    ["saveProgressReport"],
    async () => {
      const formValues = getValues();
      const assessmentsWithNotes = assessments.map(
        (assessment: any, index: number) => ({
          form_name:
            assessment?.tool ||
            assessment?.form_cde ||
            `Assessment ${index + 1}`,
          score: assessment?.score || "N/A",
          therapist_notes: therapistNotes[index] || "",
        })
      );

      const payload = {
        session_id: sessionId || reportData?.meta?.session_id,
        client_id: sessionRow?.client_id,
        counselor_id: sessionRow?.counselor_id,
        session_summary: formValues.sessionSummary,
        progress_since_last_session: formValues.progressSinceLastSession,
        risk_screening_note: formValues.riskScreeningNote || "",
        risk_screening_flags: riskScreeningFlags,
        assessments: assessmentsWithNotes,
        frequency: frequency,
        practice_name: practiceName,
        therapist_name: therapistName,
        therapist_designation: therapistDesignation,
        report_date: rawReportDate,
        treatment_block_name: treatmentBlockName,
        client_full_name: clientFullName,
        client_id_reference: clientID ? String(clientID) : undefined,
        session_number: sessionNumber,
        total_sessions_completed: totalSessionsCompleted,
      };

      return await CommonServices.saveProgressReport(payload);
    },
    ["progress-report-data"],
    () => {
      toast.success("Progress report saved successfully");
      onClose();
    }
  );

  const handleSave = () => {
    if (!sessionId) {
      toast.error("Session ID is required");
      return;
    }
    if (!isAccepted) {
      toast.error(
        "Please confirm that you accept the above information before saving."
      );
      return;
    }

    handleSubmit(
      (data) => {
        saveProgressReport(undefined);
      },
      (validationErrors) => {
        toast.error("Please fill in all required fields.");
      }
    )();
  };

  const handleRiskFlagChange = (key: string, checked: boolean) => {
    setRiskScreeningFlags((prev) => ({ ...prev, [key]: checked }));
  };

  // Client info fields for the shared component
  const clientInfoFields = [
    { label: "Full Name", value: clientFullName },
    { label: "Client ID / Reference", value: clientID },
    { label: "Session Number", value: sessionNumber },
    { label: "Total Sessions Completed", value: totalSessionsCompleted },
  ];

  return (
    <CustomModal
      isOpen={isOpen}
      onRequestClose={onClose}
      title="TREATMENT PROGRESS REPORT"
      icon={null}
      customStyles={{ maxWidth: "800px" }}
    >
      {loading ? (
        <LoadingState message="Loading progress report data..." />
      ) : (
        <ProgressReportModalWrapper>
          <FormProvider {...methods}>
            {/* Header */}
            <ReportHeader
              practiceName={practiceName}
              therapistName={therapistName}
              therapistDesignation={therapistDesignation}
              reportDate={reportDate}
              treatmentBlockName={treatmentBlockName}
              reportTitle="Progress Report"
            />

            {/* Client Information */}
            <ClientInfoSection fields={clientInfoFields} />

            {/* Session Summary */}
            <div className="form-section">
              <div className="section-title">
                <strong>1. Session Summary</strong>
              </div>
              <CustomTextArea
                label=""
                name="sessionSummary"
                control={control}
                isError={!!errors.sessionSummary}
                disabled={false}
                placeholder="Enter session summary..."
                rows={4}
                helperText={undefined}
              />
            </div>

            {/* Progress Since Last Session */}
            <div className="form-section">
              <div className="section-title">
                <strong>2. Progress Since Last Session</strong>
              </div>
              <CustomTextArea
                label=""
                name="progressSinceLastSession"
                control={control}
                isError={!!errors.progressSinceLastSession}
                disabled={false}
                placeholder="Enter progress since last session..."
                rows={4}
                helperText={undefined}
              />
            </div>

            {/* Risk Screening */}
            <div className="risk-screening">
              <div className="section-title">
                <strong>3. Risk Screening</strong>
              </div>
              <CheckboxGroup
                options={RISK_SCREENING_OPTIONS}
                values={
                  riskScreeningFlags as unknown as Record<string, boolean>
                }
                onChange={handleRiskFlagChange}
              />
              <div className="section-title" style={{ marginTop: "12px" }}>
                <strong>Note:</strong>
              </div>
              <CustomTextArea
                label=""
                name="riskScreeningNote"
                control={control}
                isError={!!errors.riskScreeningNote}
                disabled={false}
                placeholder="Enter risk screening notes..."
                rows={4}
                helperText={undefined}
              />
            </div>

            {/* Assessments */}
            <div className="form-section">
              <div className="section-title">
                <strong>4. Assessments (Auto-Filled)</strong>
              </div>
              {assessments &&
              Array.isArray(assessments) &&
              assessments.length > 0 ? (
                assessments
                  .slice(0, 5)
                  .map((assessment: any, index: number) => {
                    const formName =
                      assessment?.tool ||
                      assessment?.form_cde ||
                      `Assessment ${index + 1}`;
                    const score = assessment?.score || "N/A";

                    return (
                      <div key={index} className="assessment-item">
                        <div className="assessment-header">
                          <strong>Tool:</strong> {formName}{" "}
                          <strong>Score:</strong> {score}
                        </div>
                        <div className="assessment-notes-label">
                          <strong>Therapist Notes:</strong>
                        </div>
                        <textarea
                          value={therapistNotes[index] || ""}
                          onChange={(e) =>
                            setTherapistNotes({
                              ...therapistNotes,
                              [index]: e.target.value,
                            })
                          }
                          placeholder="Enter therapist notes for this assessment..."
                          className="therapist-notes"
                        />
                      </div>
                    );
                  })
              ) : (
                <div className="no-assessments">
                  <p>No assessments available for this session.</p>
                </div>
              )}
            </div>

            {/* Frequency */}
            <div className="frequency-section">
              <div className="section-title">
                <strong>Frequency (Auto-Filled From Treatment Block)</strong>
              </div>
              <div className="frequency-checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={frequency === "Weekly"}
                    readOnly
                  />{" "}
                  Weekly
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={frequency === "Biweekly"}
                    readOnly
                  />{" "}
                  Biweekly
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={frequency === "Other"}
                    readOnly
                  />{" "}
                  Other:{" "}
                  {frequency !== "Weekly" && frequency !== "Biweekly"
                    ? frequency
                    : ""}
                </label>
              </div>
              <div className="frequency-note">
                System will mark [X] automatically.
              </div>
            </div>

            {/* Therapist Sign-Off */}
            <TherapistSignOff
              therapistName={therapistName}
              therapistDesignation={therapistDesignation}
              reportDate={reportDate}
            />

            {/* Validation Checkbox */}
            <div style={{ marginTop: "24px" }}>
              <ReportValidationCheckbox
                isAccepted={isAccepted}
                onAcceptanceChange={setIsAccepted}
                text="I hereby confirm that I have reviewed and accept the accuracy of all information provided in this progress report. I understand that this report will be submitted as an official record of the treatment session."
              />
            </div>

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

export default ProgressReportModal;
