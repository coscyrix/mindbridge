import { ConsentManagementWrapper } from "../../styles/consent-management";
import React, { useState, useEffect, useCallback } from "react";
import { Switch, FormControlLabel, Typography, Box } from "@mui/material";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dynamic from "next/dynamic";
import CustomButton from "../../components/CustomButton";
import { getConsentManagementSchema } from "../../utils/validationSchema/validationSchema";
import ApiConfig from "../../config/apiConfig";
import { api } from "../../utils/auth";
import { useReferenceContext } from "../../context/ReferenceContext";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";
import { toast } from "react-toastify";
import Spinner from "../../components/common/Spinner";

const ConsentManagement = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);

  const { userObj } = useReferenceContext();
  const [consentBody, setConsentBody] = useState(null);
  const methods = useForm({
    resolver: zodResolver(getConsentManagementSchema(userData)),
    defaultValues: {
      consent_Editor_Values: "",
    },
    mode: "onSubmit",
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = methods;
  
  useEffect(() => {
    if (userObj) setUserData(userObj);
  }, [userObj]);
  
  const { reset } = methods;
  
  const getConsentBody = useCallback(async () => {
    if (!userObj) return; // Don't fetch if userObj is not available yet
    
    try {
      const roleId = userObj?.role_id;
      const tenant_id = userObj?.tenant_id;
      
      // If roleId == 4 (admin), always fetch system default consent form
      let url = ApiConfig.consentFormSubmittion.consentForm;
      if (roleId === 4) {
        url += `?role_id=4`;
      } else {
        url += `?tenant_id=${tenant_id}`;
      }
      
      const result = await api.get(url);
      if (result.status === 200) {
        setConsentBody(result?.data?.description);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
      console.log(error);
    }
  }, [userObj]);
  
  useEffect(() => {
    getConsentBody();
  }, [getConsentBody]);
  useEffect(() => {
    if (consentBody) {
      reset((prev) => ({
        ...prev,
        consent_Editor_Values: consentBody,
      }));
    }
  }, [consentBody, reset]);
  const handleToggle = (event) => {
    setIsEnabled(event.target.checked);
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const isAdmin = userData?.role_id === 4;
      
      const payload = {
        description: data.consent_Editor_Values,
        ...(isAdmin
          ? { is_default_template: true } // Admins always create default template
          : {
              tenant_id: userData?.tenant?.tenant_generated_id || "",
              ...(!isAdmin && { counselor_id: userData?.counselor_profile_id }),
            }),
      };
      const response = await api.post(
        ApiConfig.consentFormSubmittion.consentForm,
        payload
      );
      if (response.status === 201) {
        toast.success(response?.data?.message);
        // Refetch the consent body to show the updated content
        await getConsentBody();
      }
      setLoading(false);
    } catch (error) {
      toast.error(error?.response?.data?.message);
      console.error("Submission failed:", error);
    }
  };

  return (
    <ConsentManagementWrapper>
      <Box className="consent-box">
        <Typography variant="h6" mb={1}>
          Consent Management & Form Editor
        </Typography>
        <div className="description-text">
          Update your consent details as per your convenience
        </div>

        <div className="toggle-section">
          <FormControlLabel
            control={
              <Switch
                checked={isEnabled}
                onChange={handleToggle}
                color="primary"
              />
            }
            label="Enable Custom Consent Form Editor"
          />
        </div>

        {isEnabled && (
          <div className="form-wrapper">
            <FormProvider {...methods}>
              <form className="consent-form">

                <div className="form-row">
                  <Controller
                    name="consent_Editor_Values"
                    control={control}
                    render={({ field, fieldState }) => (
                      <div style={{ height: "400px", marginBottom: "2rem" }}>
                        <ReactQuill
                          theme="snow"
                          value={field.value}
                          onChange={field.onChange}
                          style={{ height: "350px" }}
                          className={fieldState.invalid ? "quill-error" : ""}
                        />
                        {fieldState.error && (
                          <p
                            className="error-text"
                            style={{ marginTop: "8px" }}
                          >
                            {fieldState.error.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                </div>

                {/* <label className="disclaimer">
                  <input type="checkbox" {...methods.register("agreeTerms")} />{" "}
                  I agree to the terms and conditions and consent to receive
                  services through Mindbridge.
                  {errors.agreeTerms && (
                    <p className="error-text">{errors.agreeTerms.message}</p>
                  )}
                </label> */}

                <div className="form-row">
                  {loading ? (
                    <Spinner color="blue" />
                  ) : (
                    <CustomButton
                      className="button-blue"
                      title="Submit"
                      type="button"
                      onClick={handleSubmit(onSubmit)}
                    />
                  )}
                </div>
              </form>
            </FormProvider>
          </div>
        )}
      </Box>
    </ConsentManagementWrapper>
  );
};

export default ConsentManagement;
