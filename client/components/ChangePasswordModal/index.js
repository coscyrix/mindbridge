import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { useForm, FormProvider } from "react-hook-form";
import CustomInputField from "../CustomInputField";
import CustomButton from "../CustomButton";
import { api } from "../../utils/auth";
import { toast } from "react-toastify";
import CircularProgress from "@mui/material/CircularProgress";
import { ClosedEyeIcon, OpenEyeIcon } from "../../public/assets/icons";

const ChangePasswordModal = ({ open, onClose }) => {
  const methods = useForm();
  const { reset } = methods;

  const [isLoading, setIsLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleShowPassword = () => {
    setShowOldPassword(!showOldPassword);
  };

  const handleNewPassword = () => {
    setShowNewPassword(!showOldPassword);
  };

  const onSubmit = async (values) => {
    try {
      setIsLoading(true);
      const { data, status } = await api.post("/auth/change-password", values);
      if (data && status === 200) {
        toast.success(data?.message);
        onClose();
        reset();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      sx={{
        "& .MuiPaper-root": {
          borderRadius: "14px",
        },
      }}
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ borderBottom: "1px solid #b9b7b7" }}>
        Change Password
      </DialogTitle>
      <DialogContent sx={{ mt: 3 }}>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <CustomInputField label="Email Address" name="email" type="email" />
            <CustomInputField
              label="Old Password"
              name="old_password"
              type={showOldPassword ? "text" : "password"}
              icon={showOldPassword ? <OpenEyeIcon /> : <ClosedEyeIcon />}
              handleShowPassword={handleShowPassword}
            />
            <CustomInputField
              label="New Password"
              name="new_password"
              type={showNewPassword ? "text" : "password"}
              icon={showNewPassword ? <OpenEyeIcon /> : <ClosedEyeIcon />}
              handleShowPassword={handleNewPassword}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "10px",
              }}
            >
              <CustomButton
                title="Cancel"
                type="button"
                onClick={onClose}
                style={{
                  color: "black",
                  width: "100%",
                  height: "44px",
                  fontSize: "16px",
                }}
              />
              <CustomButton
                className="button"
                title={
                  isLoading ? (
                    <CircularProgress size={"20px"} color="white" />
                  ) : (
                    "Change Password"
                  )
                }
                type="submit"
                style={{
                  background: "#2b5efc",
                  color: "white",
                  width: "100%",
                  height: "44px",
                  fontSize: "16px",
                }}
              />
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordModal;
