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

const IntakeReportModalWrapper = styled(ProgressReportModalWrapper)`
  .intake-form-section {
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
  .form-field input[type="email"],
  .form-field input[type="tel"],
  .form-field textarea {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    font-family: inherit;
  }

  .form-field textarea {
    min-height: 80px;
    resize: vertical;
  }

  .checkbox-group {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-top: 8px;
  }

  .checkbox-group label {
    display: flex;
    align-items: center;
    cursor: pointer;
    font-weight: normal;
  }

  .checkbox-group input[type="checkbox"] {
    margin-right: 6px;
    cursor: pointer;
  }

  .radio-group {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-top: 8px;
  }

  .radio-group label {
    display: flex;
    align-items: center;
    cursor: pointer;
    font-weight: normal;
  }

  .radio-group input[type="radio"] {
    margin-right: 6px;
    cursor: pointer;
  }

  .symptoms-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-top: 8px;
  }

  .symptoms-grid label {
    font-weight: normal;
  }

  .consent-text {
    margin-top: 20px;
    padding: 12px;
    background-color: #f8f9fa;
    border-radius: 4px;
    font-size: 14px;
  }

  .divider {
    border-top: 1px solid #ddd;
    margin: 20px 0;
  }
`;

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

  // Client Information
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");

  // Presenting Problem
  const [reasonForTherapy, setReasonForTherapy] = useState("");
  const [durationOfConcern, setDurationOfConcern] = useState("");

  // Symptoms
  const [symptoms, setSymptoms] = useState({
    anxiety: false,
    depression: false,
    stress: false,
    sleepIssues: false,
    moodChanges: false,
    relationshipIssues: false,
  });
  const [otherSymptoms, setOtherSymptoms] = useState("");

  // Mental Health & Medical History
  const [previousTherapy, setPreviousTherapy] = useState("");
  const [currentMedications, setCurrentMedications] = useState("");
  const [medicalConditions, setMedicalConditions] = useState("");

  // Safety Assessment
  const [thoughtsOfSelfHarm, setThoughtsOfSelfHarm] = useState("");
  const [thoughtsOfHarmingOthers, setThoughtsOfHarmingOthers] = useState("");
  const [immediateSafetyConcerns, setImmediateSafetyConcerns] = useState("");

  // Initial Clinical Impression
  const [clinicalImpression, setClinicalImpression] = useState("");

  // State for validation checkbox
  const [isAccepted, setIsAccepted] = useState(false);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFullName("");
      setPhone("");
      setEmail("");
      setEmergencyContact("");
      setReasonForTherapy("");
      setDurationOfConcern("");
      setSymptoms({
        anxiety: false,
        depression: false,
        stress: false,
        sleepIssues: false,
        moodChanges: false,
        relationshipIssues: false,
      });
      setOtherSymptoms("");
      setPreviousTherapy("");
      setCurrentMedications("");
      setMedicalConditions("");
      setThoughtsOfSelfHarm("");
      setThoughtsOfHarmingOthers("");
      setImmediateSafetyConcerns("");
      setClinicalImpression("");
      setIsAccepted(false);
    }
  }, [isOpen]);

  // Fetch intake report data - using the getReportById endpoint with filters
  const {
    data: intakeReportResponse,
    isPending: isLoadingReport,
    isFetching: isFetchingReport,
  } = useQueryData(
    ["intake-report-data", reqId, sessionId],
    async () => {
      if (!reqId) return null;
      const params: any = { thrpy_req_id: reqId, report_type: "INTAKE" };
      if (sessionId) {
        params.session_id = sessionId;
      }
      // Using the report-data endpoint with filters
      try {
        const response = await api.get("/report-data", { params });
        if (response?.status === 200 && response?.data) {
          // The response might be an array, get the first one if it's an intake report
          const reports = Array.isArray(response.data)
            ? response.data
            : [response.data];
          const intakeReport = reports.find(
            (r: any) => r.report_type === "INTAKE"
          );
          return intakeReport || null;
        }
        return null;
      } catch (error) {
        console.error("Error fetching intake report:", error);
        return null;
      }
    },
    isOpen && !!reqId
  );

  const reportData = intakeReportResponse as any;
  const loading = isLoadingReport || isFetchingReport;

  // Populate form fields when data is loaded
  useEffect(() => {
    if (reportData && !loading) {
      // Check if reportData has type_data (from getCompleteReport) or direct metadata
      const intakeData = reportData.type_data || reportData;

      // Populate client information
      if (intakeData.metadata) {
        const metadata =
          typeof intakeData.metadata === "string"
            ? JSON.parse(intakeData.metadata)
            : intakeData.metadata;

        if (metadata.client_information) {
          setFullName(metadata.client_information.full_name || "");
          setPhone(metadata.client_information.phone || "");
          setEmail(metadata.client_information.email || "");
          setEmergencyContact(
            metadata.client_information.emergency_contact || ""
          );
        }

        if (metadata.presenting_problem) {
          setReasonForTherapy(metadata.presenting_problem.reason || "");
          setDurationOfConcern(metadata.presenting_problem.duration || "");
        }

        if (metadata.symptoms) {
          setSymptoms({
            anxiety: metadata.symptoms.anxiety || false,
            depression: metadata.symptoms.depression || false,
            stress: metadata.symptoms.stress || false,
            sleepIssues: metadata.symptoms.sleep_issues || false,
            moodChanges: metadata.symptoms.mood_changes || false,
            relationshipIssues: metadata.symptoms.relationship_issues || false,
          });
          setOtherSymptoms(metadata.symptoms.other || "");
        }

        if (metadata.mental_health_history) {
          setPreviousTherapy(
            metadata.mental_health_history.previous_therapy || ""
          );
          setCurrentMedications(
            metadata.mental_health_history.current_medications || ""
          );
          setMedicalConditions(
            metadata.mental_health_history.medical_conditions || ""
          );
        }

        if (metadata.safety_assessment) {
          setThoughtsOfSelfHarm(
            metadata.safety_assessment.thoughts_of_self_harm || ""
          );
          setThoughtsOfHarmingOthers(
            metadata.safety_assessment.thoughts_of_harming_others || ""
          );
          setImmediateSafetyConcerns(
            metadata.safety_assessment.immediate_safety_concerns || ""
          );
        }

        if (metadata.clinical_impression) {
          setClinicalImpression(metadata.clinical_impression || "");
        }
      }
    }
  }, [reportData, loading]);

  // Save intake report mutation
  const { mutate: saveIntakeReport, isPending: isSaving } = useMutationData(
    ["saveIntakeReport"],
    async () => {
      // Need report_id to save intake report data
      // First, check if we have an existing report_id
      const existingReportId = reportData?.report_id;

      let reportId = existingReportId;

      // If no report_id exists, we need to create a report first
      if (!reportId) {
        try {
          const reportPayload = {
            session_id: sessionId,
            client_id: sessionRow?.client_id || initialData?.client_id,
            counselor_id: sessionRow?.counselor_id || initialData?.counselor_id,
            report_type: "INTAKE",
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

      // The API expects report_id and may accept metadata
      // Based on the schema, metadata is stored as JSON
      const payload: any = {
        report_id: reportId,
        metadata: {
          client_information: {
            full_name: fullName,
            phone: phone,
            email: email,
            emergency_contact: emergencyContact,
          },
          presenting_problem: {
            reason: reasonForTherapy,
            duration: durationOfConcern,
          },
          symptoms: {
            anxiety: symptoms.anxiety,
            depression: symptoms.depression,
            stress: symptoms.stress,
            sleep_issues: symptoms.sleepIssues,
            mood_changes: symptoms.moodChanges,
            relationship_issues: symptoms.relationshipIssues,
            other: otherSymptoms,
          },
          mental_health_history: {
            previous_therapy: previousTherapy,
            current_medications: currentMedications,
            medical_conditions: medicalConditions,
          },
          safety_assessment: {
            thoughts_of_self_harm: thoughtsOfSelfHarm,
            thoughts_of_harming_others: thoughtsOfHarmingOthers,
            immediate_safety_concerns: immediateSafetyConcerns,
          },
          clinical_impression: clinicalImpression,
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
    saveIntakeReport(undefined);
  };

  const handleSymptomChange = (symptom: string, checked: boolean) => {
    setSymptoms({
      ...symptoms,
      [symptom]: checked,
    });
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
        <IntakeReportModalWrapper>
          <div className="loading-container">
            <Spinner color="#000" width="40px" height="40px" />
            <p className="loading-text">Loading intake report data...</p>
          </div>
        </IntakeReportModalWrapper>
      ) : (
        <IntakeReportModalWrapper>
          {/* Client Information */}
          <div className="intake-form-section">
            <h3 className="section-heading">Client Information</h3>
            <div className="form-field">
              <label>Full Name:</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter full name"
              />
            </div>
            <div className="form-field">
              <label>Phone:</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
              />
            </div>
            <div className="form-field">
              <label>Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
              />
            </div>
            <div className="form-field">
              <label>Emergency Contact:</label>
              <input
                type="text"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder="Enter emergency contact"
              />
            </div>
          </div>

          <div className="divider"></div>

          {/* Presenting Problem */}
          <div className="intake-form-section">
            <h3 className="section-heading">Presenting Problem</h3>
            <div className="form-field">
              <label>Reason for seeking therapy:</label>
              <textarea
                value={reasonForTherapy}
                onChange={(e) => setReasonForTherapy(e.target.value)}
                placeholder="Enter reason for seeking therapy"
              />
            </div>
            <div className="form-field">
              <label>Duration of concern:</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="duration"
                    value="less_than_1_month"
                    checked={durationOfConcern === "less_than_1_month"}
                    onChange={(e) => setDurationOfConcern(e.target.value)}
                  />
                  Less than 1 month
                </label>
                <label>
                  <input
                    type="radio"
                    name="duration"
                    value="1_6_months"
                    checked={durationOfConcern === "1_6_months"}
                    onChange={(e) => setDurationOfConcern(e.target.value)}
                  />
                  1-6 months
                </label>
                <label>
                  <input
                    type="radio"
                    name="duration"
                    value="6_12_months"
                    checked={durationOfConcern === "6_12_months"}
                    onChange={(e) => setDurationOfConcern(e.target.value)}
                  />
                  6-12 months
                </label>
                <label>
                  <input
                    type="radio"
                    name="duration"
                    value="over_1_year"
                    checked={durationOfConcern === "over_1_year"}
                    onChange={(e) => setDurationOfConcern(e.target.value)}
                  />
                  Over 1 year
                </label>
              </div>
            </div>
          </div>

          <div className="divider"></div>

          {/* Symptoms */}
          <div className="intake-form-section">
            <h3 className="section-heading">Symptoms</h3>
            <div className="symptoms-grid">
              <label>
                <input
                  type="checkbox"
                  checked={symptoms.anxiety}
                  onChange={(e) =>
                    handleSymptomChange("anxiety", e.target.checked)
                  }
                />
                Anxiety
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={symptoms.depression}
                  onChange={(e) =>
                    handleSymptomChange("depression", e.target.checked)
                  }
                />
                Depression
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={symptoms.stress}
                  onChange={(e) =>
                    handleSymptomChange("stress", e.target.checked)
                  }
                />
                Stress
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={symptoms.sleepIssues}
                  onChange={(e) =>
                    handleSymptomChange("sleepIssues", e.target.checked)
                  }
                />
                Sleep issues
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={symptoms.moodChanges}
                  onChange={(e) =>
                    handleSymptomChange("moodChanges", e.target.checked)
                  }
                />
                Mood changes
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={symptoms.relationshipIssues}
                  onChange={(e) =>
                    handleSymptomChange("relationshipIssues", e.target.checked)
                  }
                />
                Relationship issues
              </label>
            </div>
            <div className="form-field" style={{ marginTop: "12px" }}>
              <label>Other:</label>
              <input
                type="text"
                value={otherSymptoms}
                onChange={(e) => setOtherSymptoms(e.target.value)}
                placeholder="Enter other symptoms"
              />
            </div>
          </div>

          <div className="divider"></div>

          {/* Mental Health & Medical History */}
          <div className="intake-form-section">
            <h3 className="section-heading">Mental Health & Medical History</h3>
            <div className="form-field">
              <label>Previous therapy:</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="previousTherapy"
                    value="yes"
                    checked={previousTherapy === "yes"}
                    onChange={(e) => setPreviousTherapy(e.target.value)}
                  />
                  Yes
                </label>
                <label>
                  <input
                    type="radio"
                    name="previousTherapy"
                    value="no"
                    checked={previousTherapy === "no"}
                    onChange={(e) => setPreviousTherapy(e.target.value)}
                  />
                  No
                </label>
              </div>
            </div>
            <div className="form-field">
              <label>Current medications:</label>
              <input
                type="text"
                value={currentMedications}
                onChange={(e) => setCurrentMedications(e.target.value)}
                placeholder="Enter current medications"
              />
            </div>
            <div className="form-field">
              <label>Medical conditions (if any):</label>
              <input
                type="text"
                value={medicalConditions}
                onChange={(e) => setMedicalConditions(e.target.value)}
                placeholder="Enter medical conditions"
              />
            </div>
          </div>

          <div className="divider"></div>

          {/* Safety Assessment */}
          <div className="intake-form-section">
            <h3 className="section-heading">Safety Assessment</h3>
            <div className="form-field">
              <label>Thoughts of self-harm:</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="selfHarm"
                    value="no"
                    checked={thoughtsOfSelfHarm === "no"}
                    onChange={(e) => setThoughtsOfSelfHarm(e.target.value)}
                  />
                  No
                </label>
                <label>
                  <input
                    type="radio"
                    name="selfHarm"
                    value="past"
                    checked={thoughtsOfSelfHarm === "past"}
                    onChange={(e) => setThoughtsOfSelfHarm(e.target.value)}
                  />
                  Past
                </label>
                <label>
                  <input
                    type="radio"
                    name="selfHarm"
                    value="current"
                    checked={thoughtsOfSelfHarm === "current"}
                    onChange={(e) => setThoughtsOfSelfHarm(e.target.value)}
                  />
                  Current
                </label>
              </div>
            </div>
            <div className="form-field">
              <label>Thoughts of harming others:</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="harmingOthers"
                    value="no"
                    checked={thoughtsOfHarmingOthers === "no"}
                    onChange={(e) => setThoughtsOfHarmingOthers(e.target.value)}
                  />
                  No
                </label>
                <label>
                  <input
                    type="radio"
                    name="harmingOthers"
                    value="yes"
                    checked={thoughtsOfHarmingOthers === "yes"}
                    onChange={(e) => setThoughtsOfHarmingOthers(e.target.value)}
                  />
                  Yes
                </label>
              </div>
            </div>
            <div className="form-field">
              <label>Immediate safety concerns noted:</label>
              <input
                type="text"
                value={immediateSafetyConcerns}
                onChange={(e) => setImmediateSafetyConcerns(e.target.value)}
                placeholder="Enter immediate safety concerns"
              />
            </div>
          </div>

          <div className="divider"></div>

          {/* Initial Clinical Impression */}
          <div className="intake-form-section">
            <h3 className="section-heading">Initial Clinical Impression</h3>
            <div className="form-field">
              <textarea
                value={clinicalImpression}
                onChange={(e) => setClinicalImpression(e.target.value)}
                placeholder="Enter initial clinical impression"
                style={{ minHeight: "120px" }}
              />
            </div>
          </div>

          <div className="divider"></div>

          {/* Consent */}
          <div className="intake-form-section">
            <h3 className="section-heading">Consent</h3>
            <div className="consent-text">
              Client has provided informed consent to begin therapy services.
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
                all information provided in this intake report. I understand
                that this report will be submitted as an official record.
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
        </IntakeReportModalWrapper>
      )}
    </CustomModal>
  );
};

export default IntakeReportModal;
