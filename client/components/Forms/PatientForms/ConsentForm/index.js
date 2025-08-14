import React, { useEffect, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { useForm, Controller, FormProvider } from "react-hook-form";
import { ConsentFormContainer } from "./style";
import moment from "moment";
import CustomButton from "../../../CustomButton";
import { api } from "../../../../utils/auth";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import CommonServices from "../../../../services/CommonServices";
import CustomInputField from "../../../CustomInputField";
import Spinner from "../../../common/Spinner";
import SignatureField from "../../../SignatureCanvas";
import ApiConfig from "../../../../config/apiConfig";
import FormHeader from "../../../FormsHeader";

const ConsentForm = ({ tenant_ID = "", initialData, loader }) => {
  const signaturePadRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [consentBody, setConsentBody] = useState(null);
  const methods = useForm({
    defaultValues: {
      client_name: "",
      date: moment().format("DD/MM/YYYY"),
      signature: null,
      acknowledged: false,
    },
  });

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
    reset,
  } = methods;

  const router = useRouter();

  const clearSignature = () => {
    signaturePadRef.current?.clear();
    setValue("signature", null);
  };

  const saveSignature = (field) => {
    if (signaturePadRef.current?.isEmpty()) {
      alert("Please provide a signature.");
    } else {
      const signatureData = signaturePadRef.current.toDataURL("image/png");
      field.onChange(signatureData);
    }
  };

  const onSubmit = async (data) => {
    const { client_name, date, imgBase64 } = data;
    const { client_id, form_id, tenant_id } = router.query;
    try {
      setLoading(true);
      const payload = {
        client_id: client_id,
        imgBase64,
        tenant_id,
      };
      if (!client_id || !form_id || !tenant_id) {
        toast.error("Required parameters are missing from the route.");
        setLoading(false);
        return;
      }
      const response = await CommonServices.submitConsentForm(payload);
      if (response.status === 200) {
        toast.success(data?.message || "Consent form submitted successfully!");
        reset();
        router.push("/patient-forms/form-submission");
      }
    } catch (error) {
      console.error("Error while submitting the consent form: ", error);
      toast.error(error?.message || "Error while submitting the consent form");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialData) {
      reset({
        client_name: initialData?.clientName || "",
        date: moment().format("DD/MM/YYYY"),
        signature: initialData?.imgBase64 || null,
      });
    }
  }, [initialData, reset]);

  const getConsentBody = async () => {
    try {
      let tenant_id;
      if (router.pathname === "/dashboard") {
        tenant_id = tenant_ID;
      } else {
        tenant_id=router.query.tenant_id;
      }
      const result = await api.get(
        `${ApiConfig.consentFormSubmittion.consentForm}?tenant_id=${tenant_id}`
      );
      if (result.status === 200) {
        setConsentBody(result?.data?.description);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
      console.log(error);
    }
  };
  useEffect(() => {
    if (router.isReady) {
      getConsentBody();
    }
  }, [router.isReady, router.query]);

  return (
    <>
      {loader ? (
        <div
          style={{
            width: "100%",
            height: "400px",
            position: "relative",
            top: "45%",
          }}
        >
          <Spinner color="#525252" />
        </div>
      ) : (
        <ConsentFormContainer>
          <FormHeader
            tittle={"Consent Form"}
            description={
              " Digital consent form to document client agreement on therapy terms, ensure informed participation, and maintain secure, compliant records"
            }
          />
          <div>
            <img
              src="/assets/images/consent_form_img.png"
              alt="vapendama image"
              width={100}
              height={120}
            />
            <h4>VAPENDAMA Counseling Services</h4>
          </div>

          {consentBody ? (
            <>
              <div
                className="content"
                dangerouslySetInnerHTML={{ __html: consentBody }}
              />
            </>
          ) : (
            <div className="content">
              <h3>INFORMED CONSENT</h3>
              <p>Welcome to VAPENDAMA Counseling Services.</p>
              <p>
                We serve as contracted counselors in partnership with
                WorkSafeBC, aligning our practices with the standards
                established by the Canadian Counselling and Psychotherapy
                Association and The BC Association of Clinical Counsellors
                (BCACC) as clinical counselors.
              </p>
              <p>
                Our primary emphasis lies in assisting injured workers by
                employing evidence-based treatment models designed to address
                mental health concerns and support a smooth return-to-work
                transition. In order to enhance the quality of care provided, we
                embrace a collaborative team approach.
              </p>
              <p>
                This involves working closely with various healthcare
                professionals, as recommended by your case manager, which may
                include Occupational Therapists, Vocational Rehabilitation
                Consultants, Physiotherapists, and occasionally, your
                physicians. This collaborative effort ensures a comprehensive
                and coordinated approach to your well-being and a successful
                return to work.
              </p>
              <h4>**Counseling & Confidentiality:**</h4>
              <p>
                The counseling process is conducted with the utmost
                confidentiality. While the team approach has - limitations, only
                information relevant to treatment will be shared
              </p>
              <p>
                The counselor is legally obligated to disclose confidentiality:
              </p>
              <ul>
                <li>
                  if there is an imminent danger of self-harm, harm to another
                  person,
                </li>
                <li>if there is an imminent danger to harm another person</li>
                <li>
                  or if there is abuse of a child (age 0-18), elderly abuse, or
                  abuse of a person with a disability.
                </li>
              </ul>
              <p>
                The counseling process is subject to legal processes; the
                client&apos;s record can be subpoenaed by a judge.
              </p>
              <p>
                In such cases, the counselor is responsible for informing the
                client. WorkSafeBC retains rights and ownership of counseling
                documents, which can be requested through WorkSafeBC. At the
                conclusion of counseling, a report will be generated, accessible
                to the client through the WorkSafeBC portal. Counseling
                documents will be securely stored for up to 7 years in a locked
                filing cabinet.
              </p>
              <h4>**Session Model and Communication:**</h4>
              <p>
                Sessions can be conducted in person or online with approval from
                a WorkSafeBC case manager. Online sessions are facilitated
                through Doxy.me, a secure platform. Communication may occur via
                the telephone number on file, and at times, through text
                messaging and email for scheduling purposes. Please note that
                email is not entirely confidential; any emails exchanged will be
                printed and stored in your
              </p>
              <p>
                To ensure best practices, counselors may seek consultation and
                supervision from qualified counseling supervisors. Clients are
                encouraged to adhere to the 24-hour cancellation policy.
              </p>
              <p>
                Please sign below to indicate that you have read the Counseling
                Informed Consent document, had sufficient time for
                consideration, asked questions for clarification, and understand
                the content.
              </p>
              remove all html tags
            </div>
          )}
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="client-details-container">
                <h4>Client Details :</h4>
                <div className="signature-container">
                  <div className="client-details-field">
                    <label>Client Print Name :</label>
                    <CustomInputField
                      name="client_name"
                      customClass="name-input"
                      placeholder="Full Name"
                      disabled={initialData}
                    />
                  </div>
                  <div>
                    <label>Date :</label>
                    <Controller
                      name="date"
                      control={control}
                      rules={{ required: "Date is required" }}
                      render={({ field, fieldState }) => (
                        <>
                          <input type="text" {...field} disabled />
                          {fieldState.error && (
                            <small>{fieldState.error.message}</small>
                          )}
                        </>
                      )}
                    />
                  </div>
                  <SignatureField
                    name="imgBase64"
                    label="Client Signature"
                    control={control}
                    errors={errors}
                    initialData={initialData}
                  />
                </div>
                <Controller
                  name="acknowledged"
                  control={control}
                  rules={{
                    required: "You must acknowledge before submitting",
                  }}
                  render={({ field, fieldState }) => (
                    <div>
                      <label className="acknowledgement-container">
                        <input
                          type="checkbox"
                          {...field}
                          checked={field.value || false}
                          className="acknowledgement-checkbox"
                        />
                        <span className="acknowledgement-label">
                          I have read, understood, and agree to the terms
                          outlined in this consent form.
                        </span>
                      </label>
                      {fieldState.error && (
                        <div className="acknowledgement-error">
                          {fieldState.error.message}
                        </div>
                      )}
                    </div>
                  )}
                />
              </div>

              {!initialData && (
                <CustomButton
                  title="Submit"
                  style={{
                    marginLeft: "auto",
                    marginTop: "20px",
                    minWidth: "100px",
                  }}
                  type="submit"
                  customClass="primary"
                />
              )}
            </form>
          </FormProvider>
        </ConsentFormContainer>
      )}
    </>
  );
};

export default ConsentForm;
