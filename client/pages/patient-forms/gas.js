"use client";
import React, { useEffect, useState } from "react";
// import AnxietyDisorderForm from "../../components/Forms/PatientForms/AnxietyDisorderForm";
import { api } from "../../utils/auth";
import { toast } from "react-toastify";
import FormSubmission from "./form-submission";
import Spinner from "../../components/common/Spinner";
import { useRouter } from "next/router";
import CommonServices from "../../services/CommonServices";
import GasForm from "../../components/Forms/PatientForms/GASForm";

const AnxietyDisorderFormPage = () => {
  const router = useRouter();
  const { form_id, session_id, client_id, goal } = router.query;
  const [formAlreadySubmitted, setFormAlreadySubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session_id) return;

    const fetchFormSubmissionDetails = async () => {
      try {
        const response = await CommonServices.getFormSubmissionDetails({
          form_id,
          session_id,
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
  }, [session_id]);

  if (loading) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center" }}>
        <Spinner color="#525252" />
      </div>
    );
  }
  return formAlreadySubmitted ? (
    <FormSubmission alreadySubmitted />
  ) : (
    <GasForm client_id={client_id} session_id={session_id} goal={goal} />
  );
};

export default AnxietyDisorderFormPage;
