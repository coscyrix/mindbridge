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

const ConsentForm = ({ initialData, loader }) => {
  const signaturePadRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [consentBody, setConsentBody] = useState(null);
  const methods = useForm({
    defaultValues: {
      client_name: "",
      date: moment().format("DD/MM/YYYY"),
      signature: null,
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
      const { tenant_id } = router.query;
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
          <div
            className="content"
            dangerouslySetInnerHTML={{ __html: consentBody }}
          />
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
