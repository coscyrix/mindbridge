import React, { useEffect } from "react";
import { useForm, Controller, FormProvider } from "react-hook-form";
import CustomMultiSelect from "../../CustomMultiSelect";
import CustomInputField from "../../CustomInputField";
import CustomButton from "../../CustomButton";
import { useReferenceContext } from "../../../context/ReferenceContext";
import Spinner from "../../common/Spinner";
import { useAdditionalService } from "../hooks/useAdditionalService";

const AdditionalServicesForm = ({
  initialData,
  setShowAdditionalService,
  requestData,
  setActiveRow,
  fetchClients,
  getAllSessionOfClients,
}) => {
  const { servicesData } = useReferenceContext();
  const methods = useForm();
  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
    reset,
  } = methods;

  const additionalServicesArray = servicesData?.filter(
    (service) => service?.is_additional !== 0
  );

  // Use custom hook for additional service operations
  const { handleAddOrUpdateService, isLoading } = useAdditionalService({
    onSuccess: async () => {
      await fetchClients();
      await getAllSessionOfClients();
      setActiveRow("");
      setShowAdditionalService(false);
    },
  });

  const handleDiscard = () => {
    reset();
    setActiveRow("");
    setShowAdditionalService(false);
  };

  const onSubmit = (formData) => {
    handleAddOrUpdateService(formData, requestData, additionalServicesArray);
  };

const seen = new Set();

const additionalServiceDropdown = additionalServicesArray
  ?.filter((service) => {
    if (seen.has(service?.service_code)) {
      return false;
    } else {
      seen.add(service?.service_code);
      return true;
    }
  })
  .map((service) => ({
    label: service?.service_name,
    value: service?.service_code,
    service_id: service?.service_id,
  }));

  useEffect(() => {
    if (initialData) {
      setValue("services", {
        label: initialData?.service_name,
        value: initialData?.service_code,
      });

      reset({
        ...initialData,
        services: {
          label: initialData?.service_name,
          value: initialData?.service_code,
        },
      });
    }
  }, [initialData, setValue, reset]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ marginBottom: "20px" }}>
          <label htmlFor="services">Select Services</label>
          <Controller
            name="services"
            control={control}
            defaultValue={[]}
            rules={{ required: "Please select at least one service" }}
            render={({ field }) => (
              <CustomMultiSelect
                {...field}
                options={additionalServiceDropdown}
                placeholder="Select services"
                error={errors.services?.message}
                isMulti={false}
                isDisabled={initialData}
              />
            )}
          />
        </div>

        <CustomInputField
          name="intake_date"
          label="Select Date"
          type="date"
          placeholder="MM/DD/YYYY"
          required
        />
        <CustomInputField
          name="scheduled_time"
          label="Select Time"
          type="time"
          placeholder="HH:mm"
          required
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <CustomButton type="button" title="Discard" onClick={handleDiscard} />
          <CustomButton
            type="submit"
            title={
              isLoading ? (
                <Spinner width="25px" height="25px" />
              ) : initialData ? (
                "Update"
              ) : (
                "Submit"
              )
            }
            style={{
              backgroundColor: "var(--primary-button-color)",
              color: "#fff",
              padding: isLoading ? "5.75px 12px" : "10.5px 12px",
            }}
          />
        </div>
      </form>
    </FormProvider>
  );
};

export default AdditionalServicesForm;
