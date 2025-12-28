import React, { useState, useEffect } from "react";
import CustomModal from "../../../CustomModal";
import Spinner from "../../../common/Spinner";
import moment from "moment";
import CommonServices from "../../../../services/CommonServices";
import { useQueryData } from "../../../../utils/hooks/useQueryData";
import { useMutationData } from "../../../../utils/hooks/useMutationData";
import { capitalizeName } from "../../../../utils/constants";
import { DischargeReportModalWrapper } from "../style";
import { api } from "../../../../utils/auth";

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

  // State for discharge reason checkboxes
  const [dischargeReasonGoalsMet, setDischargeReasonGoalsMet] = useState(false);
  const [dischargeReasonClientWithdrew, setDischargeReasonClientWithdrew] =
    useState(false);
  const [dischargeReasonReferralMade, setDischargeReasonReferralMade] =
    useState(false);
  const [dischargeReasonOther, setDischargeReasonOther] = useState(false);
  const [dischargeReasonOtherText, setDischargeReasonOtherText] = useState("");

  // State for text areas
  const [treatmentSummary, setTreatmentSummary] = useState("");
  const [remainingConcerns, setRemainingConcerns] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [clientUnderstanding, setClientUnderstanding] = useState("");
  const [therapistNotes, setTherapistNotes] = useState<{
    [key: number]: string;
  }>({});

  // State for validation checkbox
  const [isAccepted, setIsAccepted] = useState(false);

  // Reset form when modal closes or session changes
  useEffect(() => {
    if (!isOpen) {
      setDischargeReasonGoalsMet(false);
      setDischargeReasonClientWithdrew(false);
      setDischargeReasonReferralMade(false);
      setDischargeReasonOther(false);
      setDischargeReasonOtherText("");
      setTreatmentSummary("");
      setRemainingConcerns("");
      setRecommendations("");
      setClientUnderstanding("");
      setTherapistNotes({});
      setIsAccepted(false);
    }
  }, [isOpen]);

  // Fetch discharge report data using the new API
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

  // Save discharge report mutation
  const { mutate: saveDischargeReport, isPending: isSaving } = useMutationData(
    ["saveDischargeReport"],
    async () => {
      // Prepare assessments with therapist notes
      const assessmentsWithNotes = assessments.map(
        (assessment: any, index: number) => ({
          form_name: assessment?.form_cde || `Assessment ${index + 1}`,
          score: assessment?.score || "N/A",
          therapist_notes: therapistNotes[index] || "",
        })
      );

      // Prepare discharge reason flags
      const dischargeReasonFlags = {
        goals_met: dischargeReasonGoalsMet,
        client_withdrew: dischargeReasonClientWithdrew,
        referral_made: dischargeReasonReferralMade,
        other: dischargeReasonOther,
      };

      const payload = {
        session_id: sessionId,
        client_id: reportData?.client_id || sessionRow?.client_id,
        counselor_id: reportData?.counselor_id || sessionRow?.counselor_id,
        discharge_reason_flags: dischargeReasonFlags,
        discharge_reason_other: dischargeReasonOtherText,
        treatment_summary: treatmentSummary,
        remaining_concerns: remainingConcerns,
        recommendations: recommendations,
        client_understanding: clientUnderstanding,
        assessments: assessmentsWithNotes,
        discharge_date:
          reportData?.session_date ||
          sessionRow?.intake_date ||
          new Date().toISOString(),
      };

      return await CommonServices.saveDischargeReport(payload);
    },
    ["discharge-report-data"],
    () => {
      onClose();
    }
  );

  const handleSave = () => {
    if (!sessionId) {
      alert("Session ID is required");
      return;
    }
    if (!isAccepted) {
      alert(
        "Please confirm that you accept the above information before saving."
      );
      return;
    }
    saveDischargeReport(undefined);
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
        <DischargeReportModalWrapper>
          <div className="loading-container">
            <Spinner color="#000" width="40px" height="40px" />
            <p className="loading-text">Loading discharge report data...</p>
          </div>
        </DischargeReportModalWrapper>
      ) : (
        <DischargeReportModalWrapper>
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

          {/* Reason for Discharge */}
          <div className="form-section">
            <div className="section-title">
              <strong>Reason for Discharge</strong>
            </div>
            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={dischargeReasonGoalsMet}
                  onChange={(e) => setDischargeReasonGoalsMet(e.target.checked)}
                />{" "}
                Treatment goals met
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={dischargeReasonClientWithdrew}
                  onChange={(e) =>
                    setDischargeReasonClientWithdrew(e.target.checked)
                  }
                />{" "}
                Client withdrew
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={dischargeReasonReferralMade}
                  onChange={(e) =>
                    setDischargeReasonReferralMade(e.target.checked)
                  }
                />{" "}
                Referral made
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={dischargeReasonOther}
                  onChange={(e) => setDischargeReasonOther(e.target.checked)}
                />{" "}
                Other
              </label>
            </div>
            {dischargeReasonOther && (
              <div style={{ marginTop: "10px" }}>
                <div className="section-title">
                  <strong>If 'Other':</strong>
                </div>
                <textarea
                  value={dischargeReasonOtherText}
                  onChange={(e) => setDischargeReasonOtherText(e.target.value)}
                  placeholder="Please specify other reason..."
                  className="risk-screening-note"
                />
              </div>
            )}
          </div>

          {/* Treatment Summary */}
          <div className="form-section">
            <div className="section-title">
              <strong>Treatment Summary</strong>
            </div>
            <textarea
              value={treatmentSummary}
              onChange={(e) => setTreatmentSummary(e.target.value)}
              placeholder="Enter treatment summary..."
              className="session-summary"
            />
          </div>

          {/* Final Assessment */}
          <div className="form-section">
            <div className="section-title">
              <strong>Final Assessment (Auto-Filled)</strong>
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

            {/* Remaining concerns */}
            <div style={{ marginTop: "20px" }}>
              <div className="section-title">
                <strong>Remaining concerns:</strong>
              </div>
              <textarea
                value={remainingConcerns}
                onChange={(e) => setRemainingConcerns(e.target.value)}
                placeholder="Enter remaining concerns..."
                className="session-summary"
              />
            </div>
          </div>

          {/* Recommendations Post-Discharge */}
          <div className="form-section">
            <div className="section-title">
              <strong>Recommendations Post-Discharge</strong>
            </div>
            <textarea
              value={recommendations}
              onChange={(e) => setRecommendations(e.target.value)}
              placeholder="Enter recommendations post-discharge..."
              className="session-summary"
            />
          </div>

          {/* Client/caregiver understanding */}
          <div className="form-section">
            <div className="section-title">
              <strong>Client/caregiver understanding:</strong>
            </div>
            <textarea
              value={clientUnderstanding}
              onChange={(e) => setClientUnderstanding(e.target.value)}
              placeholder="Enter client/caregiver understanding..."
              className="session-summary"
            />
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
                all information provided in this discharge report. I understand
                that this report will be submitted as an official record of the
                client's discharge from treatment.
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
        </DischargeReportModalWrapper>
      )}
    </CustomModal>
  );
};

export default DischargeReportModal;
