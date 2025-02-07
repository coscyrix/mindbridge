import CustomInputField from "../CustomInputField";
import CustomButton from "../CustomButton";
import { InputContainer } from "./style";
import { api } from "../../utils/auth";
import Cookies from "js-cookie";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import Spinner from "../common/Spinner";
const VerifyNotes = ({ setShowVerification }) => {
  const methods = useForm();
  const { setValue } = methods;
  const [loading, setLoading] = useState(false);

  const onSubmit = async (formData) => {
    setLoading(true);
    try {
      const response = await api.post("/auth/sign-in", formData);
      if (response?.status === 200) {
        Cookies.set("note_verification_time", Date.now(), { expires: 1 / 96 });
        setShowVerification(false);
        toast.success(
          "Verification successful! You can now access your notes."
        );
      }
    } catch (error) {
      console.log(":: VerifyNotes.onSubmit()", error);
      toast.error(error?.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setValue("email", Cookies.get("email"));
  }, [setValue]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <InputContainer>
          <CustomInputField name={"email"} label="Enter email" disabled />
          <CustomInputField name={"password"} label="Enter password" />
          <CustomButton
            title={loading ? <Spinner height="20px" width="20px" /> : "Verify"}
            type="submit"
            customClass="verify-mobile-button"
          />
        </InputContainer>
      </form>
    </FormProvider>
  );
};

export default VerifyNotes;
