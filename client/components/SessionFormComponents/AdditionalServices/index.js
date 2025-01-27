import React, { useEffect, useState } from "react";
import { useForm, Controller, FormProvider } from "react-hook-form";
import CustomMultiSelect from "../../CustomMultiSelect";
import CustomInputField from "../../CustomInputField";
import CustomButton from "../../CustomButton";
import { useReferenceContext } from "../../../context/ReferenceContext";
import { api } from "../../../utils/auth";
import { toast } from "react-toastify";
import Spinner from "../../common/Spinner";

const AdditionalServicesForm = ({
  setAdditionalServices,
  initialData,
  setShowAdditionalService,
  requestData,
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

  const [loading, setLoading] = useState(false);

  const handleDiscard = () => {
    reset();
  };

  const handleAddOrUpdateService = async (formData) => {
    setLoading(true);
    const { services, intake_date, scheduled_time } = formData;
    try {
      const service = additionalServicesArray?.find(
        (item) => item.service_code === services.value
      );

      if (service) {
        const payload = {
          thrpy_req_id: requestData?.req_id,
          service_id: services?.service_id,
          session_format:
            requestData?.session_format_id.toLowerCase() == "online" ? 1 : 2,
          intake_date: intake_date,
        };
        const response = await api.post("/session", payload);
        if (response?.status == 200) {
          setAdditionalServices((prevState) => {
            const existingServiceIndex = prevState?.findIndex(
              (item) => item.service_id === service.service_id
            );

            if (existingServiceIndex !== -1) {
              const updatedServices = [...prevState];
              updatedServices[existingServiceIndex] = {
                ...updatedServices[existingServiceIndex],
                intake_date,
                scheduled_time,
              };
              return updatedServices;
            }
            return [
              ...prevState,
              {
                ...service,
                intake_date,
                scheduled_time,
              },
            ];
          });
          toast.success("Additional service added !");
        }
      } else {
        console.error("Service not found!");
      }
    } catch (error) {
      console.log("Error occurred while adding services: ", error);
      toast.error("Error while adding the service!");
    } finally {
      setShowAdditionalService(false);
      setLoading(false);
    }
  };

  const additionalServicesArray = servicesData?.filter(
    (service) => service?.is_additional !== 0
  );

  const additionalServiceDropdown = additionalServicesArray?.map((service) => {
    return {
      label: service?.service_name,
      value: service?.service_code,
      service_id: service?.service_id,
    };
  });

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
  }, []);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleAddOrUpdateService)}>
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
              loading ? (
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
              padding: loading ? "5.75px 12px" : "10.5px 12px",
            }}
          />
        </div>
      </form>
    </FormProvider>
  );
};

export default AdditionalServicesForm;
