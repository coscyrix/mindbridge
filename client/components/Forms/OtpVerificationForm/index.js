import React, { useState } from "react";
import { toast } from "react-toastify";
import { otpVerication } from "../../../utils/auth";
import { useRouter } from "next/router";
import Spinner from "../../common/Spinner";
import { OtpVerificationFormContainer } from "./style";

const OtpVerificationForm = ({ email }) => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleVerifyOtp = async () => {
    try {
      setLoading(true);
      if (!otp) {
        setError("OTP is required");
        return;
      }
      setError("");
      await otpVerication({ email, otp });
      router.push("/dashboard");
    } catch (error) {
      toast.error(error?.message || "Error while verifying the OTP!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <OtpVerificationFormContainer>
      <div>
        <h2>Verify Account!</h2>
        <div className="input-field-container">
          <label>Email</label>
          <input type="email" value={email} disabled className="disabled" />
        </div>
        <div className="input-field-container">
          <label>OTP</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            value={otp}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              if (value.length <= 6) setOtp(value);
            }}
            placeholder="Enter OTP"
            className={error ? "error-input" : ""}
            maxLength={6}
            required
          />
          {error && <p className="error-text">{error}</p>}
          <p className="helper-text">Check your email for the OTP</p>
        </div>

        <button
          onClick={handleVerifyOtp}
          disabled={loading}
          style={{ padding: loading && "5px" }}
        >
          {loading ? <Spinner /> : "Verify OTP"}
        </button>
      </div>
    </OtpVerificationFormContainer>
  );
};

export default OtpVerificationForm;
