import React, { useState, useEffect } from "react";
import {
  useForm,
  Controller,
  FormProvider,
  UseFormReturn,
} from "react-hook-form";
import {
  IntakeFormContainer,
  LoadingContainer,
  OtherSymptomInput,
  ReadOnlyInput,
} from "./style";
import CustomButton from "../../../CustomButton";
import { toast } from "react-toastify";
import { useMutationData } from "../../../../utils/hooks/useMutationData";
import { useRouter } from "next/router";
import CommonServices from "../../../../services/CommonServices";
import CustomInputField from "../../../CustomInputField";
import CustomTextArea from "../../../CustomTextArea";
import FormHeader from "../../../FormsHeader";
import { api } from "../../../../utils/auth";
import { useQueryData } from "../../../../utils/hooks/useQueryData";
import { QUERY_KEYS } from "../../../../utils/constants";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import SignatureField from "../../../SignatureCanvas";
import CustomDatePicker from "../../../DatePicker";
import moment from "moment";
import FormSubmission from "../../../../pages/patient-forms/form-submission";
import { AppointmentData, IntakeFormData, IntakeFormPayload } from "./types";

const IntakeForm: React.FC = () => {
  const router = useRouter();
  const { appointment_id } = router.isReady ? router.query : {};

  const methods: UseFormReturn<IntakeFormData> = useForm<IntakeFormData>({
    defaultValues: {
      full_name: "",
      phone: "",
      email: "",
      emergency_contact_name: "",
      emergency_contact_relationship: "",
      emergency_contact_phone: "",
      using_insurance: "",
      insurance_provider: "",
      policyholder_name: "",
      policyholder_date_of_birth: null,
      member_id: "",
      group_number: "",
      reason_for_therapy: "",
      duration: "",
      symptoms: {
        anxiety: false,
        depression: false,
        stress: false,
        sleep_issues: false,
        mood_changes: false,
        relationship_issues: false,
        other: false,
      },
      other_symptom: "",
      thoughts_self_harm: "",
      thoughts_harm_others: "",
      therapy_goals: "",
      consent: false,
      signature: null,
    },
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
    reset,
  } = methods;

  const fullName = watch("full_name");
  const usingInsurance = watch("using_insurance");

  const [hasAppointmentData, setHasAppointmentData] = useState<boolean>(false);
  const otherSymptomChecked = watch("symptoms.other");

  // Mutation for submitting intake form
  const { mutate: submitIntakeForm, isPending: loading } = useMutationData(
    ["submitIntakeForm"],
    async (payload: IntakeFormPayload) => {
      return await api.post("/intake-form/submit", payload);
    },
    undefined,
    () => {
      router.push("/patient-forms/form-submission");
    }
  );

  // Fetch appointment details using useQueryData
  const { data: appointmentData, isPending: isLoadingAppointment } =
    useQueryData(
      QUERY_KEYS.APPOINTMENT_BY_ID(appointment_id as string),
      async () => {
        const response = await CommonServices.getAppointmentById(
          appointment_id as string
        );
        if (response.status === 200 && response.data?.rec) {
          return response.data.rec as AppointmentData;
        }
        return null;
      },
      router.isReady && !!appointment_id
    ) as { data: AppointmentData | null; isPending: boolean };

  // Check if form is already submitted
  const appointment = appointmentData as AppointmentData | null;
  const isFormSubmitted =
    appointment?.intake_form_submitted === true ||
    appointment?.intake_form_submitted === 1;

  // Format phone number for PhoneInput component
  const formatPhoneForInput = (
    countryCode: string | null,
    phoneNumber: string | null
  ): string => {
    if (!phoneNumber) return "";

    const digitsOnly = `${phoneNumber}`.replace(/\D/g, "");
    if (!digitsOnly) return "";

    if (countryCode && countryCode.startsWith("+")) {
      return `${countryCode}${digitsOnly}`;
    }

    if (countryCode) {
      const sanitizedCode = countryCode.replace(/[^\d]/g, "");
      if (sanitizedCode) {
        return `+${sanitizedCode}${digitsOnly}`;
      }
    }

    return `+1${digitsOnly}`;
  };

  // Populate form fields when appointment data is loaded
  useEffect(() => {
    if (appointment) {
      setHasAppointmentData(true);
      const phoneValue = formatPhoneForInput(
        appointment.country_code,
        appointment.contact_number
      );

      reset({
        full_name: appointment.customer_name || "",
        phone: phoneValue,
        email: appointment.customer_email || "",
        emergency_contact_name: "",
        emergency_contact_relationship: "",
        emergency_contact_phone: "",
        using_insurance: "",
        insurance_provider: "",
        policyholder_name: "",
        policyholder_date_of_birth: null,
        member_id: "",
        group_number: "",
        reason_for_therapy: "",
        duration: "",
        symptoms: {
          anxiety: false,
          depression: false,
          stress: false,
          sleep_issues: false,
          mood_changes: false,
          relationship_issues: false,
          other: false,
        },
        other_symptom: "",
        thoughts_self_harm: "",
        thoughts_harm_others: "",
        therapy_goals: "",
        consent: false,
        signature: null,
      });
    }
  }, [appointment, reset]);

  const onSubmit = (data: IntakeFormData): void => {
    const {
      counselor_id,
      appointment_id: appointmentId,
      intake_form_id,
    } = router.query;

    if (!counselor_id || !appointmentId || !intake_form_id) {
      toast.error("Required parameters are missing from the route.");
      return;
    }

    // Prepare symptoms array
    const symptomsList: string[] = [];
    if (data.symptoms.anxiety) symptomsList.push("Anxiety");
    if (data.symptoms.depression) symptomsList.push("Depression");
    if (data.symptoms.stress) symptomsList.push("Stress");
    if (data.symptoms.sleep_issues) symptomsList.push("Sleep issues");
    if (data.symptoms.mood_changes) symptomsList.push("Mood changes");
    if (data.symptoms.relationship_issues)
      symptomsList.push("Relationship issues");
    if (data.symptoms.other && data.other_symptom) {
      symptomsList.push(`Other: ${data.other_symptom}`);
    }

    const payload: IntakeFormPayload = {
      counselor_id: parseInt(counselor_id as string),
      appointment_id: parseInt(appointmentId as string),
      intake_form_id: parseInt(intake_form_id as string),
      full_name: data.full_name,
      phone: data.phone,
      email: data.email,
      emergency_contact_name: data.emergency_contact_name,
      emergency_contact_relationship: data.emergency_contact_relationship,
      emergency_contact_phone: data.emergency_contact_phone,
      using_insurance: data.using_insurance,
      insurance_provider: data.insurance_provider,
      policyholder_name: data.policyholder_name,
      policyholder_date_of_birth: data.policyholder_date_of_birth
        ? moment(data.policyholder_date_of_birth).format("YYYY-MM-DD")
        : null,
      member_id: data.member_id,
      group_number: data.group_number,
      reason_for_therapy: data.reason_for_therapy,
      duration: data.duration,
      symptoms: symptomsList,
      thoughts_self_harm: data.thoughts_self_harm,
      thoughts_harm_others: data.thoughts_harm_others,
      therapy_goals: data.therapy_goals,
      consent: data.consent,
      signature: data.signature,
    };

    // Submit intake form using mutation
    submitIntakeForm(payload);
  };

  // Show loading state
  if (isLoadingAppointment) {
    return (
      <IntakeFormContainer>
        <FormHeader
          tittle="CLIENT INTAKE FORM (SHORT VERSION)"
          description=""
        />
        <LoadingContainer>
          <p>Loading appointment details...</p>
        </LoadingContainer>
      </IntakeFormContainer>
    );
  }

  // Show form submission message if already submitted
  if (isFormSubmitted) {
    return <FormSubmission alreadySubmitted />;
  }

  return (
    <FormProvider {...methods}>
      <IntakeFormContainer>
        <FormHeader
          tittle="CLIENT INTAKE FORM (SHORT VERSION)"
          description=""
        />
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-row">
              <CustomInputField
                name="full_name"
                label="Full Name:"
                placeholder="Enter full name"
                required
                disabled={hasAppointmentData}
                customClass={hasAppointmentData ? "read-only-field" : ""}
                icon={undefined}
                helperText={undefined}
                handleShowPassword={() => {}}
                value={undefined}
                prefix={undefined}
              />
              {hasAppointmentData && (
                <span className="read-only-indicator">
                  (Pre-filled from appointment)
                </span>
              )}
            </div>
            <div className="form-row">
              <label>Phone:</label>
              <div className="phone-input-wrapper">
                <Controller
                  name="phone"
                  control={control}
                  rules={{ required: "Phone number is required" }}
                  render={({ field, fieldState }) => (
                    <>
                      <PhoneInput
                        international
                        defaultCountry="US"
                        value={field.value || ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        disabled={
                          hasAppointmentData && !!appointment?.contact_number
                        }
                        className={
                          hasAppointmentData && appointment?.contact_number
                            ? "read-only-phone"
                            : fieldState.error
                            ? "phone-input-error"
                            : ""
                        }
                        inputProps={{
                          name: "phone",
                          required: true,
                        }}
                      />
                      {fieldState.error && (
                        <span className="error-message">
                          {fieldState.error.message}
                        </span>
                      )}
                      {hasAppointmentData && appointment?.contact_number && (
                        <span className="read-only-indicator">
                          (Pre-filled from appointment)
                        </span>
                      )}
                    </>
                  )}
                />
              </div>
            </div>
            <div className="form-row">
              <CustomInputField
                name="email"
                label="Email:"
                type="email"
                placeholder="Enter email address"
                required
                disabled={hasAppointmentData}
                customClass={hasAppointmentData ? "read-only-field" : ""}
                icon={undefined}
                helperText={undefined}
                handleShowPassword={() => {}}
                value={undefined}
                prefix={undefined}
              />
              {hasAppointmentData && (
                <span className="read-only-indicator">
                  (Pre-filled from appointment)
                </span>
              )}
            </div>
          </div>

          <div className="form-section">
            <h3>Emergency Contact</h3>
            <div className="form-row">
              <CustomInputField
                name="emergency_contact_name"
                label="Name:"
                placeholder="Enter name"
                icon={undefined}
                helperText={undefined}
                handleShowPassword={() => {}}
                value={undefined}
                prefix={undefined}
              />
            </div>
            <div className="form-row">
              <CustomInputField
                name="emergency_contact_relationship"
                label="Relationship:"
                placeholder="Enter relationship"
                icon={undefined}
                helperText={undefined}
                handleShowPassword={() => {}}
                value={undefined}
                prefix={undefined}
              />
            </div>
            <div className="form-row">
              <label>Phone:</label>
              <div className="phone-input-wrapper">
                <Controller
                  name="emergency_contact_phone"
                  control={control}
                  render={({ field, fieldState }) => (
                    <>
                      <PhoneInput
                        international
                        defaultCountry="US"
                        value={field.value || ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        className={fieldState.error ? "phone-input-error" : ""}
                        inputProps={{
                          name: "emergency_contact_phone",
                        }}
                      />
                      {fieldState.error && (
                        <span className="error-message">
                          {fieldState.error.message}
                        </span>
                      )}
                    </>
                  )}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Insurance Coverage</h3>
            <div className="form-row">
              <label>Will you be using insurance?</label>
              <div className="checkbox-group">
                <Controller
                  name="using_insurance"
                  control={control}
                  render={({ field }) => (
                    <>
                      <label className="checkbox-label">
                        <input type="radio" {...field} value="yes" />
                        Yes
                      </label>
                      <label className="checkbox-label">
                        <input type="radio" {...field} value="no" />
                        No
                      </label>
                    </>
                  )}
                />
              </div>
            </div>
            {usingInsurance === "yes" && (
              <>
                <div className="form-row">
                  <CustomInputField
                    name="insurance_provider"
                    label="Insurance Provider:"
                    placeholder="Enter insurance provider"
                    icon={undefined}
                    helperText={undefined}
                    handleShowPassword={() => {}}
                    value={undefined}
                    prefix={undefined}
                  />
                </div>
                <div className="form-row">
                  <CustomInputField
                    name="policyholder_name"
                    label="Policyholder Name:"
                    placeholder="Enter policyholder name"
                    icon={undefined}
                    helperText={undefined}
                    handleShowPassword={() => {}}
                    value={undefined}
                    prefix={undefined}
                  />
                </div>
                <div className="form-row">
                  <label>Policyholder Date of Birth:</label>
                  <Controller
                    name="policyholder_date_of_birth"
                    control={control}
                    render={({ field }) => (
                      <CustomDatePicker
                        selected={field.value ? new Date(field.value) : null}
                        onChange={(date: Date | null) => field.onChange(date)}
                        dateFormat="MM/dd/yyyy"
                        placeholderText="MM/DD/YYYY"
                        maxDate={new Date()}
                        showYearDropdown
                        showMonthDropdown
                        dropdownMode="select"
                        className=""
                      />
                    )}
                  />
                </div>
                <div className="form-row">
                  <CustomInputField
                    name="member_id"
                    label="Member ID:"
                    placeholder="Enter member ID"
                    icon={undefined}
                    helperText={undefined}
                    handleShowPassword={() => {}}
                    value={undefined}
                    prefix={undefined}
                  />
                </div>
                <div className="form-row">
                  <CustomInputField
                    name="group_number"
                    label="Group Number (if applicable):"
                    placeholder="Enter group number"
                    validationRules={{ required: false }}
                    icon={undefined}
                    helperText={undefined}
                    handleShowPassword={() => {}}
                    value={undefined}
                    prefix={undefined}
                  />
                </div>
              </>
            )}
          </div>

          <div className="form-section">
            <h3>Reason for Seeking Therapy</h3>
            <div className="form-row">
              <label>What brings you to therapy?</label>
              <CustomTextArea
                name="reason_for_therapy"
                label=""
                placeholder="Describe the reason for seeking therapy"
                rows={4}
                control={control}
                isError={false}
                disabled={false}
              />
            </div>
            <div className="form-row">
              <label>How long has this been a concern?</label>
              <div className="checkbox-group">
                <Controller
                  name="duration"
                  control={control}
                  rules={{ required: "Please select duration" }}
                  render={({ field }) => (
                    <>
                      <label className="checkbox-label">
                        <input
                          type="radio"
                          {...field}
                          value="less_than_1_month"
                        />
                        Less than 1 month
                      </label>
                      <label className="checkbox-label">
                        <input type="radio" {...field} value="1_6_months" />
                        1–6 months
                      </label>
                      <label className="checkbox-label">
                        <input type="radio" {...field} value="6_12_months" />
                        6–12 months
                      </label>
                      <label className="checkbox-label">
                        <input type="radio" {...field} value="over_1_year" />
                        Over 1 year
                      </label>
                    </>
                  )}
                />
              </div>
              {errors.duration && (
                <span className="error-message">{errors.duration.message}</span>
              )}
            </div>
          </div>

          <div className="form-section">
            <h3>Current Symptoms</h3>
            <div className="checkbox-group">
              <Controller
                name="symptoms.anxiety"
                control={control}
                render={({ field }) => (
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      {...field}
                      checked={field.value}
                      value=""
                    />
                    Anxiety
                  </label>
                )}
              />
              <Controller
                name="symptoms.depression"
                control={control}
                render={({ field }) => (
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      {...field}
                      checked={field.value}
                      value=""
                    />
                    Depression
                  </label>
                )}
              />
              <Controller
                name="symptoms.stress"
                control={control}
                render={({ field }) => (
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      {...field}
                      checked={field.value}
                      value=""
                    />
                    Stress
                  </label>
                )}
              />
              <Controller
                name="symptoms.sleep_issues"
                control={control}
                render={({ field }) => (
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      {...field}
                      checked={field.value}
                      value=""
                    />
                    Sleep issues
                  </label>
                )}
              />
              <Controller
                name="symptoms.mood_changes"
                control={control}
                render={({ field }) => (
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      {...field}
                      checked={field.value}
                      value=""
                    />
                    Mood changes
                  </label>
                )}
              />
              <Controller
                name="symptoms.relationship_issues"
                control={control}
                render={({ field }) => (
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      {...field}
                      checked={field.value}
                      value=""
                    />
                    Relationship issues
                  </label>
                )}
              />
              <Controller
                name="symptoms.other"
                control={control}
                render={({ field }) => (
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      {...field}
                      checked={field.value}
                      value=""
                    />
                    Other:
                  </label>
                )}
              />
              {otherSymptomChecked && (
                <OtherSymptomInput>
                  <CustomInputField
                    name="other_symptom"
                    label=""
                    placeholder="Specify other symptom"
                    icon={undefined}
                    helperText={undefined}
                    handleShowPassword={() => {}}
                    value={undefined}
                    prefix={undefined}
                  />
                </OtherSymptomInput>
              )}
            </div>
          </div>

          <div className="form-section">
            <h3>Safety Check</h3>
            <div className="form-row">
              <label>Thoughts of self-harm?</label>
              <div className="checkbox-group">
                <Controller
                  name="thoughts_self_harm"
                  control={control}
                  rules={{ required: "Please select an option" }}
                  render={({ field }) => (
                    <>
                      <label className="checkbox-label">
                        <input type="radio" {...field} value="no" />
                        No
                      </label>
                      <label className="checkbox-label">
                        <input type="radio" {...field} value="past" />
                        Past
                      </label>
                      <label className="checkbox-label">
                        <input type="radio" {...field} value="current" />
                        Current
                      </label>
                    </>
                  )}
                />
              </div>
              {errors.thoughts_self_harm && (
                <span className="error-message">
                  {errors.thoughts_self_harm.message}
                </span>
              )}
            </div>
            <div className="form-row">
              <label>Thoughts of harming others?</label>
              <div className="checkbox-group">
                <Controller
                  name="thoughts_harm_others"
                  control={control}
                  rules={{ required: "Please select an option" }}
                  render={({ field }) => (
                    <>
                      <label className="checkbox-label">
                        <input type="radio" {...field} value="no" />
                        No
                      </label>
                      <label className="checkbox-label">
                        <input type="radio" {...field} value="yes" />
                        Yes
                      </label>
                    </>
                  )}
                />
              </div>
              {errors.thoughts_harm_others && (
                <span className="error-message">
                  {errors.thoughts_harm_others.message}
                </span>
              )}
            </div>
          </div>

          <div className="form-section">
            <h3>Goals for Therapy</h3>
            <div className="form-row">
              <CustomTextArea
                name="therapy_goals"
                label=""
                placeholder="Enter your goals for therapy"
                rows={4}
                control={control}
                isError={false}
                disabled={false}
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Consent</h3>
            <div className="consent-container">
              <p>
                I understand confidentiality, billing responsibilities, and
                consent to therapy services.
              </p>
              <div className="form-row">
                <label>Client Name:</label>
                <ReadOnlyInput
                  type="text"
                  value={fullName || ""}
                  disabled
                  className="read-only-field"
                />
                <span className="read-only-indicator">(Auto-fill)</span>
              </div>
              <div className="form-row">
                <label>Signature:</label>
                <SignatureField
                  name="signature"
                  label=""
                  control={control}
                  errors={errors}
                  initialData={null}
                />
                <span className="read-only-indicator">(add Signature Pad)</span>
              </div>
              <div className="form-row">
                <label>Date:</label>
                <ReadOnlyInput
                  type="text"
                  value={moment().format("MM/DD/YYYY")}
                  disabled
                  className="read-only-field"
                />
                <span className="read-only-indicator">(Auto-fill)</span>
              </div>
              <Controller
                name="consent"
                control={control}
                rules={{
                  required:
                    "You must provide consent to begin therapy services",
                }}
                render={({ field }) => (
                  <label className="consent-checkbox-label">
                    <input
                      type="checkbox"
                      {...field}
                      checked={field.value}
                      value=""
                      className="consent-checkbox"
                    />
                    I understand confidentiality, billing responsibilities, and
                    consent to therapy services.
                  </label>
                )}
              />
              {errors.consent && (
                <span className="error-message">{errors.consent.message}</span>
              )}
            </div>
          </div>

          <div className="form-actions">
            <CustomButton
              type="submit"
              title={loading ? "Submitting..." : "Submit Intake Form"}
              customClass="primary"
              disabled={loading}
              onClick={() => {}}
              icon={null}
            />
          </div>
        </form>
      </IntakeFormContainer>
    </FormProvider>
  );
};

export default IntakeForm;
