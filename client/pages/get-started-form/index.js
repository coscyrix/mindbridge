import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomButton from "../../components/CustomButton";
import { getStartedSchema } from "../../utils/validationSchema/validationSchema";
import CustomInputField from "../../components/CustomInputField";
import { useRouter } from "next/router";
import { GoArrowLeft } from "react-icons/go";
import SignatureField from "../../components/SignatureCanvas";
import CommonServices from "../../services/CommonServices";
import { toast } from "react-toastify";
import CustomLoader from "../../components/Loader/CustomLoader";
const GetStartedForm = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const totalSteps = 3;
  const [loading, setIsLoading] = useState(false);

  const methods = useForm({
    resolver: zodResolver(getStartedSchema),
    mode: "onSubmit",
  });

  const {
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
    // e.preventDefault();

    try {
      setIsLoading(true);
      const payload = {
        ...data,
      };
      const response = await CommonServices.submitOnboardingform(payload);
      console.log(response);
      toast.success(response?.message);
      methods.reset();
      router.push("/");
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(error?.response?.data?.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <div  className="loader-container">
        {loading && (
          <div className="loader-overlay">
            <CustomLoader top="10vh" left="90vh"/>
          </div>
        )}

        <form className={`onboarding-form ${loading ? "dimmed" : ""}`}>
          <div className="arrow-parent">
            <GoArrowLeft onClick={() => router.back()} size={50} />
            <h1>MindBridge Tenant Manager Demo Request & Onboarding Form</h1>
          </div>

          {/* Step Indicatirs  */}
          <div style={{ marginBottom: "1rem", textAlign: "center" }}>
            Step {step} of {totalSteps}
          </div>

          {step === 1 && (
            <section className="onboarding-section">
              <h2>1. Company & Contact Information</h2>
              <CustomInputField label="Organization Name" name="organization" />
              <CustomInputField label="Contact Name" name="contact" />
              <CustomInputField label="Position/Title" name="position" />
              <CustomInputField
                label="Email Address"
                name="email"
                type="email"
              />
              <CustomInputField label="Phone Number" name="phone" type="tel" />
              <CustomInputField
                label="Company Website"
                name="website"
                type="url"
              />
              <CustomInputField label="Office Address" name="address" />
            </section>
          )}

          {step === 2 && (
            <section className="onboarding-section">
              <h2>2. Service & Demo Details</h2>
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
                label="Interested Features"
                name="features"
                placeholder="Session Scheduling / Billing / Messaging"
              />
              <CustomInputField
                label="Preferred Demo Date/Time"
                name="demoTime"
                type="datetime-local"
              />
              <CustomInputField
                label="Additional Notes"
                name="notes"
                isTextarea
              />
            </section>
          )}

          {step === 3 && (
            <section className="onboarding-section">
              <h2>3. Sign & Agree to Onboarding</h2>
              <p>
                I confirm that the information provided above is accurate and
                agree to receive communications about my demo and onboarding.
              </p>
              <CustomInputField label="Typed Name" name="typedName" />
              <SignatureField
                name="signature"
                label="Signature"
                control={methods.control}
                errors={methods.formState.errors}
              />
              <CustomInputField label="Date" name="date" type="date" />
            </section>
          )}

          <p className="disclaimer">
            *By submitting this form, you agree to MindBridge Terms of Use and
            Privacy Policy, and consent to be contacted for onboarding and
            related updates.*
          </p>

          {/* Step Navigtion */}
          <div className="flex justify-between mt-6">
            {step > 1 && (
              <CustomButton title="Back" type="button" onClick={prevStep} />
            )}
            {step < totalSteps ? (
              <CustomButton
                title="Next"
                type="button"
                onClick={async () => {
                  const valid = await methods.trigger(getFieldsByStep(step));
                  if (valid) setStep(step + 1);
                }}
              />
            ) : (
              <CustomButton
                title="Submit"
                type="button"
                onClick={methods.handleSubmit(onSubmit)}
              />
            )}
          </div>
        </form>
      </div>
    </FormProvider>
  );
};

// Fields to validate per step
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
      return ["counselors", "clients", "features", "demoTime", "notes"];
    case 3:
      return ["typedName", "signature", "date"];
    default:
      return [];
  }
};

export default GetStartedForm;
