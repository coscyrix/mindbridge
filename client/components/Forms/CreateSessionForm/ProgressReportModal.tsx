import React, { useState, useEffect } from "react";
import CustomModal from "../../CustomModal";
import Spinner from "../../common/Spinner";
import moment from "moment";
import CommonServices from "../../../services/CommonServices";
import { useQueryData } from "../../../utils/hooks/useQueryData";
import { capitalizeName } from "../../../utils/constants";
import { ProgressReportModalWrapper } from "./style";

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

  // Reset form when modal closes or session changes
  useEffect(() => {
    if (!isOpen) {
      setSessionSummary("");
      setProgressSinceLastSession("");
      setRiskScreeningNote("");
      setTherapistNotes({});
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

  // Extract data for the report (from API response)
  const practiceName = reportData?.service_name || "N/A";
  const therapistName =
    reportData?.counselor_first_name && reportData?.counselor_last_name
      ? `${reportData.counselor_first_name} ${reportData.counselor_last_name}`
      : "N/A";
  const therapistDesignation = reportData?.counselor_designation || "Therapist";
  const reportDate = formatDate(
    reportData?.session_date ||
      sessionRow?.intake_date ||
      sessionRow?.scheduled_time
  );
  const treatmentBlockName =
    reportData?.treatment_target || reportData?.service_name || "N/A";
  const clientFullName =
    reportData?.client_first_name && reportData?.client_last_name
      ? `${capitalizeName(reportData.client_first_name)} ${capitalizeName(
          reportData.client_last_name
        )}`
      : "N/A";
  const clientID = reportData?.client_clam_num;
  const sessionNumber = reportData?.total_sessions;

  // Get calculated fields from API
  const totalSessionsCompleted = reportData?.total_sessions_completed || 0;
  const frequency = reportData?.frequency || "Other";
  const assessments = reportData?.assessments || [];

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
                <input type="checkbox" /> No risk
              </label>
              <label>
                <input type="checkbox" /> Suicidal ideation
              </label>
              <label>
                <input type="checkbox" /> Self-harm
              </label>
              <label>
                <input type="checkbox" /> Substance concerns
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
            {assessments.length > 0
              ? assessments
                  .slice(0, 5)
                  .map((assessment: any, index: number) => {
                    const formName =
                      assessment?.form_cde || `Assessment ${index + 1}`;
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
              : null}
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
        </ProgressReportModalWrapper>
      )}
    </CustomModal>
  );
};

export default ProgressReportModal;
