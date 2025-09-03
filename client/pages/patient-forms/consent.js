"use client";
import React, { useEffect, useState } from "react";
import ConsentForm from "../../components/Forms/PatientForms/ConsentForm";
import { api } from "../../utils/auth";
import { toast } from "react-toastify";
import FormSubmission from "./form-submission";
import Spinner from "../../components/common/Spinner";
import { useRouter } from "next/router";
import CommonServices from "../../services/CommonServices";

const ConsentPage = () => {
  const router = useRouter();
  const { form_id, client_id, client_name } = router.query;

  const [formAlreadySubmitted, setFormAlreadySubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!form_id || !client_id) return;

    const fetchFormSubmissionDetails = async () => {
      try {
        const response = await CommonServices.getFormSubmissionDetails({
          form_id,
          client_id,
        });
        if (response.status === 200) {
          const { data } = response;
          const formObj = data[0];
          if (formObj?.form_submit == 1 || formObj?.form_submit == true) {
            setFormAlreadySubmitted(true);
          }
        }
      } catch (error) {
        toast.error(error?.message || "Error fetching form submission details");
        console.log("Error while fetching the form submission details", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFormSubmissionDetails();
  }, [form_id, client_id]);

  // if (loading) {
  //   return (
  //     <div style={{ height: "100vh", display: "flex", alignItems: "center" }}>
  //       <Spinner color="#525252" />
  //     </div>
  //   );
  // }
  return formAlreadySubmitted ? (
    <FormSubmission alreadySubmitted />
  ) : (
    <ConsentForm client_name={client_name} />
  );
};

export default ConsentPage;
