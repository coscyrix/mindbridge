"use client";

import SMARTGoalForms from "../../components/Forms/PatientForms/SMARTGoalsForm";
import { toast } from "react-toastify";
import FormSubmission from "./form-submission";
import Spinner from "../../components/common/Spinner";
import { useRouter } from "next/router";
import { useEffect, useMemo } from "react";
import CommonServices from "../../services/CommonServices";
import { useQueryData } from "../../utils/hooks/useQueryData";
import type {
  UserInfoAndFormStatusRecord,
  SMARTGoalFormData,
} from "../../components/Forms/PatientForms/SMARTGoalsForm/types";

const SMARTGoals = () => {
  const router = useRouter();
  const { form_id, session_id, client_id } = router.query;

  const {
    data: userInfoResponse,
    isPending: loading,
    error,
  } = useQueryData(
    ["user-info-form-status", client_id, session_id, form_id || 16],
    async () => {
      const response = await CommonServices.getUserInfoAndFormStatus({
        client_id: Number(client_id),
        session_id: Number(session_id),
        form_id: form_id ? Number(form_id) : 16, // SMART Goals form ID
      });
      if (
        response.status === 200 &&
        response.data?.rec &&
        response.data.rec.length > 0
      ) {
        return response.data.rec[0];
      }
      return null;
    },
    !!session_id && !!client_id // Only fetch when both are available
  );

  // Type assertion for the response data
  const typedUserInfoResponse = userInfoResponse as
    | UserInfoAndFormStatusRecord
    | null
    | undefined;

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error?.message || "Error fetching user info and form status");
      console.log("Error while fetching user info and form status", error);
    }
  }, [error]);

  // Transform data for the form
  const formData = useMemo<SMARTGoalFormData | null>(() => {
    if (!typedUserInfoResponse?.user_info) return null;

    const userInfo = typedUserInfoResponse.user_info;
    return {
      client_first_name: userInfo.user_first_name,
      client_last_name: userInfo.user_last_name,
      intake_date: userInfo.intake_date || new Date().toISOString(),
      service_name: userInfo.service_name || "",
      service_id: userInfo.service_id,
    };
  }, [typedUserInfoResponse]);

  const formAlreadySubmitted = typedUserInfoResponse?.form_submitted || false;

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

  return formAlreadySubmitted ? (
    <FormSubmission alreadySubmitted />
  ) : (
    <SMARTGoalForms formData={formData} />
  );
};
export default SMARTGoals;
