import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useRouter } from "next/router";
import { Wrapper, LeftPanel, RightPanel, FormContainer } from "./style";
import CustomInputField from "../../CustomInputField";
import Link from "next/link";
import ForgotPasswordForm from "../ResetPasswordForm";
import { login, signUp } from "../../../utils/auth";
import { toast } from "react-toastify";
import Spinner from "../../common/Spinner";
import { ClosedEyeIcon, OpenEyeIcon } from "../../../public/assets/icons";
import OtpVerificationForm from "../OtpVerificationForm";

const AuthForm = () => {
  const router = useRouter();
  const { pathname } = router;
  const isSignUp = pathname === "/onboarding";
  const isResetPassword = pathname === "/reset-password";
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [email, setEmail] = useState("");

  const methods = useForm();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (formData) => {
    setLoading(true);
    try {
      if (!isSignUp) {
        await login(formData);
        setEmail(formData.email);
        setIsOtpStep(true);
        // router.push("/dashboard");
        toast.success("OTP sent to your email", { position: "top-right" });
      } else {
        await signUp(formData);
        toast.success("User created", { position: "top-right" });
        router.push("/login");
      }
    } catch (error) {
      // Deactivated account errors are handled by the interceptor in auth.js
      const errorMessage = error?.response?.data?.message || error?.message;
      toast.error(
        errorMessage ||
          "Something unexpected happened. Kindly check your connection.",
        { position: "top-right" }
      );
      setLoading(false);
    }
  };

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  return (
    <Wrapper>
      <LeftPanel>
        <div className="company-greetings">
          <img src="/assets/images/Mindbridge_logo_1.svg" alt="company-logo" />
          <div>
            <h1>Welcome to Mind Bridge! 👋</h1>
            <p>
              Your secure intelligent platform for streamlined counseling and
              client management.
            </p>
            <ul>
              <li>
                <b>Effortless Navigation: </b>Access client-sessions, treatment
                tools and actionable insights with minimal clicks.
              </li>
              <li>
                <b>Crisis Response: </b>A <b>one-click</b> link to &ldquo;
                <b>Responding to a Suicidal Client</b>
                &rdquo; is available on all main screens for immediate guidance.
              </li>
              <li>
                <b>Data-Driven Decisions: </b>Track client progress, automate
                SMART goal templates, and generate visual insights.
              </li>
              <li>
                <b>Seamless Session Management: </b>Schedule, monitor, and
                adjust treatment plans efficiently.
              </li>
            </ul>
            <br />
            <p>Login now and bridge the gap between care and innovation</p>
          </div>
        </div>
        <span>© {new Date().getFullYear()} MindBridge. All rights reserved.</span>
      </LeftPanel>
      <RightPanel>
        {isResetPassword ? (
          <ForgotPasswordForm />
        ) : isOtpStep ? (
          <OtpVerificationForm email={email} />
        ) : (
          <FormContainer>
            <h2>{isSignUp ? "Create an Account" : "Welcome Back!"}</h2>
            <FormProvider {...methods}>
              {/* Wrap the form with FormProvider */}
              <form onSubmit={methods.handleSubmit(onSubmit)}>
                {isSignUp && (
                  <>
                    <CustomInputField
                      name="user_first_name"
                      label="First Name"
                      required
                      customClass="name-input"
                      placeholder="First Name"
                    />
                    <CustomInputField
                      name="user_last_name"
                      label="Last Name"
                      required
                      customClass="name-input"
                      placeholder="Last Name"
                    />
                  </>
                )}

                <CustomInputField
                  name="email"
                  label="Email"
                  type="email"
                  required
                  placeholder="Email"
                  customClass="email-input"
                />
                <CustomInputField
                  name="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  required
                  icon={showPassword ? <OpenEyeIcon /> : <ClosedEyeIcon />}
                  customClass="password-input"
                  placeholder="Password"
                  handleShowPassword={handleShowPassword}
                />
                {/* {isSignUp && (
                  <CustomInputField
                    name="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    required
                    customClass="confirm-password-input"
                    placeholder="Confirm Password"
                  />
                )} */}

                <div className="remember-me-container">
                  <div className="remember-me">
                    <label>
                      <input type="checkbox" />
                      Remember me
                    </label>
                  </div>

                  {!isSignUp && (
                    <div className="forgot-password">
                      <Link href="/reset-password">Forgot Password ?</Link>
                    </div>
                  )}
                </div>
                <div className="d-flex">
                  <button
                    type="submit"
                    disabled={loading}
                    style={{ padding: loading && "5px" }}
                  >
                    {loading ? (
                      <Spinner />
                    ) : isSignUp ? (
                      "Sign Up Now"
                    ) : (
                      "Login Now"
                    )}
                  </button>
                  <Link href="/">
                    <div className="back-to-home">Back to home</div>
                  </Link>
                </div>
              </form>
            </FormProvider>
            {/* <p className="loginOrSignUp">
              {isSignUp ? (
                <>
                  Already have an account? <Link href="/login">Login now</Link>.
                </>
              ) : (
                <>
                  Don’t have an account?{" "}
                  <Link href="/sign-up">Create a new account now</Link>
                </>
              )}
            </p> */}
          </FormContainer>
        )}
      </RightPanel>
    </Wrapper>
  );
};

export default AuthForm;
