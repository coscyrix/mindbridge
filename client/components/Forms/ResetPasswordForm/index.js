import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useRouter } from "next/router";
import CustomInputField from "../../CustomInputField";
import { toast } from "react-toastify";
import { api } from "../../../utils/auth";
import { ResetFormWrapper } from "./style";
import Spinner from "../../common/Spinner";
import { zodResolver } from "@hookform/resolvers/zod";
import { EmailVerificationSchema } from "../../../utils/validationSchema/validationSchema";

const ForgotPasswordForm = () => {
  const router = useRouter();
  const methods = useForm({
    resolver: zodResolver(EmailVerificationSchema),
    mode: "all",
  });

  const handleSendEmail = async (data) => {
    try {
      const response = await api.post("/auth/forgot-password", data);
      if (response.status === 200) {
        toast.success("New password sent to your email!", {
          position: "top-right",
        });
        router.push("/login");
      } else {
        toast.error(response.data.message, { position: "top-right" });
      }
    } catch (error) {
      toast.error("Failed to send email. Please try again.", {
        position: "top-right",
      });
    }
  };

  return (
    <ResetFormWrapper>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleSendEmail)}>
          <CustomInputField
            name="email"
            label="Email Address"
            placeholder="Email"
            type="email"
            required
          />
          <button
            type="submit"
            className="btn-two w-100 text-uppercase d-block mt-20"
            disabled={methods.formState.isSubmitting}
          >
            {methods.formState.isSubmitting ? <Spinner /> : "Send New Password"}
          </button>
        </form>
      </FormProvider>
    </ResetFormWrapper>
  );
};

export default ForgotPasswordForm;
