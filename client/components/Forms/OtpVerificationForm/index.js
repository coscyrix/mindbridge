import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { otpVerication } from "../../../utils/auth";
import { useRouter } from "next/router";
import Spinner from "../../common/Spinner";
import { OtpVerificationFormContainer } from "./style";
import { useReferenceContext } from "../../../context/ReferenceContext";
import CommonServices from "../../../services/CommonServices";
import Cookies from "js-cookie";

const OtpVerificationForm = ({ email }) => {
  const userData = Cookies.get("user");
  const userObj = userData && JSON.parse(userData);
  const [otp, setOtp] = useState("");
  const [hasService,setHasService] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [userDetails, setUserDetails] = useState({});
  const router = useRouter();

  useEffect(() => {
    if (userData) {
      const details = JSON.parse(userData);
      setUserDetails(details);
      setHasService(details.has_services);
    }
  }, []);


  const handleVerifyOtp = async () => {
    try {
      setLoading(true);
      if (!otp) {
        setError("OTP is required");
        return;
      }
      setError("");
      const response = await otpVerication({ email, otp });

      // Check if account is deactivated after OTP verification
      const updatedUserData = Cookies.get("user");
      if (updatedUserData) {
        const updatedUser = JSON.parse(updatedUserData);
        if ((updatedUser.role_id === 2 || updatedUser.role_id === 3) && updatedUser.is_active === false) {
          setLoading(false);
          router.push("/account-deactivated");
          return;
        }
      }

      if(userObj?.role_id === 3&&response.status ==200  ){
        if(hasService){
          return router.push("/dashboard");
        }
        else{
          return router.push("/service-templates");
        }
      }

      if (userObj?.role_id === 2) {
        const profileResponse = await CommonServices.getCounselorProfile(
          userObj.user_profile_id
        );
        if (profileResponse.status === 200) {
          setLoading(false);
          if (userDetails && userDetails?.counselor_profile_id) {
            return router.push("/dashboard");
          } else {
            return router.push("/onboarding");
          }
        }
      }

      setLoading(false);
      return router.push("/dashboard");
    } catch (error) {
      toast.error(error?.message || "Error while verifying the OTP!");
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
