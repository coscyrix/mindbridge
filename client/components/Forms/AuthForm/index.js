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

const AuthForm = () => {
  const router = useRouter();
  const { pathname } = router;
  const isSignUp = pathname === "/sign-up";
  const isResetPassword = pathname === "/reset-password";

  const methods = useForm();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (formData) => {
    setLoading(true);
    try {
      if (!isSignUp) {
        await login(formData);
        router.push("/dashboard");
        toast.success("Login successful", { position: "top-right" });
      } else {
        await signUp(formData);
        toast.success("User created", { position: "top-right" });
        router.push("/login");
      }
    } catch (error) {
      toast.error(
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
          <img src="/assets/images/logo.png" alt="company-logo" />
          <div>
            <h1>Welcome to Mind Bridge! 👋</h1>
            <p>
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industry&apos;s standard dummy
              text ever since the 1500s.
            </p>
          </div>
        </div>
        <span>© 2024 MindBridge. All rights reserved.</span>
      </LeftPanel>
      <RightPanel>
        {isResetPassword ? (
          <ForgotPasswordForm />
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
                </div>
              </form>
            </FormProvider>
            <p className="loginOrSignUp">
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
            </p>
          </FormContainer>
        )}
      </RightPanel>
    </Wrapper>
  );
};

export default AuthForm;
