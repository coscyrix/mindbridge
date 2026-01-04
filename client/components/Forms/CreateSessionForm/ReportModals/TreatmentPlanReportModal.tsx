import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import { FormProvider } from "react-hook-form";
import SignatureCanvas from "react-signature-canvas";
import { toast } from "react-toastify";
import { api } from "../../../../utils/auth";
import { useMutationData } from "../../../../utils/hooks/useMutationData";
import { useQueryData } from "../../../../utils/hooks/useQueryData";
import useZodForm from "../../../../utils/hooks/useZodForm";
import Button from "../../../Button";
import CustomInputField from "../../../CustomInputField";
import CustomModal from "../../../CustomModal";
import CustomTextArea from "../../../CustomTextArea";
import Spinner from "../../../common/Spinner";
import { ProgressReportModalWrapper } from "../style";
import ReportValidationCheckbox from "./ReportValidationCheckbox";
import styles from "./styles.module.scss";
import {
  TreatmentPlanReportPayload,
  TreatmentPlanReportResponse,
} from "./types";
import { treatmentPlanSchema } from "./treatmentPlanValidation";

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
  const reportId = sessionRow?.report_id;

  // Therapist Acknowledgment - signature only (therapist name and date are display-only)
  const signaturePadRef = useRef<any>(null);

  // State for validation checkbox
  const [isAccepted, setIsAccepted] = useState(false);

  // Initialize form with useZodForm
  const defaultValues = {
    clinicalImpressions: "",
    longTermGoals: "",
    shortTermGoals: "",
    therapeuticApproaches: "",
    sessionFrequency: "",
    progressMeasurement: "",
    planReviewDate: "",
    updatesRevisions: "",
    signature: "",
  };

  const methods = useZodForm(
    treatmentPlanSchema,
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
  const signature = watch("signature");

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset(defaultValues);
      setIsAccepted(false);
    }
  }, [isOpen, reset]);

  // Fetch treatment plan report data using thrpy_req_id and session_id (similar to progress report)
  const {
    data: treatmentPlanReportResponse,
    isPending: isLoadingReport,
    isFetching: isFetchingReport,
  } = useQueryData(
    ["treatment-plan-report-data", reqId, sessionId],
    async () => {
      if (!reqId) return null;

      const params: any = {
        thrpy_req_id: reqId,
      };
      if (sessionId) {
        params.session_id = sessionId;
      }

      try {
        const response = await api.get(
          "/report-data/treatment-plan-report-data",
          { params }
        );
        if (response?.status === 200 && response?.data?.rec) {
          return response.data.rec;
        }
        return null;
      } catch (error) {
        console.error("Error fetching treatment plan report:", error);
        return null;
      }
    },
    isOpen && !!reqId
  );

  const reportData = treatmentPlanReportResponse as any | null;
  const loading = isLoadingReport || isFetchingReport;

  const formatDate = (date: string | null | undefined) => {
    if (!date) return "N/A";
    return moment(date).format("MMMM DD, YYYY");
  };

  // Extract client information from reportData or sessionRow/initialData
  const getClientInfo = () => {
    // Get client name from reportData first, then fallback to sessionRow/initialData
    const clientName =
      reportData?.client_information?.client_name ||
      (sessionRow?.client_first_name && sessionRow?.client_last_name
        ? `${sessionRow.client_first_name} ${sessionRow.client_last_name}`
        : initialData?.client_first_name && initialData?.client_last_name
        ? `${initialData.client_first_name} ${initialData.client_last_name}`
        : "N/A");

    // Get date from reportData first, then fallback to sessionRow/initialData
    const dateSource =
      reportData?.client_information?.treatment_plan_date ||
      sessionRow?.intake_date ||
      initialData?.req_dte_not_formatted ||
      moment().format("YYYY-MM-DD");
    const dateCreated = formatDate(dateSource);

    return { clientName, dateCreated };
  };

  const { clientName, dateCreated } = getClientInfo();

  // Extract therapist information from reportData or sessionRow/initialData
  const getTherapistInfo = () => {
    // Get therapist name from reportData first, then fallback to sessionRow/initialData
    const therapistName =
      reportData?.therapist_acknowledgment?.therapist_name ||
      (sessionRow?.counselor_first_name && sessionRow?.counselor_last_name
        ? `${sessionRow.counselor_first_name} ${sessionRow.counselor_last_name}`
        : initialData?.counselor_first_name && initialData?.counselor_last_name
        ? `${initialData.counselor_first_name} ${initialData.counselor_last_name}`
        : "N/A");

    // Use current date for therapist acknowledgment date
    const therapistDate = formatDate(moment().format("YYYY-MM-DD"));

    return { therapistName, therapistDate };
  };

  const { therapistName, therapistDate } = getTherapistInfo();

  // Populate form fields when data is loaded
  useEffect(() => {
    if (reportData && !loading) {
      // New data structure: reportData directly contains the treatment plan data (no nested metadata)
      if (reportData.report?.clinical_assessment) {
        setValue(
          "clinicalImpressions",
          reportData.report.clinical_assessment.clinical_impressions || ""
        );
      }

      if (reportData.report?.treatment_goals) {
        setValue(
          "longTermGoals",
          reportData.report.treatment_goals.long_term || ""
        );
        setValue(
          "shortTermGoals",
          reportData.report.treatment_goals.short_term || ""
        );
      }

      if (reportData.report?.planned_interventions) {
        setValue(
          "therapeuticApproaches",
          reportData.report.planned_interventions.therapeutic_approaches || ""
        );
        setValue(
          "sessionFrequency",
          reportData.report.planned_interventions.session_frequency || ""
        );
      }

      if (reportData.report?.progress_measurement) {
        setValue(
          "progressMeasurement",
          reportData.report.progress_measurement.how_measured || ""
        );
      }

      if (reportData.report?.review_updates) {
        setValue(
          "planReviewDate",
          reportData.report.review_updates.review_date || ""
        );
        setValue(
          "updatesRevisions",
          reportData.report.review_updates.updates || ""
        );
      }

      if (reportData.therapist_acknowledgment) {
        setValue(
          "signature",
          reportData.therapist_acknowledgment.signature || ""
        );
      }
    }
  }, [reportData, loading, setValue]);

  // Save treatment plan report mutation
  const { mutate: saveTreatmentPlanReport, isPending: isSaving } =
    useMutationData(
      ["saveTreatmentPlanReport"],
      async () => {
        // Use reportId from reportData first, then from sessionRow, then from initialData
        const existingReportId =
          reportData?.report_id || reportId || initialData?.report_id;

        if (!existingReportId) {
          toast.error("Report ID is required. Please try again.");
          throw new Error("Report ID is missing");
        }

        let reportIdToUse = existingReportId;

        const formValues = getValues();

        // Get client name for client_information section (already extracted from sessionRow/initialData)
        const clientFullName = clientName !== "N/A" ? clientName : "N/A";

        // Get date for treatment plan (already extracted from sessionRow/initialData)
        // Format as ISO timestamp (e.g., 2025-12-28T19:18:50.000Z)
        let dateCreatedFormatted = moment().toISOString();
        if (dateCreated !== "N/A") {
          // Try parsing the formatted date, if it fails, use current timestamp
          const parsed = moment(dateCreated, "MMMM DD, YYYY");
          dateCreatedFormatted = parsed.isValid()
            ? parsed.toISOString()
            : moment().toISOString();
        } else {
          // If dateCreated is N/A, try to get from sessionRow/initialData directly
          const dateSource =
            sessionRow?.intake_date ||
            initialData?.req_dte_not_formatted ||
            moment().toISOString();
          dateCreatedFormatted = moment(dateSource).isValid()
            ? moment(dateSource).toISOString()
            : moment().toISOString();
        }

        // Structure payload with only necessary data from frontend
        const payload: TreatmentPlanReportPayload = {
          report_id: reportIdToUse,
          metadata: {
            client_information: {
              client_name: clientFullName,
              treatment_plan_date: dateCreatedFormatted,
            },
            report: {
              clinical_assessment: {
                clinical_impressions: formValues.clinicalImpressions,
              },
              treatment_goals: {
                long_term: formValues.longTermGoals,
                short_term: formValues.shortTermGoals,
              },
              planned_interventions: {
                therapeutic_approaches: formValues.therapeuticApproaches,
                session_frequency: formValues.sessionFrequency,
              },
              progress_measurement: {
                how_measured: formValues.progressMeasurement,
              },
              review_updates: {
                review_date: formValues.planReviewDate,
                updates: formValues.updatesRevisions,
              },
            },
            therapist_acknowledgment: {
              therapist_name: therapistName !== "N/A" ? therapistName : "N/A",
              signature: formValues.signature,
              date: moment().toISOString(),
            },
          },
        };

        // Use PUT to update if reportId exists, otherwise POST to create
        const response = reportIdToUse
          ? await api.put("/report-data/treatment-plan-report", payload)
          : await api.post("/report-data/treatment-plan", payload);
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

    handleSubmit(
      () => {
        saveTreatmentPlanReport({});
      },
      () => {
        toast.error("Please fill in all required fields.");
      }
    )();
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
        <ProgressReportModalWrapper>
          <div className="loading-container">
            <Spinner color="#000" width="40px" height="40px" />
            <p className="loading-text">Loading treatment plan data...</p>
          </div>
        </ProgressReportModalWrapper>
      ) : (
        <ProgressReportModalWrapper className={styles.reportModalWrapper}>
          <FormProvider {...methods}>
            {/* Client Information */}
            <div className="client-information">
              <h3 className="client-info-title">CLIENT INFORMATION</h3>
              <div className="client-info-field">
                <strong>Client Name:</strong> {clientName}
              </div>
              <div className="client-info-field">
                <strong>Date Treatment Plan Created:</strong> {dateCreated}
              </div>
            </div>

            <div className={styles.divider}></div>

            {/* Clinical Assessment & Diagnosis */}
            <div className={styles.treatmentPlanSection}>
              <h3 className={styles.sectionHeading}>
                Clinical Assessment & Diagnosis
              </h3>
              <div className={styles.formField}>
                <CustomTextArea
                  label="Clinical impressions / diagnosis (if applicable):"
                  name="clinicalImpressions"
                  control={control}
                  isError={!!errors.clinicalImpressions}
                  disabled={false}
                  placeholder="Enter clinical impressions or diagnosis"
                  rows={4}
                  helperText={undefined}
                />
              </div>
            </div>

            <div className={styles.divider}></div>

            {/* Treatment Goals */}
            <div className={styles.treatmentPlanSection}>
              <h3 className={styles.sectionHeading}>Treatment Goals</h3>
              <div className={styles.formField}>
                <CustomTextArea
                  label="Long-term goals:"
                  name="longTermGoals"
                  control={control}
                  isError={!!errors.longTermGoals}
                  disabled={false}
                  placeholder="Enter long-term goals"
                  rows={4}
                  helperText={undefined}
                />
              </div>
              <div className={styles.formField}>
                <CustomTextArea
                  label="Short-term goals:"
                  name="shortTermGoals"
                  control={control}
                  isError={!!errors.shortTermGoals}
                  disabled={false}
                  placeholder="Enter short-term goals"
                  rows={4}
                  helperText={undefined}
                />
              </div>
            </div>

            <div className={styles.divider}></div>

            {/* Planned Interventions */}
            <div className={styles.treatmentPlanSection}>
              <h3 className={styles.sectionHeading}>Planned Interventions</h3>
              <div className={styles.formField}>
                <CustomTextArea
                  label="Therapeutic approaches (e.g., CBT, DBT, EMDR):"
                  name="therapeuticApproaches"
                  control={control}
                  isError={!!errors.therapeuticApproaches}
                  disabled={false}
                  placeholder="Enter therapeutic approaches"
                  rows={4}
                  helperText={undefined}
                />
              </div>
              <div className={styles.formField}>
                <CustomInputField
                  name="sessionFrequency"
                  label="Session frequency:"
                  type="text"
                  placeholder="Enter session frequency"
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

            {/* Progress Measurement */}
            <div className={styles.treatmentPlanSection}>
              <h3 className={styles.sectionHeading}>Progress Measurement</h3>
              <div className={styles.formField}>
                <CustomTextArea
                  label="How progress will be measured:"
                  name="progressMeasurement"
                  control={control}
                  isError={!!errors.progressMeasurement}
                  disabled={false}
                  placeholder="Enter how progress will be measured"
                  rows={4}
                  helperText={undefined}
                />
              </div>
            </div>

            <div className={styles.divider}></div>

            {/* Review & Updates */}
            <div className={styles.treatmentPlanSection}>
              <h3 className={styles.sectionHeading}>Review & Updates</h3>
              <div className={styles.formField}>
                <CustomInputField
                  name="planReviewDate"
                  label="Plan review date(s):"
                  type="text"
                  placeholder="Enter plan review date(s)"
                  validationRules={{}}
                  icon={undefined}
                  helperText={undefined}
                  handleShowPassword={undefined}
                  value={undefined}
                  prefix={undefined}
                />
              </div>
              <div className={styles.formField}>
                <CustomTextArea
                  label="Updates / revisions:"
                  name="updatesRevisions"
                  control={control}
                  isError={!!errors.updatesRevisions}
                  disabled={false}
                  placeholder="Enter updates or revisions"
                  rows={4}
                  helperText={undefined}
                />
              </div>
            </div>

            <div className={styles.divider}></div>

            {/* Therapist Acknowledgment */}
            <div className="client-information">
              <h3 className="client-info-title">THERAPIST ACKNOWLEDGMENT</h3>
              <div className="client-info-field">
                <strong>Therapist Name:</strong> {therapistName}
              </div>
              <div className={styles.formField} style={{ marginTop: "16px" }}>
                <label>Signature:</label>
                <div className={styles.signatureContainer}>
                  {!signature ? (
                    <>
                      <SignatureCanvas
                        canvasProps={{
                          className: styles.signatureCanvas,
                        }}
                        ref={signaturePadRef}
                        penColor="black"
                      />
                      <div className={styles.signatureActions}>
                        <Button
                          variant="primary"
                          size="small"
                          onClick={() => {
                            if (!signaturePadRef.current?.isEmpty()) {
                              const base64 = signaturePadRef.current
                                .getTrimmedCanvas()
                                .toDataURL("image/png");
                              setValue("signature", base64);
                            } else {
                              toast.error("Please provide a signature.");
                            }
                          }}
                        >
                          Save
                        </Button>
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={() => {
                            signaturePadRef.current?.clear();
                          }}
                        >
                          Clear
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <img
                        src={signature}
                        alt="Therapist Signature"
                        className={styles.signatureImage}
                      />
                      <div className={styles.signatureActions}>
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={() => {
                            setValue("signature", "");
                            signaturePadRef.current?.clear();
                          }}
                        >
                          Clear
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="client-info-field" style={{ marginTop: "16px" }}>
                <strong>Date:</strong> {therapistDate}
              </div>
            </div>

            {/* Validation Checkbox */}
            <ReportValidationCheckbox
              isAccepted={isAccepted}
              onAcceptanceChange={setIsAccepted}
              text="I hereby confirm that I have reviewed and accept the accuracy of all information provided in this treatment plan report. I understand that this report will be submitted as an official record."
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

export default TreatmentPlanReportModal;
