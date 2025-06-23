import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import CustomInputField from "../components/CustomInputField";
import CustomButton from "../components/CustomButton";
import CustomMultiSelect from "../components/CustomMultiSelect";
import { useForm, FormProvider, Controller } from "react-hook-form";
import {
  FormContainer,
  RightPanel,
  Wrapper,
  LeftPanel,
} from "../styles/onboarding";
import { toast } from "react-toastify";
import WeeklyAvailability from "../components/WeeklyAvailability";
import { onBoarding } from "../utils/auth";
import styled from "styled-components";
import { useReferenceContext } from "../context/ReferenceContext";
import MapView from "../components/MapView";
import LicenseFileUpload from "../components/LicenseFileUpload";
import CommonServices from "../services/CommonServices";

const StepIndicator = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 32px;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 2px;
    background: #E0E0E0;
    z-index: 1;
  }

  .step {
    position: relative;
    z-index: 2;
    background: white;
    padding: 0 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;

    .step-number {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      border: 2px solid #E0E0E0;
      background: white;
      color: #666;
      transition: all 0.3s ease;

      &.active {
        border-color: #2196F3;
        color: #2196F3;
      }

      &.completed {
        background: #2196F3;
        border-color: #2196F3;
        color: white;
      }
    }

    .step-label {
      font-size: 14px;
      color: #666;
      font-weight: 500;

      &.active {
        color: #2196F3;
      }
    }
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 32px;
  button {
    min-width: 120px;
  }
`;

const serviceOptions = [
  { value: "individual_therapy", label: "Individual Therapy" },
  { value: "group_therapy", label: "Group Therapy" },
  { value: "couples_counseling", label: "Couples Counseling" },
  { value: "family_therapy", label: "Family Therapy" },
  { value: "teen_counseling", label: "Teen Counseling" },
  { value: "online_therapy", label: "Online Therapy" },
];

const locationOptions = [
  { value: "america", label: "America" },
  { value: "india", label: "India" },
  { value: "africa", label: "Africa" },
  { value: "australia", label: "Australia" },
  { value: "russia", label: "Russia" },
  { value: "china", label: "China" },
];

const specialtiesOptions = [
  { value: "anxiety", label: "Anxiety" },
  { value: "depression", label: "Depression" },
  { value: "trauma", label: "Trauma" },
  { value: "ptsd", label: "PTSD" },
  { value: "relationship_issues", label: "Relationship Issues" },
  { value: "stress_management", label: "Stress Management" },
  { value: "grief_counseling", label: "Grief Counseling" },
];

const modalityOptions = [
  { value: "online", label: "Online" },
  { value: "in_person", label: "In Person" },
  { value: "phone", label: "Phone" },
];

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const raceOptions = [
  { value: "asian", label: "Asian" },
  { value: "black", label: "Black" },
  { value: "hispanic", label: "Hispanic" },
  { value: "white", label: "White" },
  { value: "other", label: "Other" },
];

const SignUp = () => {
  const router = useRouter();
  const [servicesDropdown, setServicesDropdown] = useState([]);
  const methods = useForm({
    mode: "onTouched",
    defaultValues: {
      location: "",
      public_phone: "",
      patients_seen: "",
      profile_notes: "",
      services_offered: "",
      service_modalities: "",
      gender: "",
      race: "",
      license_number: "",
      license_file_url: "",
      availability: {}
    }
  });
  const { pathname } = router;
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [search, setSearch] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(true);
  const totalSteps = 3;

  const validateStep = async (step) => {
    let fieldsToValidate = [];
    
    switch (step) {
      case 1:
        fieldsToValidate = [
          'location',
          'public_phone',
          'patients_seen',
          'profile_notes',
          'services_offered',
          'service_modalities',
          'gender',
          'race'
        ];
        break;
      case 2:
        fieldsToValidate = [
          'license_number',
          'license_file_url'
        ];
        break;
      case 3:
        fieldsToValidate = [
          'availability'
        ];
        break;
      default:
        return false;
    }

    const result = await methods.trigger(fieldsToValidate);
    return result;
  };

  const onSubmit = async (formData) => {
    console.log(formData, "formData");
    setLoading(true);
    try {
      const profileData = {
        user_profile_id: 123,
        license_number: formData?.license_number,
        license_file_url: formData?.license_file_url,
        profile_notes: formData?.profile_notes,
        location: formData?.location?.value,
        services_offered: formData?.services_offered?.map((s) => s.value),
        specialties: formData?.specialties?.map((s) => s.value),
        service_modalities: formData?.service_modalities?.map((s) => s.value),
        patients_seen: parseInt(formData?.patients_seen) || 0,
        gender: formData?.gender?.value,
        race: formData?.race?.value,
        public_phone: formData?.public_phone,
        availability: formData.availability || {}
      };
      await onBoarding(profileData);
      await toast.success("User created", { position: "top-right" });
    } catch (error) {
      console.log(error, "error");
      toast.error(
        error?.message ||
          "Something unexpected happened. Kindly check your connection.",
        { position: "top-right" }
      );
      setLoading(false);
    }
  };

  const nextStep = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const renderStepIndicator = () => (
    <StepIndicator>
      <div className="step">
        <div className={`step-number ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>1</div>
        <div className={`step-label ${currentStep === 1 ? 'active' : ''}`}>Basic Details</div>
      </div>
      <div className="step">
        <div className={`step-number ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>2</div>
        <div className={`step-label ${currentStep === 2 ? 'active' : ''}`}>License Information</div>
      </div>
      <div className="step">
        <div className={`step-number ${currentStep >= 3 ? 'active' : ''}`}>3</div>
        <div className={`step-label ${currentStep === 3 ? 'active' : ''}`}>Availability</div>
      </div>
    </StepIndicator>
  );

  const handleUploadComplete = (fileUrl) => {
    methods.setValue('license_file_url', fileUrl);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <div className="wrapperInputFields">
              <div className="select-field-wrapper">
                <Controller
                  name="location"
                  control={methods.control}
                  rules={{ required: "Location is required" }}
                  render={({ field, fieldState: { error } }) => (
                    <CustomMultiSelect
                      {...field}
                      label='Location'
                      placeholder="Select a location"
                      isMulti={false}
                      options={locationOptions}
                      error={error?.message}
                    />
                  )}
                />
              </div>
            </div>
            <div className="wrapperInputFields">
              <div className="select-field-wrapper">
                <Controller
                  name="public_phone"
                  control={methods.control}
                  rules={{ 
                    required: "Phone number is required",
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: "Please enter a valid 10-digit phone number"
                    }
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <CustomInputField
                      {...field}
                      label="Public Phone Number"
                      required
                      customClass="phone-input"
                      placeholder="Enter your public phone number"
                      error={error?.message}
                    />
                  )}
                />
              </div>
              <div className="select-field-wrapper">
                <Controller
                  name="patients_seen"
                  control={methods.control}
                  rules={{ 
                    required: "Number of patients is required",
                    min: {
                      value: 0,
                      message: "Number of patients cannot be negative"
                    }
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <CustomInputField
                      {...field}
                      label="Number of Patients Seen"
                      type="number"
                      required
                      customClass="patients-input"
                      placeholder="Enter number of patients seen"
                      error={error?.message}
                    />
                  )}
                />
              </div>
            </div>
            <Controller
              name="profile_notes"
              control={methods.control}
              rules={{ required: "Profile notes are required" }}
              render={({ field, fieldState: { error } }) => (
                <CustomInputField
                  {...field}
                  label="Profile Notes"
                  required
                  customClass="notes-input"
                  placeholder="Enter your professional profile notes"
                  error={error?.message}
                />
              )}
            />
            <div className="wrapperInputFields">
              <div className="select-field-wrapper">
                <Controller
                  name="services_offered"
                  control={methods.control}
                  rules={{ required: "Services offered is required" }}
                  render={({ field, fieldState: { error } }) => (
                    <CustomMultiSelect
                      {...field}
                      label='Services Offered*'
                      placeholder="Select services offered"
                      isMulti={false}
                      options={servicesDropdown}
                      error={error?.message}
                    />
                  )}
                />
              </div>
              <div className="select-field-wrapper">
                <Controller
                  name="service_modalities"
                  control={methods.control}
                  rules={{ required: "Service modalities is required" }}
                  render={({ field, fieldState: { error } }) => (
                    <CustomMultiSelect
                      {...field}
                      label='Service Modalities*'
                      placeholder="Select service modalities"
                      isMulti={false}
                      options={modalityOptions}
                      error={error?.message}
                    />
                  )}
                />
              </div>
            </div>
            <div className="wrapperInputFields">
              <div className="select-field-wrapper">
                <Controller
                  name="gender"
                  control={methods.control}
                  rules={{ required: "Gender is required" }}
                  render={({ field, fieldState: { error } }) => (
                    <CustomMultiSelect
                      {...field}
                      label='Gender*'
                      placeholder="Select your gender"
                      isMulti={false}
                      options={genderOptions}
                      error={error?.message}
                    />
                  )}
                />
              </div>
              <div className="select-field-wrapper">
                <Controller
                  name="race"
                  control={methods.control}
                  rules={{ required: "Race/Ethnicity is required" }}
                  render={({ field, fieldState: { error } }) => (
                    <CustomMultiSelect
                      {...field}
                      label='Race/Ethnicity*'
                      placeholder="Select your race/ethnicity"
                      isMulti={false}
                      options={raceOptions}
                      error={error?.message}
                    />
                  )}
                />
              </div>
            </div>
          </>
        );
      case 2:
        return (
          <>
            <div className="wrapperInputFields">
              <div className="select-field-wrapper">
                <Controller
                  name="license_number"
                  control={methods.control}
                  rules={{ required: "License number is required" }}
                  render={({ field, fieldState: { error } }) => (
                    <CustomInputField
                      {...field}
                      label="License Number"
                      required
                      customClass="license-input"
                      placeholder="Enter your license number"
                      error={error?.message}
                    />
                  )}
                />
              </div>
            </div>
            <LicenseFileUpload 
              counselorProfileId={123} // Replace with actual counselor profile ID
              onUploadComplete={handleUploadComplete}
            />
          </>
        );
      case 3:
        return (
          <div className="select-field-wrapper">
            <Controller
              name="availability"
              control={methods.control}
              rules={{ required: "Weekly availability is required" }}
              render={({ field, fieldState: { error } }) => (
                <>
                  <label>Weekly Availability*</label>
                  <WeeklyAvailability control={methods.control} />
                  {error && <span className="error-message">{error.message}</span>}
                </>
              )}
            />
          </div>
        );
      default:
        return null;
    }
  };

  const fetchServicesData = async()=>{
    try {
      const servicesResponse = await CommonServices.getServices();
      if(servicesResponse.status===200){
        setServicesDropdown(servicesResponse?.data?.rec
        ?.filter((service) => service.is_report === 1)
        .map((report) => ({
          value: report.service_id,
          label: report.service_name,
        })));
      }
    } catch (error) {
      console.log('Error fetching all the services', error);
    }
  }

  useEffect(()=>{
fetchServicesData();
  },[])

  return (
    <Wrapper>
      {/* <LeftPanel>
        <div className="company-greetings">
          <img src="/assets/images/Mindbridge_logo_1.svg" alt="company-logo" />
          <div>
            <h1>Welcome to Mind Bridge! 👋</h1>
            <p>
              Your secure intelligent platform for streamlined counseling and
              client management.
            </p>
            <ul>
              <li>
                <b>Effortless Navigation: </b>Access client-sessions, treatment
                tools and actionable insights with minimal clicks.
              </li>
              <li>
                <b>Crisis Response: </b>A <b>one-click</b> link to &ldquo;
                <b>Responding to a Suicidal Client</b>
                &rdquo; is available on all main screens for immediate guidance.
              </li>
              <li>
                <b>Data-Driven Decisions: </b>Track client progress, automate
                SMART goal templates, and generate visual insights.
              </li>
              <li>
                <b>Seamless Session Management: </b>Schedule, monitor, and
                adjust treatment plans efficiently.
              </li>
            </ul>
            <p>Login now and bridge the gap between care and innovation</p>
          </div>
        </div>
        <span>© 2024 MindBridge. All rights reserved.</span>
      </LeftPanel> */}
      <RightPanel>
        <FormContainer>
          <h2>On Boarding</h2>
          {renderStepIndicator()}
          <FormProvider {...methods}>
            <form>
              {renderStepContent()}
              <ButtonContainer>
                {currentStep > 1 && (
                  <CustomButton
                    title="Previous"
                    type="button"
                    onClick={prevStep}
                    className="secondary-button"
                  />
                )}
                {currentStep < totalSteps ? (
                  <CustomButton
                    title="Next"
                    type="button"
                    onClick={nextStep}
                    customClass="primary-button"
                    onboardingStep={true}
                  />
                ) : (
                  <CustomButton
                    title="Submit"
                    type="button"
                    onClick={methods.handleSubmit(onSubmit)}
                    className="primary-button"
                    disabled={loading}
                  />
                )}
              </ButtonContainer>
            </form>
          </FormProvider>
        </FormContainer>
      </RightPanel>
    </Wrapper>
  );
};

export default SignUp;
