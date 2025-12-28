import React, { useState, useEffect } from "react";
import CustomModal from "../../../CustomModal";
import Spinner from "../../../common/Spinner";
import moment from "moment";
import CommonServices from "../../../../services/CommonServices";
import { useQueryData } from "../../../../utils/hooks/useQueryData";
import { useMutationData } from "../../../../utils/hooks/useMutationData";
import { capitalizeName } from "../../../../utils/constants";
import { ProgressReportModalWrapper } from "../style";
import { api } from "../../../../utils/auth";
import { toast } from "react-toastify";

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

  // State for text areas
  const [sessionSummary, setSessionSummary] = useState("");
  const [progressSinceLastSession, setProgressSinceLastSession] = useState("");
  const [riskScreeningNote, setRiskScreeningNote] = useState("");
  const [therapistNotes, setTherapistNotes] = useState<{
    [key: number]: string;
  }>({});

  // State for risk screening checkboxes
  const [riskScreeningFlags, setRiskScreeningFlags] = useState({
    no_risk: false,
    suicidal_ideation: false,
    self_harm: false,
    substance_concerns: false,
  });

  // State for validation checkbox
  const [isAccepted, setIsAccepted] = useState(false);

  // Reset form when modal closes or session changes
  useEffect(() => {
    if (!isOpen) {
      setSessionSummary("");
      setProgressSinceLastSession("");
      setRiskScreeningNote("");
      setTherapistNotes({});
      setRiskScreeningFlags({
        no_risk: false,
        suicidal_ideation: false,
        self_harm: false,
        substance_concerns: false,
      });
      setIsAccepted(false);
    }
  }, [isOpen]);

  // Fetch progress report data using the new API
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

  // Extract data for the report (from new nested API response structure)
  const practiceName = reportData?.practice?.practice_name || "N/A";
  const therapistName = reportData?.therapist?.name || "N/A";
  const therapistDesignation =
    reportData?.therapist?.designation || "Therapist";
  // Get raw date for saving (YYYY-MM-DD format)
  const rawReportDate =
    reportData?.meta?.report_date ||
    reportData?.sign_off?.approved_on ||
    sessionRow?.intake_date ||
    sessionRow?.scheduled_time;

  // Format date for display
  const reportDate = formatDate(rawReportDate);
  const treatmentBlockName =
    reportData?.practice?.treatment_block_name || "N/A";
  const clientFullName = reportData?.client?.full_name || "N/A";
  const clientID =
    reportData?.client?.client_id_reference || reportData?.meta?.client_id;
  const sessionNumber = reportData?.meta?.session_id ?? "N/A";

  // Get calculated fields from API
  const totalSessionsCompleted =
    reportData?.meta?.total_sessions_completed || 0;
  const frequency = reportData?.practice?.frequency || "Other";
  const assessments = reportData?.report?.assessments || [];

  // Populate form fields when data is loaded
  useEffect(() => {
    if (reportData && !loading) {
      // Populate session summary
      if (reportData.report?.session_summary) {
        setSessionSummary(reportData.report.session_summary);
      }

      // Populate progress since last session
      if (reportData.report?.progress_since_last_session) {
        setProgressSinceLastSession(
          reportData.report.progress_since_last_session
        );
      }

      // Populate risk screening note
      if (reportData.report?.risk_screening?.note) {
        setRiskScreeningNote(reportData.report.risk_screening.note);
      }

      // Populate risk screening flags
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

      // Populate therapist notes for assessments
      if (
        reportData.report?.assessments &&
        Array.isArray(reportData.report.assessments)
      ) {
        const notes: { [key: number]: string } = {};
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
  }, [reportData, loading]);

  // Save progress report mutation
  const { mutate: saveProgressReport, isPending: isSaving } = useMutationData(
    ["saveProgressReport"],
    async () => {
      // Prepare assessments with therapist notes
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
        session_summary: sessionSummary,
        progress_since_last_session: progressSinceLastSession,
        risk_screening_note: riskScreeningNote,
        risk_screening_flags: riskScreeningFlags,
        assessments: assessmentsWithNotes,
        frequency: frequency,
        // Header and client information
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
      onClose();
    }
  );

  const handleSave = () => {
    if (!sessionId) {
      // Use toast instead of alert
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
    }
    saveProgressReport(undefined);
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onRequestClose={onClose}
      title="TREATMENT PROGRESS REPORT"
      icon={null}
      customStyles={{ maxWidth: "800px" }}
    >
      {loading ? (
        <ProgressReportModalWrapper>
          <div className="loading-container">
            <Spinner color="#000" width="40px" height="40px" />
            <p className="loading-text">Loading progress report data...</p>
          </div>
        </ProgressReportModalWrapper>
      ) : (
        <ProgressReportModalWrapper>
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
              <strong>Date of Progress Report:</strong> {reportDate}
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
            <div className="client-info-field">
              <strong>Session Number:</strong> {sessionNumber}
            </div>
            <div>
              <strong>Total Sessions Completed:</strong>{" "}
              {totalSessionsCompleted}
            </div>
          </div>

          {/* Session Summary */}
          <div className="form-section">
            <div className="section-title">
              <strong>1. Session Summary</strong>
            </div>
            <textarea
              value={sessionSummary}
              onChange={(e) => setSessionSummary(e.target.value)}
              placeholder="Enter session summary..."
              className="session-summary"
            />
          </div>

          {/* Progress Since Last Session */}
          <div className="form-section">
            <div className="section-title">
              <strong>2. Progress Since Last Session</strong>
            </div>
            <textarea
              value={progressSinceLastSession}
              onChange={(e) => setProgressSinceLastSession(e.target.value)}
              placeholder="Enter progress since last session..."
              className="progress-summary"
            />
          </div>

          {/* Risk Screening */}
          <div className="risk-screening">
            <div className="section-title">
              <strong>3. Risk Screening</strong>
            </div>
            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={riskScreeningFlags.no_risk}
                  onChange={(e) =>
                    setRiskScreeningFlags({
                      ...riskScreeningFlags,
                      no_risk: e.target.checked,
                    })
                  }
                />{" "}
                No risk
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={riskScreeningFlags.suicidal_ideation}
                  onChange={(e) =>
                    setRiskScreeningFlags({
                      ...riskScreeningFlags,
                      suicidal_ideation: e.target.checked,
                    })
                  }
                />{" "}
                Suicidal ideation
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={riskScreeningFlags.self_harm}
                  onChange={(e) =>
                    setRiskScreeningFlags({
                      ...riskScreeningFlags,
                      self_harm: e.target.checked,
                    })
                  }
                />{" "}
                Self-harm
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={riskScreeningFlags.substance_concerns}
                  onChange={(e) =>
                    setRiskScreeningFlags({
                      ...riskScreeningFlags,
                      substance_concerns: e.target.checked,
                    })
                  }
                />{" "}
                Substance concerns
              </label>
            </div>
            <div className="section-title">
              <strong>Note:</strong>
            </div>
            <textarea
              value={riskScreeningNote}
              onChange={(e) => setRiskScreeningNote(e.target.value)}
              placeholder="Enter risk screening notes..."
              className="risk-screening-note"
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
              assessments.slice(0, 5).map((assessment: any, index: number) => {
                const formName =
                  assessment?.tool ||
                  assessment?.form_cde ||
                  `Assessment ${index + 1}`;
                const score = assessment?.score || "N/A";

                return (
                  <div key={index} className="assessment-item">
                    <div className="assessment-header">
                      <strong>Tool:</strong> {formName} <strong>Score:</strong>{" "}
                      {score}
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
          <div className="therapist-signoff">
            <h3 className="signoff-title">THERAPIST SIGN-OFF</h3>
            <div className="signoff-text">
              Electronically approved by <strong>{therapistName}</strong>,{" "}
              <strong>{therapistDesignation}</strong> on{" "}
              <strong>{reportDate}</strong> via MindBridge.
            </div>
          </div>

          {/* Validation Checkbox */}
          <div
            style={{
              marginTop: "20px",
              padding: "15px",
              backgroundColor: "#f8f9fa",
              borderRadius: "4px",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={isAccepted}
                onChange={(e) => setIsAccepted(e.target.checked)}
                style={{
                  marginRight: "10px",
                  marginTop: "3px",
                  cursor: "pointer",
                }}
                required
              />
              <span style={{ fontSize: "14px", lineHeight: "1.5" }}>
                I hereby confirm that I have reviewed and accept the accuracy of
                all information provided in this progress report. I understand
                that this report will be submitted as an official record of the
                treatment session.
              </span>
            </label>
          </div>

          {/* Save Button */}
          <div style={{ marginTop: "20px", textAlign: "right" }}>
            <button
              onClick={handleSave}
              disabled={isSaving || !isAccepted}
              style={{
                padding: "10px 20px",
                backgroundColor:
                  isAccepted && !isSaving ? "#007bff" : "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: isSaving || !isAccepted ? "not-allowed" : "pointer",
                fontSize: "16px",
                fontWeight: "500",
                opacity: isSaving || !isAccepted ? 0.6 : 1,
              }}
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </ProgressReportModalWrapper>
      )}
    </CustomModal>
  );
};

export default ProgressReportModal;
