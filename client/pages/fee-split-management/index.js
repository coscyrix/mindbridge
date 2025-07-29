import React, { useState, useEffect } from "react";
import { Switch, FormControlLabel, Typography, Box } from "@mui/material";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomButton from "../../components/CustomButton";
import CustomInputField from "../../components/CustomInputField";
import { FeeSplitManagementWrapper } from "../../styles/fee-split-management";
import { splitFeeManagementSchema } from "../../utils/validationSchema/validationSchema";
const FeeSplitManagement = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const handleToggle = (event) => {
    const checked = event.target.value;
    setIsEnabled(event.target.checked);
  };
  const onSubmit = (data) => {
    console.log(data);
    // e.preventDefault()
    // try {
    // } catch (error) {}
    return;
  };
  const methods = useForm({
    resolver: zodResolver(splitFeeManagementSchema),
    defaultValues: {
      counselor_share: 0,
      tenant_share: 0,
    },
    mode: "onSubmit",
  });
  const {
    control,
    handleSubmit,
    trigger,
    formState: { errors },
  } = methods;
  return (
    <FeeSplitManagementWrapper>
      <Box className="consent-box">
        <Typography variant="h6" mb={1}>
          Fee Split Management
        </Typography>

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
              <form className="consent-form" onSubmit={handleSubmit(onSubmit)}>
                <div className="form-row">
                  <Controller
                    name="tenant_share"
                    control={control}
                    render={({ field }) => (
                      <CustomInputField
                        label="Tenant share (%)"
                        {...field}
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        error={!!errors?.tenant_share}
                        helperText={errors?.tenant_share?.message}
                      />
                    )}
                  />
                </div>

                <div className="form-row">
                  <Controller
                    name="counselor_share"
                    control={control}
                    render={({ field }) => (
                      <CustomInputField
                        label="Counselor share (%)"
                        {...field}
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        error={!!errors?.counselor_share}
                        helperText={errors?.counselor_share?.message}
                      />
                    )}
                  />
                </div>
                <div className="form-row">
                  <CustomButton
                    className="button-blue"
                    title="Submit"
                    type="submit"
                  />
                </div>
              </form>
            </FormProvider>
          </div>
        )}
      </Box>
    </FeeSplitManagementWrapper>
  );
};
export default FeeSplitManagement;
