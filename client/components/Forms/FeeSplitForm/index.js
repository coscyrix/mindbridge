import { splitFeeManagementSchema } from "../../../utils/validationSchema/validationSchema";
import CustomButton from "../../CustomButton";
import CustomInputField from "../../CustomInputField";
import { FeeSplitFormWrapper } from "./style";
import React, { useState, useEffect } from "react";
import { Switch, FormControlLabel, Typography, Box } from "@mui/material";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ApiConfig from "../../../config/apiConfig";
import { useReferenceContext } from "../../../context/ReferenceContext";
import { toast } from "react-toastify";
import { api } from "../../../utils/auth";
import Spinner from "../../common/Spinner";

const FeeSplitForm = ({
  share_percentage,
  is_counselor_update,
  fetchAllSplit,
  open,
  setOpen,
}) => {
  const { userObj } = useReferenceContext();
  const [loading, setLoading] = useState(false);
  const methods = useForm({
    resolver: zodResolver(splitFeeManagementSchema),
    defaultValues: {
      counselor_share: share_percentage?.counselor_share_percentage || 0,
      tenant_share: share_percentage?.tenant_share_percentage || 0,
    },
    mode: "onSubmit",
  });
  const {
    control,
    handleSubmit,
    trigger,
    formState: { errors },
  } = methods;
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      let payload = {
        tenant_share_percentage: data?.tenant_share,
        counselor_share_percentage: data?.counselor_share,
        tenant_id: userObj?.tenant?.tenant_id,
        is_fee_split_enabled: true,
        ...(is_counselor_update && {
          counselor_user_id: share_percentage?.counselor_info?.user_id,
        }),
      };
      const response = await api.put(
        ApiConfig.feeSplitManagment.getAllfeesSplit,
        payload
      );
      if (response?.status == 200) {
        toast.success(response?.data?.message);
        fetchAllSplit();
        if (open) {
          setOpen(false);
        }
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
      toast.error(error?.response?.data?.message);
    }
    return;
  };
  return (
    <FeeSplitFormWrapper>
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
                    onChange={(e) => field.onChange(e.target.value)}
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
                    onChange={(e) => field.onChange(e.target.value)}
                    error={!!errors?.counselor_share}
                    helperText={errors?.counselor_share?.message}
                  />
                )}
              />
            </div>
            <span className="note">
              Note: The sum of both input must be equal to 100
            </span>
            {loading ? (
              <Spinner color="blue" />
            ) : (
              <div className="form-row">
                <CustomButton
                  className="button-blue"
                  title="Submit"
                  type="submit"
                />
              </div>
            )}
          </form>
        </FormProvider>
      </div>
    </FeeSplitFormWrapper>
  );
};
export default FeeSplitForm;
