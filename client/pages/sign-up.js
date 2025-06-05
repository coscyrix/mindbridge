import React, { useState } from "react";
import { useRouter } from "next/router";
import CustomInputField from "../components/CustomInputField";
import CustomButton from "../components/CustomButton";
import CustomMultiSelect from "../components/CustomMultiSelect";
import { useForm, FormProvider } from "react-hook-form";
import {
  FormContainer,
  RightPanel,
  Wrapper,
  LeftPanel,
} from "../styles/onboarding";
import { toast } from "react-toastify";
import WeeklyAvailability from "../components/WeeklyAvailability";
import { onBoarding } from "../utils/auth";

const serviceOptions = [
  { value: "individual_therapy", label: "Individual Therapy" },
  { value: "group_therapy", label: "Group Therapy" },
  { value: "couples_counseling", label: "Couples Counseling" },
  { value: "family_therapy", label: "Family Therapy" },
  { value: "teen_counseling", label: "Teen Counseling" },
  { value: "online_therapy", label: "Online Therapy" },
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
  const methods = useForm();
  const { pathname } = router;
  const isSignUp = pathname === "/sign-up";
  const [loading, setLoading] = useState(false);

  const onSubmit = async (formData) => {
    console.log(formData, "formData");
    setLoading(true);
    try {
      const profileData = {
        user_profile_id: 123,
        license_number: formData?.license_number,
        license_file_url: formData?.license_file_url,
        profile_notes: formData?.profile_notes,
        location: formData?.location,
        services_offered: formData?.services_offered?.map((s) => s.value),
        specialties: formData?.specialties?.map((s) => s.value),
        service_modalities: formData?.service_modalities?.map((s) => s.value),
        patients_seen: parseInt(formData?.patients_seen) || 0,
        gender: formData?.gender?.value,
        race: formData?.race?.value,
        public_phone: formData?.public_phone,
        // availability: Object?.keys(formData.availability || {})?.reduce(
        //   (acc, day) => {
        //     acc[day] =
        //       formData?.availability[day]?.map((time) => time.value) || [];
        //     return acc;
        //   },
        //   {}
        // ),
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

  return (
    <Wrapper>
      <LeftPanel>
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
      </LeftPanel>
      <RightPanel>
        <FormContainer>
          <h2>On Boarding</h2>
          <FormProvider {...methods}>
            <form>
              <div className="wrapperInputFields">
                <div className="select-field-wrapper">
                  <CustomInputField
                    name="user_profile_id"
                    label="Profile ID"
                    required
                    placeholder="Profile ID"
                  />
                </div>
                <div className="select-field-wrapper">
                  <CustomInputField
                    name="location"
                    label="Location"
                    required
                    customClass="location-input"
                    placeholder="Enter your location"
                  />
                </div>
              </div>
              <div className="wrapperInputFields">
                <div className="select-field-wrapper">
                  <CustomInputField
                    name="public_phone"
                    label="Public Phone Number"
                    required
                    customClass="phone-input"
                    placeholder="Enter your public phone number"
                  />
                </div>
                <div className="select-field-wrapper">
                  <CustomInputField
                    name="patients_seen"
                    label="Number of Patients Seen"
                    type="number"
                    required
                    customClass="patients-input"
                    placeholder="Enter number of patients seen"
                  />
                </div>
              </div>
              <div className="wrapperInputFields">
                <div className="select-field-wrapper">
                  <CustomInputField
                    name="license_number"
                    label="License Number"
                    required
                    customClass="license-input"
                    placeholder="Enter your license number"
                  />
                </div>
                <div className="select-field-wrapper">
                  <CustomInputField
                    name="license_file_url"
                    label="License File URL"
                    required
                    customClass="license-url-input"
                    placeholder="Enter your license file URL"
                  />
                </div>
              </div>

              <CustomInputField
                name="profile_notes"
                label="Profile Notes"
                required
                customClass="notes-input"
                placeholder="Enter your professional profile notes"
              />
              <div className="wrapperInputFields">
                <div className="select-field-wrapper">
                  <label>Services Offered*</label>
                  <CustomMultiSelect
                    name="services_offered"
                    options={serviceOptions}
                    placeholder="Select services offered"
                    isMulti={true}
                  />
                </div>
                <div className="select-field-wrapper">
                  <label>Specialties*</label>
                  <CustomMultiSelect
                    name="specialties"
                    options={specialtiesOptions}
                    placeholder="Select your specialties"
                    isMulti={true}
                  />
                </div>
              </div>

              <div className="select-field-wrapper">
                <label>Service Modalities*</label>
                <CustomMultiSelect
                  name="service_modalities"
                  options={modalityOptions}
                  placeholder="Select service modalities"
                  isMulti={true}
                />
              </div>

              <div className="wrapperInputFields">
                <div className="select-field-wrapper">
                  <label>Gender*</label>
                  <CustomMultiSelect
                    name="gender"
                    options={genderOptions}
                    placeholder="Select your gender"
                    isMulti={false}
                  />
                </div>
                <div className="select-field-wrapper">
                  <label>Race/Ethnicity*</label>
                  <CustomMultiSelect
                    name="race"
                    options={raceOptions}
                    placeholder="Select your race/ethnicity"
                    isMulti={false}
                  />
                </div>
              </div>

              <div className="select-field-wrapper">
                <label>Weekly Availability*</label>
                <WeeklyAvailability control={methods.control} />
              </div>

              <div className="d-flex">
                <CustomButton
                  title="Sign Up"
                  type="button"
                  onClick={methods.handleSubmit(onSubmit)}
                  className="secondary-button"
                  disabled={loading}
                />
              </div>
            </form>
          </FormProvider>
        </FormContainer>
      </RightPanel>
    </Wrapper>
  );
};

export default SignUp;
