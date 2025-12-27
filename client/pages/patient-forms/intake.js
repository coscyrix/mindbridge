"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import FormSubmission from "./form-submission";
import Spinner from "../../components/common/Spinner";
import CommonServices from "../../services/CommonServices";
import { toast } from "react-toastify";
import IntakeForm from "../../components/Forms/PatientForms/IntakeForm";

const IntakePage = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [formAlreadySubmitted, setFormAlreadySubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fix hydration issue by only using router.query after component mounts
  const { appointment_id } = router.isReady
    ? router.query
    : {};

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!router.isReady || !appointment_id) {
      setLoading(false);
      return;
    }

    const fetchFormSubmissionDetails = async () => {
      try {
        // Check if intake form has already been submitted
        const response = await CommonServices.getAppointmentById(appointment_id);
        if (response.status === 200 && response.data?.rec) {
          const appointment = response.data.rec;
          // Check if intake_form_submitted is true (can be 1 or true)
          if (appointment.intake_form_submitted === true || appointment.intake_form_submitted === 1) {
            setFormAlreadySubmitted(true);
          }
        }
      } catch (error) {
        toast.error(
          error?.message || "Error fetching form submission details"
        );
        console.log("Error while fetching the form submission details", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFormSubmissionDetails();
  }, [router.isReady, appointment_id]);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted || !router.isReady) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spinner color="#525252" />
      </div>
    );
  }

  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spinner color="#525252" />
      </div>
    );
  }

  if (formAlreadySubmitted) {
    return <FormSubmission alreadySubmitted />;
  }

  return <IntakeForm />;
};

export default IntakePage;

