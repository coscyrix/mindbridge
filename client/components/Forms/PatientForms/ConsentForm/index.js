import React, { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { useForm, Controller } from "react-hook-form";
import { ConsentFormContainer } from "./style";
import moment from "moment";
import CustomButton from "../../../CustomButton";
import { api } from "../../../../utils/auth";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

const ConsentForm = () => {
  const signaturePadRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      client_name: "Test",
      date: moment().format("DD/MM/YYYY"),
      signature: null,
    },
  });

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
    console.log("Form Data:", data);
    const { client_name, date, imgBase64 } = data;
    const { client_id } = router.query;
    try {
      setLoading(true);
      if (!client_id || !session_id) {
        toast.error("Required parameters are missing from the route.");
        setLoading(false);
        return;
      }
      const payload = {
        client_id: client_id,
        imgBase64,
      };
      const response = await api.post("/feedback/consent", payload);
      if (response.status === 200) {
        toast.success("Consent form submitted successfully!");
        reset();
      }
    } catch (error) {
      console.error("Error while submitting the consent form!");
      toast.error("Error while submitting the consent form");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConsentFormContainer>
      <div>
        <img
          src="/assets/images/consent_form_img.png"
          alt="vapendama image"
          width={100}
          height={120}
        />
        <h4>VAPENDAMA Counseling Services</h4>
      </div>
      <div className="content">
        <h3>INFORMED CONSENT</h3>
        <p>Welcome to VAPENDAMA Counseling Services.</p>
        <p>
          We serve as contracted counselors in partnership with WorkSafeBC,
          aligning our practices with the standards established by the Canadian
          Counselling and Psychotherapy Association and The BC Association of
          Clinical Counsellors (BCACC) as clinical counselors.
        </p>
        <p>
          Our primary emphasis lies in assisting injured workers by employing
          evidence-based treatment models designed to address mental health
          concerns and support a smooth return-to-work transition. In order to
          enhance the quality of care provided, we embrace a collaborative team
          approach.
        </p>
        <p>
          This involves working closely with various healthcare professionals,
          as recommended by your case manager, which may include Occupational
          Therapists, Vocational Rehabilitation Consultants, Physiotherapists,
          and occasionally, your physicians. This collaborative effort ensures a
          comprehensive and coordinated approach to your well-being and a
          successful return to work.
        </p>
        <h4>**Counseling & Confidentiality:**</h4>
        <p>
          The counseling process is conducted with the utmost confidentiality.
          While the team approach has - limitations, only information relevant
          to treatment will be shared
        </p>
        <p>The counselor is legally obligated to disclose confidentiality:</p>
        <ul>
          <li>
            if there is an imminent danger of self-harm, harm to another person,
          </li>
          <li>if there is an imminent danger to harm another person</li>
          <li>
            or if there is abuse of a child (age 0-18), elderly abuse, or abuse
            of a person with a disability.
          </li>
        </ul>
        <p>
          The counseling process is subject to legal processes; the
          client&apos;s record can be subpoenaed by a judge.
        </p>
        <p>
          In such cases, the counselor is responsible for informing the client.
          WorkSafeBC retains rights and ownership of counseling documents, which
          can be requested through WorkSafeBC. At the conclusion of counseling,
          a report will be generated, accessible to the client through the
          WorkSafeBC portal. Counseling documents will be securely stored for up
          to 7 years in a locked filing cabinet.
        </p>
        <h4>**Session Model and Communication:**</h4>
        <p>
          Sessions can be conducted in person or online with approval from a
          WorkSafeBC case manager. Online sessions are facilitated through
          Doxy.me, a secure platform. Communication may occur via the telephone
          number on file, and at times, through text messaging and email for
          scheduling purposes. Please note that email is not entirely
          confidential; any emails exchanged will be printed and stored in your
        </p>
        <p>
          To ensure best practices, counselors may seek consultation and
          supervision from qualified counseling supervisors. Clients are
          encouraged to adhere to the 24-hour cancellation policy.
        </p>
        <p>
          Please sign below to indicate that you have read the Counseling
          Informed Consent document, had sufficient time for consideration,
          asked questions for clarification, and understand the content.
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="client-details-container">
          <h4>Client Details :</h4>
          <div className="signature-container">
            <div className="client-details-field">
              <label>Client Print Name :</label>
              <Controller
                name="client_name"
                control={control}
                rules={{ required: "Client Name is required" }}
                render={({ field, fieldState }) => (
                  <>
                    {/* <label {...field} disabled /> */}
                    <input type="text" {...field} disabled />
                    {fieldState.error && (
                      <small>{fieldState.error.message}</small>
                    )}
                  </>
                )}
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
            <div style={{ display: "flex" }}>
              <label> Client Signature : </label>
              <Controller
                name="imgBase64"
                control={control}
                rules={{
                  required: "Signature is required",
                  validate: (value) =>
                    value !== null || "Please provide a valid signature",
                }}
                render={({ field }) => (
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "center",
                    }}
                  >
                    {!field.value && (
                      <SignatureCanvas
                        ref={signaturePadRef}
                        penColor="black"
                        canvasProps={{
                          className: "signature-canvas",
                        }}
                      />
                    )}
                    {field.value && (
                      <div>
                        <img src={field.value} alt="Client Signature" />
                      </div>
                    )}
                    <div>
                      {!field.value && (
                        <button
                          type="button"
                          onClick={() => saveSignature(field)}
                        >
                          Save
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          clearSignature();
                          field.onChange(null);
                        }}
                      >
                        Clear
                      </button>
                    </div>
                    {errors.signature && (
                      <small style={{ color: "red" }}>
                        {errors.signature.message}
                      </small>
                    )}
                  </div>
                )}
              />
            </div>
          </div>
        </div>

        <CustomButton
          title="Submit"
          style={{ marginLeft: "auto", marginTop: "20px", minWidth: "100px" }}
          type="submit"
          customClass="primary"
        />
      </form>
    </ConsentFormContainer>
  );
};

export default ConsentForm;
