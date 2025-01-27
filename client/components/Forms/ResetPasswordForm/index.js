import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import CustomInputField from "../../CustomInputField";
import { toast } from "react-toastify";
import { api } from "../../../utils/auth";
import { ResetFormWrapper } from "./style";
import { ClosedEyeIcon, OpenEyeIcon } from "../../../public/assets/icons";
import {
  PasswordConfirmationSchema,
  EmailVerificationSchema,
} from "../../../utils/validationSchema/validationSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import Spinner from "../../common/Spinner";
const ForgotPasswordForm = () => {
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const schema = isResettingPassword
    ? PasswordConfirmationSchema
    : EmailVerificationSchema;

  const methods = useForm({
    resolver: zodResolver(schema),
    mode: "all",
  });
  const [passwordVisibility, setPasswordVisibility] = useState({
    password: false,
    confirmPassword: false,
  });

  const handleShowPassword = (field) => {
    setPasswordVisibility((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  const handleSendEmail = async (data) => {
    try {
      const response = await api.post("/auth/forgot-password", data);
      if (response.status === 200) {
        toast.success("Verification code sent to your email!", {
          position: "top-right",
        });
        setIsResettingPassword(true);
      } else {
        toast.error(response.data.message, { position: "top-right" });
      }
    } catch (error) {
      toast.error("Failed to send verification email. Please try again.", {
        position: "top-right",
      });
    }
  };

  const handleResetPassword = async (data) => {
    try {
      const response = await api.post("/auth/change-password", data);
      if (response.status === 200) {
        toast.success("Password reset successfully!", {
          position: "top-right",
        });
        methods.reset();
        navigate("/login");
        setIsResettingPassword(false);
      }
    } catch (error) {
      toast.error(
        "Failed to reset password. Please check verification code or try again.",
        { position: "top-right" }
      );
    }
  };

  return (
    <ResetFormWrapper>
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(
            isResettingPassword ? handleResetPassword : handleSendEmail
          )}
        >
          {!isResettingPassword && (
            <>
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
                {methods.formState.isSubmitting ? (
                  <Spinner />
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </>
          )}

          {isResettingPassword && (
            <>
              <CustomInputField
                name="verificationCode"
                placeholder="Enter verification code"
                label="Verification Code"
                required
              />
              <CustomInputField
                name="password"
                label="New Password"
                placeholder="Enter your passowrd"
                type={passwordVisibility.password ? "text" : "password"}
                icon={
                  passwordVisibility.password ? (
                    <OpenEyeIcon />
                  ) : (
                    <ClosedEyeIcon />
                  )
                }
                required
                handleShowPassword={() => handleShowPassword("password")}
              />
              <CustomInputField
                name="password_confirmation"
                label="Confirm Password"
                placeholder="Confirm new passowrd"
                type={passwordVisibility.confirmPassword ? "text" : "password"}
                icon={
                  passwordVisibility.confirmPassword ? (
                    <OpenEyeIcon />
                  ) : (
                    <ClosedEyeIcon />
                  )
                }
                handleShowPassword={() => handleShowPassword("confirmPassword")}
                required
              />
              <button
                type="submit"
                className="btn-two w-100 text-uppercase d-block mt-20"
                disabled={methods.formState.isSubmitting}
              >
                {methods.formState.isSubmitting ? (
                  <Spinner />
                ) : (
                  "Reset Password"
                )}
              </button>
            </>
          )}
        </form>
      </FormProvider>
    </ResetFormWrapper>
  );
};

export default ForgotPasswordForm;
