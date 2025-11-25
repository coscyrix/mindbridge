import { zodResolver } from "@hookform/resolvers/zod";
import CloseIcon from "@mui/icons-material/Close";
import { useRouter } from "next/router";
import { useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { GoArrowLeft } from "react-icons/go";
import PhoneInput from "react-phone-number-input";
import { toast } from "react-toastify";
import CommonServices from "../../../services/CommonServices";
import { getStartedSchema } from "../../../utils/validationSchema/validationSchema";
import CustomButton from "../../CustomButton";
import CustomInputField from "../../CustomInputField";
import CustomMultiSelect from "../../CustomMultiSelect";
import CustomLoader from "../../Loader/CustomLoader";
import SignatureField from "../../SignatureCanvas";
import GetStartedFormTemplateWrapper from "./style";
export const featureOptions = [
  { value: "Session Scheduling", label: "Session Scheduling" },
  { value: "Billing & Invoicing", label: "Billing & Invoicing" },
  { value: "Assessments & Forms", label: "Assessments & Forms" },
  { value: "Secure Messaging", label: "Secure Messaging" },
  { value: "E-Signature", label: "E-Signature" },
  { value: "Other", label: "Other" },
];
import 'react-phone-number-input/style.css'


const GetStartedFormTemplate = ({ onClose, open }) => {
  const getFieldsByStep = (step) => {
    switch (step) {
      case 1:
        return [
          "organization",
          "contact",
          "position",
          "email",
          "phone",
          "website",
          "address",
        ];
      case 2:
        return [
          "counselors",
          "clients",
          "features",
          "demodate",
          "demotime",
          "notes",
        ];
      case 3:
        return ["typedName", "signature", "date"];
      default:
        return [];
    }
  };
  const totalSteps = 3;
  const [step, setStep] = useState(1);
  const [loading, setIsLoading] = useState(false);
  const methods = useForm({
    resolver: zodResolver(getStartedSchema),
    defaultValues: {
      organization: "",
      contact: "",
      position: "",
      email: "",
      phone: "",
      website: "",
      address: "",
      counselors: "",
      clients: "",
      features: [],
      demodate: "",
      demotime: "",
      notes: "",
      typedName: "",
      signature: "",
      date: "",
      confirmInfo: false,
      agreeTerms: false,
    },
    mode: "onSubmit",
  });
  const {
    control,
    handleSubmit,
    trigger,
    formState: { errors },
  } = methods;
  const nextStep = async () => {
    const valid = await trigger(getFieldsByStep(step));
    if (valid) {
      setStep((s) => s + 1);
    }
  };
  const prevStep = () => setStep((s) => s - 1);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const combinedDateTime =
        data.demodate && data.demotime
          ? `${data.demodate}T${data.demotime}`
          : null;
      const featuresString = data.features
        .map((feature) => feature.value)
        .join(", ");
      const payload = {
        ...data,
        website:
          data.website?.startsWith("http://") ||
          data.website?.startsWith("https://")
            ? data.website
            : `https://${data.website}`,
        demoTime: combinedDateTime,
        features: featuresString,
      };
      delete payload.demodate;
      delete payload.demotime;
      delete payload.confirmInfo;
      delete payload.agreeTerms;
      const response = await CommonServices.submitOnboardingform(payload);
      if (response) {
        toast.success(response?.message);
      }
      onClose();
      methods.reset();
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(error?.response?.data?.message);
    } finally {
      setIsLoading(false);
    }
  };
  const countryOptions = [
    { label: "US", value: "+1" },
    { label: "India", value: "+91" },
    { label: "UK", value: "+44" },
  ];
  const router = useRouter();
  return (
    <GetStartedFormTemplateWrapper>
      <CloseIcon
        className="modal-close-btn"
        onClick={onClose}
        aria-label="Close Get Started Form"
        type="button"
      ></CloseIcon>

      <FormProvider {...methods}>
        <header className="form-header">
          <div className="arrow-parent">
            <span>
              <GoArrowLeft
                size={30}
                className="back-button"
                onClick={() => {
                  router.back();
                }}
                aria-label="Close Get Started Form"
                type="button"
              ></GoArrowLeft>
            </span>
            <h1>MindBridge Demo & Onboarding Form</h1>
          </div>
          <div className="steps-parent">
            <div className="progress-background">
              <div
                className="progress-filled"
                style={{ width: `${(step - 1) * 50}%` }}
              />
            </div>

            {[1, 2, 3].map((num) => {
              const isActive = step === num;
              const isCompleted = step > num;

              return (
                <div
                  key={num}
                  className={`step-main ${isActive ? "active" : ""} ${
                    isCompleted ? "completed" : ""
                  }`}
                >
                  <span className="step-count">{num}</span>
                  <span className="step-label">
                    {num === 1 && "Company & Contact Information"}
                    {num === 2 && "Service & Demo Details"}
                    {num === 3 && "Sign & Agree to Onboarding"}
                  </span>
                </div>
              );
            })}
          </div>
        </header>

        <form className={`onboarding-form ${loading ? "dimmed" : ""}`}>
          {step === 1 && (
            <>
              <section className="onboarding-section">
                <CustomInputField label="Contact Name" name="contact" />
                <CustomInputField label="Position/Title" name="position" />
                <CustomInputField
                  label="Email Address"
                  name="email"
                  type="email"
                />
                <div className="country-phoneno">
                  <Controller
                    name="phone"
                    control={control}
                    rules={{ required: "Phone number is required" }}
                    render={({ field, fieldState }) => (
                      <div className="phone-input-wrapper">
                        <label className="phone-label">Phone Number</label>
                        <PhoneInput
                          country={"us"}
                          enableSearch={true}
                          value={field.value || ""}
                          onChange={(value, country) => {
                            field.onChange("+" + value);
                          }}
                          inputClass={
                            fieldState.error
                              ? "phone-input error"
                              : "phone-input"
                          }
                          buttonClass="phone-dropdown"
                          dropdownClass="phone-dropdown-menu"
                          inputProps={{
                            name: "phone",
                            required: true,
                          }}
                        />
                        {fieldState.error && (
                          <p className="phone-error">
                            {fieldState.error.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                </div>

                <CustomInputField
                  label="Organization Name"
                  name="organization"
                />

                <CustomInputField
                  label="Company Website"
                  name="website"
                  type="url"
                  prefix="true"
                />
              </section>
              <div className="address-main">
                <label htmlFor="address" className="address-label">
                  Address
                </label>
                <textarea
                  label="Office Address"
                  name="address"
                  rows={5}
                  className={`address-textarea ${
                    methods.formState.errors.address ? "error-border" : ""
                  }`}
                  {...methods.register("address")}
                />
                {methods.formState.errors.address && (
                  <p className="error-text">
                    {methods.formState.errors.address.message}
                  </p>
                )}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <section className="onboarding-section">
                <CustomInputField
                  label="Number of Counselors"
                  name="counselors"
                  type="number"
                />
                <CustomInputField
                  label="Estimated Clients per Month"
                  name="clients"
                  type="number"
                />
                <CustomInputField
                  label="Preferred Demo Date"
                  name="demodate"
                  type="date"
                />

                <CustomInputField
                  label="Preferred Demo Time"
                  name="demotime"
                  type="time"
                />
              </section>

              <div className="feature-container">
                <Controller
                  control={methods.control}
                  name="features"
                  render={({ field, fieldState }) => (
                    <CustomMultiSelect
                      className={
                        methods.formState.errors.features?.message
                          ? "feature-select"
                          : ""
                      }
                      label="Interested Features"
                      options={featureOptions}
                      placeholder="Select interested features"
                      value={field.value}
                      onChange={field.onChange}
                      error={methods.formState?.errors?.features?.message}
                    />
                  )}
                />
              </div>

              <div className="address-main">
                <label htmlFor="additionalnote" className="address-label">
                  Additional Notes
                </label>
                <textarea
                  label="Additional Notes"
                  name="notes"
                  rows={5}
                  className={`address-textarea ${
                    methods.formState.errors.notes ? "error-border" : ""
                  }`}
                  {...methods.register("notes")}
                />
                {methods.formState.errors.notes && (
                  <p className="error-text">
                    {methods.formState.errors.notes.message}
                  </p>
                )}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <section className="onboarding-section">
                <CustomInputField label="Typed Name" name="typedName" />

                <CustomInputField label="Date" name="date" type="date" />
              </section>
              <SignatureField
                name="signature"
                label="Signature"
                control={methods.control}
                errors={methods.formState.errors}
              />
              <div className="disclaimer-parent">
                <label className="disclaimer">
                  <input
                    type="checkbox"
                    // checked={confirmInfo}
                    // onChange={(e) => setConfirmInfo(e.target.checked)}
                    {...methods.register("confirmInfo")}
                  />
                  I confirm that the information provided above is accurate and
                  agree to receive communications about my demo and onboarding.
                  {methods.formState.errors?.confirmInfo && (
                    <p className="error-text">
                      {methods.formState.errors?.confirmInfo?.message}
                    </p>
                  )}
                </label>

                <label className="disclaimer">
                  <input
                    type="checkbox"
                    // checked={agreeTerms}
                    // onChange={(e) => setAgreeTerms(e.target.checked)}
                    {...methods.register("agreeTerms")}
                  />
                  By submitting this form, you agree to MindBridge Terms of Use
                  and Privacy Policy, and consent to be contacted for onboarding
                  and related updates.
                  {methods.formState.errors?.agreeTerms && (
                    <p className="error-text">
                      {methods.formState.errors?.agreeTerms?.message}
                    </p>
                  )}
                </label>
              </div>
            </>
          )}

          <div className="form-navigation">
            {step === 1 && (
              <>
                <CustomButton
                  className="button"
                  title="Cancel"
                  type="button"
                  onClick={onClose}
                />
                <CustomButton
                  className="button button-blue"
                  title="Next"
                  type="button"
                  onClick={async () => {
                    const valid = await methods.trigger(getFieldsByStep(step));
                    if (valid) setStep(step + 1);
                  }}
                />
              </>
            )}

            {step === 2 && (
              <>
                <CustomButton
                  className="button "
                  title="Back"
                  type="button"
                  onClick={() => setStep(step - 1)}
                />
                <CustomButton
                  className="button button-blue"
                  title="Next"
                  type="button"
                  onClick={async () => {
                    const valid = await methods.trigger(getFieldsByStep(step));
                    if (valid) setStep(step + 1);
                  }}
                />
              </>
            )}

            {step === 3 && (
              <>
                <CustomButton
                  className="button "
                  title="Back"
                  type="button"
                  onClick={() => setStep(step - 1)}
                />
                <CustomButton
                  className="button button-blue"
                  title="Submit"
                  type="button"
                  onClick={methods.handleSubmit(onSubmit)}
                />
              </>
            )}
          </div>
        </form>

        {loading && (
          <div className="loader-overlay">
            <CustomLoader />
          </div>
        )}
      </FormProvider>
    </GetStartedFormTemplateWrapper>
  );
};

export default GetStartedFormTemplate;
