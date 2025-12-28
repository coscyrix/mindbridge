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
import styled from "styled-components";

const TreatmentPlanModalWrapper = styled(ProgressReportModalWrapper)`
  .treatment-plan-section {
    margin-bottom: 24px;
  }

  .section-heading {
    color: #0066cc;
    font-weight: bold;
    font-size: 16px;
    margin-bottom: 12px;
  }

  .form-field {
    margin-bottom: 16px;
  }

  .form-field label {
    display: block;
    margin-bottom: 6px;
    font-weight: 500;
  }

  .form-field input[type="text"],
  .form-field input[type="date"],
  .form-field textarea {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    font-family: inherit;
  }

  .form-field textarea {
    min-height: 100px;
    resize: vertical;
  }

  .divider {
    border-top: 1px solid #ddd;
    margin: 20px 0;
  }
`;

interface TreatmentPlanReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionRow: any;
  initialData?: any;
}

const TreatmentPlanReportModal: React.FC<TreatmentPlanReportModalProps> = ({
  isOpen,
  onClose,
  sessionRow,
  initialData,
}) => {
  const reqId = sessionRow?.thrpy_req_id || initialData?.req_id;
  const sessionId = sessionRow?.session_id;

  // Client Information
  const [clientName, setClientName] = useState("");
  const [dateTreatmentPlanCreated, setDateTreatmentPlanCreated] = useState("");

  // Clinical Assessment & Diagnosis
  const [clinicalImpressions, setClinicalImpressions] = useState("");

  // Treatment Goals
  const [longTermGoals, setLongTermGoals] = useState("");
  const [shortTermGoals, setShortTermGoals] = useState("");

  // Planned Interventions
  const [therapeuticApproaches, setTherapeuticApproaches] = useState("");
  const [sessionFrequency, setSessionFrequency] = useState("");

  // Progress Measurement
  const [progressMeasurement, setProgressMeasurement] = useState("");

  // Review & Updates
  const [planReviewDate, setPlanReviewDate] = useState("");
  const [updatesRevisions, setUpdatesRevisions] = useState("");

  // Therapist Acknowledgment
  const [therapistName, setTherapistName] = useState("");
  const [signature, setSignature] = useState("");
  const [therapistDate, setTherapistDate] = useState("");

  // State for validation checkbox
  const [isAccepted, setIsAccepted] = useState(false);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setClientName("");
      setDateTreatmentPlanCreated("");
      setClinicalImpressions("");
      setLongTermGoals("");
      setShortTermGoals("");
      setTherapeuticApproaches("");
      setSessionFrequency("");
      setProgressMeasurement("");
      setPlanReviewDate("");
      setUpdatesRevisions("");
      setTherapistName("");
      setSignature("");
      setTherapistDate("");
      setIsAccepted(false);
    }
  }, [isOpen]);

  // Fetch treatment plan report data
  const {
    data: treatmentPlanReportResponse,
    isPending: isLoadingReport,
    isFetching: isFetchingReport,
  } = useQueryData(
    ["treatment-plan-report-data", reqId, sessionId],
    async () => {
      if (!reqId) return null;
      const params: any = { thrpy_req_id: reqId, report_type: "TREATMENT_PLAN" };
      if (sessionId) {
        params.session_id = sessionId;
      }
      try {
        const response = await api.get("/report-data", { params });
        if (response?.status === 200 && response?.data) {
          const reports = Array.isArray(response.data)
            ? response.data
            : [response.data];
          const treatmentPlanReport = reports.find(
            (r: any) => r.report_type === "TREATMENT_PLAN"
          );
          return treatmentPlanReport || null;
        }
        return null;
      } catch (error) {
        console.error("Error fetching treatment plan report:", error);
        return null;
      }
    },
    isOpen && !!reqId
  );

  const reportData = treatmentPlanReportResponse as any;
  const loading = isLoadingReport || isFetchingReport;

  // Populate form fields when data is loaded
  useEffect(() => {
    if (reportData && !loading) {
      const treatmentPlanData = reportData.type_data || reportData;

      if (treatmentPlanData.metadata) {
        const metadata =
          typeof treatmentPlanData.metadata === "string"
            ? JSON.parse(treatmentPlanData.metadata)
            : treatmentPlanData.metadata;

        if (metadata.client_information) {
          setClientName(metadata.client_information.client_name || "");
          setDateTreatmentPlanCreated(
            metadata.client_information.date_created || ""
          );
        }

        if (metadata.clinical_assessment) {
          setClinicalImpressions(
            metadata.clinical_assessment.clinical_impressions || ""
          );
        }

        if (metadata.treatment_goals) {
          setLongTermGoals(metadata.treatment_goals.long_term || "");
          setShortTermGoals(metadata.treatment_goals.short_term || "");
        }

        if (metadata.planned_interventions) {
          setTherapeuticApproaches(
            metadata.planned_interventions.therapeutic_approaches || ""
          );
          setSessionFrequency(
            metadata.planned_interventions.session_frequency || ""
          );
        }

        if (metadata.progress_measurement) {
          setProgressMeasurement(
            metadata.progress_measurement.how_measured || ""
          );
        }

        if (metadata.review_updates) {
          setPlanReviewDate(metadata.review_updates.review_date || "");
          setUpdatesRevisions(metadata.review_updates.updates || "");
        }

        if (metadata.therapist_acknowledgment) {
          setTherapistName(
            metadata.therapist_acknowledgment.therapist_name || ""
          );
          setSignature(metadata.therapist_acknowledgment.signature || "");
          setTherapistDate(metadata.therapist_acknowledgment.date || "");
        }
      }
    }
  }, [reportData, loading]);

  // Save treatment plan report mutation
  const { mutate: saveTreatmentPlanReport, isPending: isSaving } =
    useMutationData(
      ["saveTreatmentPlanReport"],
      async () => {
        const existingReportId = reportData?.report_id;

        let reportId = existingReportId;

        // If no report_id exists, we need to create a report first
        if (!reportId) {
          try {
            const reportPayload = {
              session_id: sessionId,
              client_id: sessionRow?.client_id || initialData?.client_id,
              counselor_id:
                sessionRow?.counselor_id || initialData?.counselor_id,
              report_type: "TREATMENT_PLAN",
            };
            const reportResponse = await api.post("/report-data", reportPayload);
            if (reportResponse?.status === 200 && reportResponse?.data?.id) {
              reportId = reportResponse.data.id;
            } else {
              throw new Error("Failed to create report");
            }
          } catch (error) {
            console.error("Error creating report:", error);
            toast.error("Failed to create report. Please try again.");
            throw error;
          }
        }

        const payload: any = {
          report_id: reportId,
          metadata: {
            client_information: {
              client_name: clientName,
              date_created: dateTreatmentPlanCreated,
            },
            clinical_assessment: {
              clinical_impressions: clinicalImpressions,
            },
            treatment_goals: {
              long_term: longTermGoals,
              short_term: shortTermGoals,
            },
            planned_interventions: {
              therapeutic_approaches: therapeuticApproaches,
              session_frequency: sessionFrequency,
            },
            progress_measurement: {
              how_measured: progressMeasurement,
            },
            review_updates: {
              review_date: planReviewDate,
              updates: updatesRevisions,
            },
            therapist_acknowledgment: {
              therapist_name: therapistName,
              signature: signature,
              date: therapistDate,
            },
          },
        };

        const response = await api.post("/report-data/treatment-plan", payload);
        return response;
      },
      ["treatment-plan-report-data"],
      () => {
        toast.success("Treatment plan report saved successfully");
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
    saveTreatmentPlanReport(undefined);
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) return "";
    return moment(date).format("YYYY-MM-DD");
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onRequestClose={onClose}
      title="TREATMENT PLAN (Confidential)"
      icon={null}
      customStyles={{ maxWidth: "800px" }}
    >
      {loading ? (
        <TreatmentPlanModalWrapper>
          <div className="loading-container">
            <Spinner color="#000" width="40px" height="40px" />
            <p className="loading-text">Loading treatment plan data...</p>
          </div>
        </TreatmentPlanModalWrapper>
      ) : (
        <TreatmentPlanModalWrapper>
          {/* Client Information */}
          <div className="treatment-plan-section">
            <h3 className="section-heading">Client Information</h3>
            <div className="form-field">
              <label>Client Name:</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Enter client name"
              />
            </div>
            <div className="form-field">
              <label>Date Treatment Plan Created:</label>
              <input
                type="date"
                value={dateTreatmentPlanCreated}
                onChange={(e) => setDateTreatmentPlanCreated(e.target.value)}
              />
            </div>
          </div>

          <div className="divider"></div>

          {/* Clinical Assessment & Diagnosis */}
          <div className="treatment-plan-section">
            <h3 className="section-heading">Clinical Assessment & Diagnosis</h3>
            <div className="form-field">
              <label>
                Clinical impressions / diagnosis (if applicable):
              </label>
              <textarea
                value={clinicalImpressions}
                onChange={(e) => setClinicalImpressions(e.target.value)}
                placeholder="Enter clinical impressions or diagnosis"
              />
            </div>
          </div>

          <div className="divider"></div>

          {/* Treatment Goals */}
          <div className="treatment-plan-section">
            <h3 className="section-heading">Treatment Goals</h3>
            <div className="form-field">
              <label>Long-term goals:</label>
              <textarea
                value={longTermGoals}
                onChange={(e) => setLongTermGoals(e.target.value)}
                placeholder="Enter long-term goals"
              />
            </div>
            <div className="form-field">
              <label>Short-term goals:</label>
              <textarea
                value={shortTermGoals}
                onChange={(e) => setShortTermGoals(e.target.value)}
                placeholder="Enter short-term goals"
              />
            </div>
          </div>

          <div className="divider"></div>

          {/* Planned Interventions */}
          <div className="treatment-plan-section">
            <h3 className="section-heading">Planned Interventions</h3>
            <div className="form-field">
              <label>
                Therapeutic approaches (e.g., CBT, DBT, EMDR):
              </label>
              <textarea
                value={therapeuticApproaches}
                onChange={(e) => setTherapeuticApproaches(e.target.value)}
                placeholder="Enter therapeutic approaches"
              />
            </div>
            <div className="form-field">
              <label>Session frequency:</label>
              <input
                type="text"
                value={sessionFrequency}
                onChange={(e) => setSessionFrequency(e.target.value)}
                placeholder="Enter session frequency"
              />
            </div>
          </div>

          <div className="divider"></div>

          {/* Progress Measurement */}
          <div className="treatment-plan-section">
            <h3 className="section-heading">Progress Measurement</h3>
            <div className="form-field">
              <label>How progress will be measured:</label>
              <textarea
                value={progressMeasurement}
                onChange={(e) => setProgressMeasurement(e.target.value)}
                placeholder="Enter how progress will be measured"
              />
            </div>
          </div>

          <div className="divider"></div>

          {/* Review & Updates */}
          <div className="treatment-plan-section">
            <h3 className="section-heading">Review & Updates</h3>
            <div className="form-field">
              <label>Plan review date(s):</label>
              <input
                type="text"
                value={planReviewDate}
                onChange={(e) => setPlanReviewDate(e.target.value)}
                placeholder="Enter plan review date(s)"
              />
            </div>
            <div className="form-field">
              <label>Updates / revisions:</label>
              <textarea
                value={updatesRevisions}
                onChange={(e) => setUpdatesRevisions(e.target.value)}
                placeholder="Enter updates or revisions"
              />
            </div>
          </div>

          <div className="divider"></div>

          {/* Therapist Acknowledgment */}
          <div className="treatment-plan-section">
            <h3 className="section-heading">Therapist Acknowledgment</h3>
            <div className="form-field">
              <label>Therapist Name:</label>
              <input
                type="text"
                value={therapistName}
                onChange={(e) => setTherapistName(e.target.value)}
                placeholder="Enter therapist name"
              />
            </div>
            <div className="form-field">
              <label>Signature:</label>
              <input
                type="text"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder="Enter signature"
              />
            </div>
            <div className="form-field">
              <label>Date:</label>
              <input
                type="date"
                value={therapistDate}
                onChange={(e) => setTherapistDate(e.target.value)}
              />
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
                all information provided in this treatment plan report. I
                understand that this report will be submitted as an official
                record.
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
        </TreatmentPlanModalWrapper>
      )}
    </CustomModal>
  );
};

export default TreatmentPlanReportModal;

