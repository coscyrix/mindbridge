import { ConsentManagementWrapper } from "../../styles/consent-management";
import React, { useState, useEffect } from "react";
import { Switch, FormControlLabel, Typography, Box } from "@mui/material";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dynamic from "next/dynamic";
import CustomButton from "../../components/CustomButton";
import CustomMultiSelect from "../../components/CustomMultiSelect";
import { getConsentManagementSchema } from "../../utils/validationSchema/validationSchema";
import ApiConfig from "../../config/apiConfig";
import { api } from "../../utils/auth";
import { useReferenceContext } from "../../context/ReferenceContext";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";
import { toast } from "react-toastify";

const ConsentManagement = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [userData, setUserData] = useState(null);
  const [counselors, setCounselors] = useState([]);

  const { userObj, allCounselors } = useReferenceContext();

  useEffect(() => {
    if (userObj) setUserData(userObj);
    if (allCounselors) setCounselors(allCounselors);
  }, [userObj, allCounselors]);

  useEffect(() => {
    if (allCounselors && Array.isArray(allCounselors)) {
      const formattedCounselors = allCounselors.map((counselor) => ({
        label: `${counselor.user_first_name} ${counselor.user_last_name}`,
        tenant_id: String(counselor.tenant_id),
        value: String(counselor.user_profile_id),
      }));

      setCounselors(formattedCounselors);
    }
  }, [allCounselors]);
  console.log(allCounselors);
  const methods = useForm({
    resolver: zodResolver(getConsentManagementSchema(userData)),
    defaultValues: {
      agreeTerms: false,
      consent_Editor_Values: "",
      counselorSelect: null,
    },
    mode: "onSubmit",
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = methods;

  const handleToggle = (event) => {
    setIsEnabled(event.target.checked);
  };

  const onSubmit = async (data) => {
    

    console.log(data);
    const isAdmin = userData?.role_id === 4;
    const payload = {
      description: data.consent_Editor_Values,
      tenant_id: isAdmin
        ? data?.counselorSelect?.tenant_id
        : userData?.tenant_id || "",
      ...(!isAdmin && { counselor_id: userData?.counselor_profile_id }),
    };
    try {
      const response = await api.post(
        ApiConfig.consentFormSubmittion.consentForm,
        payload
      );
      if (response.status === 201) {
        toast.success(response?.data?.message);
      }
      console.log("Consent submitted:", response);
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
        {console.log(methods.formState.errors)}
        <div className="description-text">
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry’s standard dummy text ever
          since the 1500s.
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
                {userData?.role_id === 4 ? (
                  <div className="form-row">
                    <Controller
                      name="counselorSelect"
                      control={control}
                      render={({ field, fieldState }) => (
                        <CustomMultiSelect
                          isMulti={false}
                          label="Select Counselor"
                          options={counselors}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Choose Counselor"
                          error={fieldState?.error?.message}
                        />
                      )}
                    />
                  </div>
                ) : (
                  <></>
                )}

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

                <label className="disclaimer">
                  <input type="checkbox" {...methods.register("agreeTerms")} />{" "}
                  I agree to the terms and conditions and consent to receive
                  services through Mindbridge.
                  {errors.agreeTerms && (
                    <p className="error-text">{errors.agreeTerms.message}</p>
                  )}
                </label>

                <div className="form-row">
                  <CustomButton
                    className="button-blue"
                    title="Submit"
                    type="button"
                    onClick={handleSubmit(onSubmit)}
                  />
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
