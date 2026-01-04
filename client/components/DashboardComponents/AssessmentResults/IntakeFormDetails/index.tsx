import React, { useState } from "react";
import moment from "moment";
import CustomButton from "../../../CustomButton";
import CreateSessionLayout from "../../../FormLayouts/CreateSessionLayout/CreateSessionLayout";
import CreateClientForm from "../../../Forms/CreateClientForm";
import { parsePhoneNumber } from "react-phone-number-input";
import {
  IntakeFormContainer,
  IntakeFormTitle,
  SectionContainer,
  SectionHeading,
  GridContainer,
  FieldContainer,
  FieldLabel,
  FieldValue,
  TextAreaContainer,
  SymptomsContainer,
  SymptomTag,
  EmptyState,
  SignatureContainer,
  SignatureImage,
  LoadingContainer,
  ErrorContainer,
  ButtonContainer,
} from "./style";

interface IntakeFormDetailsProps {
  intakeFormData: any;
  loading: boolean;
}

const IntakeFormDetails: React.FC<IntakeFormDetailsProps> = ({
  intakeFormData,
  loading,
}) => {
  const [showCreateClientModal, setShowCreateClientModal] = useState(false);
  const [clientFormData, setClientFormData] = useState<any>(null);
  if (loading) {
    return <LoadingContainer>Loading...</LoadingContainer>;
  }

  if (!intakeFormData) {
    return <ErrorContainer>No intake form data available</ErrorContainer>;
  }

  const formatDate = (date: string | Date | null) => {
    if (!date) return "N/A";
    return moment(date).format("MM/DD/YYYY");
  };

  const formatDuration = (duration: string | null) => {
    if (!duration) return "N/A";
    const mapping: { [key: string]: string } = {
      less_than_1_month: "Less than 1 month",
      one_to_six_months: "1–6 months",
      six_to_twelve_months: "6–12 months",
      over_1_year: "Over 1 year",
    };
    return mapping[duration] || duration;
  };

  const formatUsingInsurance = (value: string | null) => {
    if (!value) return "N/A";
    return value === "yes" ? "Yes" : value === "no" ? "No" : value;
  };

  const formatSelfHarm = (value: string | null) => {
    if (!value) return "N/A";
    const mapping: { [key: string]: string } = {
      no: "No",
      past: "Past",
      current: "Current",
    };
    return mapping[value] || value;
  };

  const formatHarmingOthers = (value: string | null) => {
    if (!value) return "N/A";
    return value === "yes" ? "Yes" : value === "no" ? "No" : value;
  };

  const symptoms = intakeFormData.current_symptoms;
  const symptomsList = Array.isArray(symptoms) ? symptoms : [];

  const handleCreateClient = () => {
    // Parse full name into first and last name
    const nameParts = intakeFormData.full_name?.trim().split(" ") || [];
    const user_first_name = nameParts[0] || "";
    const user_last_name = nameParts.slice(1).join(" ") || "";

    // Parse phone number to extract country code and phone number
    let country_code = "+1"; // Default to US
    let user_phone_nbr = "";

    if (intakeFormData.phone) {
      try {
        const phoneNumber = parsePhoneNumber(intakeFormData.phone);
        if (phoneNumber) {
          country_code = `+${phoneNumber.countryCallingCode}`;
          user_phone_nbr = phoneNumber.nationalNumber;
        } else {
          // If parsing fails, use the phone as-is
          user_phone_nbr = intakeFormData.phone.replace(/\D/g, "");
        }
      } catch (error) {
        // If parsing fails, try to extract digits
        const digits = intakeFormData.phone.replace(/\D/g, "");
        user_phone_nbr = digits;
      }
    }

    // Map intake form data to CreateClientForm format
    const mappedData = {
      user_first_name,
      user_last_name,
      email: intakeFormData.email || "",
      user_phone_nbr: user_phone_nbr || intakeFormData.phone || "",
      country_code,
      role_id: 1, // Default to client role
      // Additional fields can be mapped if needed
    };

    console.log("IntakeFormDetails - intakeFormData.id:", intakeFormData?.id);
    setClientFormData(mappedData);
    setShowCreateClientModal(true);
  };

  return (
    <>
      <IntakeFormContainer>
        <IntakeFormTitle>Intake Form Details</IntakeFormTitle>

        {/* Basic Information */}
        <SectionContainer>
          <SectionHeading>Basic Information</SectionHeading>
          <GridContainer>
            <FieldContainer>
              <FieldLabel>Full Name:</FieldLabel>
              <FieldValue>{intakeFormData.full_name || "N/A"}</FieldValue>
            </FieldContainer>
            <FieldContainer>
              <FieldLabel>Email:</FieldLabel>
              <FieldValue>{intakeFormData.email || "N/A"}</FieldValue>
            </FieldContainer>
            <FieldContainer>
              <FieldLabel>Phone:</FieldLabel>
              <FieldValue>{intakeFormData.phone || "N/A"}</FieldValue>
            </FieldContainer>
          </GridContainer>
        </SectionContainer>

        {/* Emergency Contact */}
        <SectionContainer>
          <SectionHeading>Emergency Contact</SectionHeading>
          <GridContainer>
            <FieldContainer>
              <FieldLabel>Name:</FieldLabel>
              <FieldValue>
                {intakeFormData.emergency_contact_name || "N/A"}
              </FieldValue>
            </FieldContainer>
            <FieldContainer>
              <FieldLabel>Relationship:</FieldLabel>
              <FieldValue>
                {intakeFormData.emergency_contact_relationship || "N/A"}
              </FieldValue>
            </FieldContainer>
            <FieldContainer>
              <FieldLabel>Phone:</FieldLabel>
              <FieldValue>
                {intakeFormData.emergency_contact_phone || "N/A"}
              </FieldValue>
            </FieldContainer>
          </GridContainer>
        </SectionContainer>

        {/* Insurance Coverage */}
        <SectionContainer>
          <SectionHeading>Insurance Coverage</SectionHeading>
          <GridContainer>
            <FieldContainer>
              <FieldLabel>Using Insurance:</FieldLabel>
              <FieldValue>
                {formatUsingInsurance(intakeFormData.using_insurance)}
              </FieldValue>
            </FieldContainer>
            {intakeFormData.using_insurance === "yes" && (
              <>
                <FieldContainer>
                  <FieldLabel>Insurance Provider:</FieldLabel>
                  <FieldValue>
                    {intakeFormData.insurance_provider || "N/A"}
                  </FieldValue>
                </FieldContainer>
                <FieldContainer>
                  <FieldLabel>Policyholder Name:</FieldLabel>
                  <FieldValue>
                    {intakeFormData.policyholder_name || "N/A"}
                  </FieldValue>
                </FieldContainer>
                <FieldContainer>
                  <FieldLabel>Policyholder Date of Birth:</FieldLabel>
                  <FieldValue>
                    {formatDate(intakeFormData.policyholder_date_of_birth)}
                  </FieldValue>
                </FieldContainer>
                <FieldContainer>
                  <FieldLabel>Member ID:</FieldLabel>
                  <FieldValue>{intakeFormData.member_id || "N/A"}</FieldValue>
                </FieldContainer>
                <FieldContainer>
                  <FieldLabel>Group Number:</FieldLabel>
                  <FieldValue>
                    {intakeFormData.group_number || "N/A"}
                  </FieldValue>
                </FieldContainer>
              </>
            )}
          </GridContainer>
        </SectionContainer>

        {/* Reason for Seeking Therapy */}
        <SectionContainer>
          <SectionHeading>Reason for Seeking Therapy</SectionHeading>
          <FieldContainer style={{ marginBottom: "15px" }}>
            <FieldLabel>What brings you to therapy?</FieldLabel>
            <TextAreaContainer>
              {intakeFormData.reason_for_therapy || "N/A"}
            </TextAreaContainer>
          </FieldContainer>
          <FieldContainer>
            <FieldLabel>How long has this been a concern?</FieldLabel>
            <FieldValue>
              {formatDuration(intakeFormData.concern_duration)}
            </FieldValue>
          </FieldContainer>
        </SectionContainer>

        {/* Current Symptoms */}
        <SectionContainer>
          <SectionHeading>Current Symptoms</SectionHeading>
          {symptomsList.length > 0 ? (
            <SymptomsContainer>
              {symptomsList.map((symptom: string, index: number) => (
                <SymptomTag key={index}>{symptom}</SymptomTag>
              ))}
            </SymptomsContainer>
          ) : (
            <EmptyState>No symptoms listed</EmptyState>
          )}
        </SectionContainer>

        {/* Safety Check */}
        <SectionContainer>
          <SectionHeading>Safety Check</SectionHeading>
          <GridContainer>
            <FieldContainer>
              <FieldLabel>Thoughts of self-harm:</FieldLabel>
              <FieldValue>
                {formatSelfHarm(intakeFormData.self_harm_thoughts)}
              </FieldValue>
            </FieldContainer>
            <FieldContainer>
              <FieldLabel>Thoughts of harming others:</FieldLabel>
              <FieldValue>
                {formatHarmingOthers(intakeFormData.harming_others_thoughts)}
              </FieldValue>
            </FieldContainer>
          </GridContainer>
        </SectionContainer>

        {/* Goals for Therapy */}
        <SectionContainer>
          <SectionHeading>Goals for Therapy</SectionHeading>
          <TextAreaContainer>
            {intakeFormData.therapy_goals || "N/A"}
          </TextAreaContainer>
        </SectionContainer>

        {/* Consent */}
        <SectionContainer>
          <SectionHeading>Consent</SectionHeading>
          <GridContainer>
            <FieldContainer>
              <FieldLabel>Client Name:</FieldLabel>
              <FieldValue>{intakeFormData.client_name || "N/A"}</FieldValue>
            </FieldContainer>
            <FieldContainer>
              <FieldLabel>Consent Date:</FieldLabel>
              <FieldValue>{formatDate(intakeFormData.consent_date)}</FieldValue>
            </FieldContainer>
            {intakeFormData.signature && (
              <SignatureContainer>
                <FieldLabel>Signature:</FieldLabel>
                <SignatureImage
                  src={intakeFormData.signature}
                  alt="Signature"
                />
              </SignatureContainer>
            )}
          </GridContainer>
        </SectionContainer>

        {/* Create Client Button */}
        <ButtonContainer>
          <CustomButton
            title="Create Client"
            onClick={handleCreateClient}
            customClass="blue"
            icon={null}
          />
        </ButtonContainer>
      </IntakeFormContainer>

      {/* Create Client Form Modal - Rendered outside container to avoid layout issues */}
      <CreateSessionLayout
        isOpen={showCreateClientModal}
        setIsOpen={setShowCreateClientModal}
        initialData={null}
        setConfirmationModal={() => {}}
      >
        <CreateClientForm
          isOpen={showCreateClientModal}
          setIsOpen={setShowCreateClientModal}
          initialData={clientFormData}
          setInitialData={setClientFormData}
          setTableData={() => {}}
          fetchClients={() => {}}
          intakeId={intakeFormData?.id}
        />
      </CreateSessionLayout>
    </>
  );
};

export default IntakeFormDetails;
