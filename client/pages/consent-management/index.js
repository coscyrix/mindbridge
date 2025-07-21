import { ConsentManagementWrapper } from "../../styles/consent-management";
import React, { useState, useEffect } from "react";
import { Switch, FormControlLabel, Typography, Box } from "@mui/material";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomButton from "../../components/CustomButton";
import CustomInputField from "../../components/CustomInputField";
import SignatureField from "../../components/SignatureCanvas";
import CustomLoader from "../../components/Loader/CustomLoader";
import CustomMultiSelect from "../../components/CustomMultiSelect";
import { TextField } from "@mui/material";
import { toast } from "react-toastify";
import dynamic from "next/dynamic";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";
import {
  formatReadableDate,
  formatWithTimezone,
  fromNow,
  getCurrentTimestamp,
} from "../../utils/helper";
import { consentManagementSchema } from "../../utils/validationSchema/validationSchema";
import {
  CONSENT_CATEGORY_OPTIONS,
  CONSENT_OPTIONS,
} from "../../utils/constants";
const ConsentManagement = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const handleToggle = (event) => {
    const checked = event.target.value;
    setIsEnabled(event.target.checked);
    if (checked) {
      const timestamp = getCurrentTimestamp();
      methods.setValue("timestamp", timestamp);
    } else {
      methods.setValue("timestamp", "");
    }
  };

  const methods = useForm({
    resolver: zodResolver(consentManagementSchema),
    defaultValues: {
      category: [],
      consentText: [],
      signature: "",
      agreeTerms: false,
      consent_Editor_Values: "",
    },
    mode: "onSubmit",
  });
  const {
    control,
    handleSubmit,
    trigger,
    formState: { errors },
  } = methods;
  const onSubmit = (data) => {
    console.log(data);
    // e.preventDefault()
    // try {
    // } catch (error) {}
    return;
  };
  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then((res) => res.json())
      .then((data) => methods.setValue("ipAddress", data.ip))
      .catch(() => methods.setValue("ipAddress", "0.0.0.0"));
  }, []);

  return (
    <ConsentManagementWrapper>
      <Box className="consent-box">
        <Typography variant="h6" mb={1}>
          Consent Management & Form Editor
        </Typography>

        <div className="description-text">
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry s standard dummy text ever
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
                          style={{ height: "350px", marginBottom: "2rem" }}
                          className={fieldState.invalid ? "quill-error" : ""}
                        />
                        {fieldState.error && (
                          <p
                            className="error-text"
                            style={{ marginTop: "45px" }}
                          >
                            {fieldState.error.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                </div>
                <div className="form-row">
                  <SignatureField
                    name="signature"
                    label="Full Name"
                    control={methods.control}
                    errors={methods.formState.errors}
                  />
                </div>
                <div className="time-ip-parent">
                  <div className="form-row">
                    <Controller
                      name="timestamp"
                      control={methods.control}
                      render={({ field }) => (
                        <CustomInputField
                          name="Timestamps"
                          label="Signed At:"
                          value={field.value}
                          className="timestamp-field"
                        />
                      )}
                    />
                  </div>

                  <div className="form-row">
                    <Controller
                      name="ipAddress"
                      control={methods.control}
                      render={({ field }) => (
                        <CustomInputField
                          label="IP Address:"
                          {...field}
                          disabled
                          error={methods.formState.errors?.ipAddress?.message}
                          helperText={
                            methods.formState.errors?.ipAddress?.message
                          }
                          margin="normal"
                          className="ip-field"
                        />
                      )}
                    />
                  </div>
                  <div className="form-row">
                    <Controller
                      control={methods.control}
                      name="consentText"
                      render={({ field, fieldState }) => (
                        <CustomMultiSelect
                          className={`consent-text-select ${
                            fieldState.error ? "error" : ""
                          }`}
                          label="Consent Text:"
                          options={CONSENT_OPTIONS}
                          placeholder="Select Consent"
                          value={field.value}
                          onChange={field.onChange}
                          error={
                            methods.formState?.errors?.consentText?.message
                          }
                        />
                      )}
                    />
                    {console.log(methods.formState?.errors, "errors")}
                  </div>
                  <div className="form-row">
                    <Controller
                      control={methods.control}
                      name="category"
                      render={({ field, fieldState }) => (
                        <CustomMultiSelect
                          className={`category-select ${
                            fieldState.error ? "error" : ""
                          }`}
                          label="Consent Category:"
                          options={CONSENT_CATEGORY_OPTIONS}
                          placeholder="Select Category"
                          value={field.value}
                          onChange={field.onChange}
                          error={methods.formState?.errors?.category?.message}
                        />
                      )}
                    />
                  </div>
                </div>
                {/* {console.log(methods.getValues())} */}
                <label className="disclaimer">
                  <input type="checkbox" {...methods.register("agreeTerms")} />I
                  agree to the terms and condition outlined above and consent to
                  receive services through Mindbridge
                  {methods.formState.errors?.agreeTerms && (
                    <p className="error-text">
                      {methods.formState.errors?.agreeTerms?.message}
                    </p>
                  )}
                </label>
                <div className="form-row">
                  <CustomButton
                    className="button-blue"
                    title="Submit"
                    type="button"
                    onClick={methods.handleSubmit(onSubmit)}
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
