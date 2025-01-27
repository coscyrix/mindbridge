import React, { useEffect, useState } from "react";
import { useForm, Controller, FormProvider } from "react-hook-form";
import moment from "moment";
import CustomInputField from "../../CustomInputField";
import CustomButton from "../../CustomButton";
import { useReferenceContext } from "../../../context/ReferenceContext";
import { api } from "../../../utils/auth";
import { toast } from "react-toastify";
import Spinner from "../../common/Spinner";

const EditSessionScheduleForm = ({
  activeData,
  clientId,
  setScheduledSessions,
  setEditSessionModal,
  sessionRange = { min: false, max: false },
}) => {
  const methods = useForm();
  const {
    handleSubmit,
    formState: { errors },
    reset,
  } = methods;

  const { userObj } = useReferenceContext();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (activeData) {
      const formattedData = {
        ...activeData,
        scheduled_time: moment
          .utc(activeData?.scheduled_time, "HH:mm:ss.SSSZ")
          .format("HH:mm"),
      };
      reset(formattedData);
    }
  }, []);

  const handleDiscard = () => {
    reset();
  };

  const handleUpdateSessionSchedule = async (formData) => {
    try {
      if (
        activeData?.rowIndex === 0 &&
        activeData?.sessionFormType === "CreateSessionForm"
      ) {
        setLoading(true);
        const payloadDate = moment
          .utc(
            `${formData?.intake_date} ${formData?.scheduled_time}`,
            "YYYY-MM-DD HH:mm"
          )
          .format();

        const payload = {
          counselor_id: userObj?.role_id,
          client_id: clientId,
          service_id: Number(formData?.service_id),
          session_format_id: formData?.session_format === "ONLINE" ? 1 : 2,
          intake_dte: payloadDate,
        };

        const response = await api.post("/thrpyReq", payload);

        if (response?.status === 200) {
          const updatedSessions = response?.data?.rec?.[0]?.session_obj;
          if (updatedSessions) {
            setScheduledSessions(updatedSessions);
            toast.success("Session updated successfully!");
          } else {
            console.warn("No session object found in the response.");
            toast.error("No session object found in the response.");
          }
          console.log("Session schedule updated successfully.");
        } else {
          console.error("Unexpected response status:", response.status);
          toast.error("Unexpected response status:");
        }
      } else {
        const sessionTableFormattedTime = moment
          .utc(formData?.scheduled_time, "HH:mm")
          .format("HH:mm:ss.SSSZ");
        setScheduledSessions((prevData) =>
          prevData.map((item, index) =>
            index === activeData?.rowIndex
              ? {
                  ...item,
                  intake_date: formData?.intake_date,
                  scheduled_time: sessionTableFormattedTime,
                }
              : item
          )
        );
      }
      setEditSessionModal(false);
    } catch (error) {
      console.error("Error updating session schedule:", error.message || error);
      toast.error("Error updating session schedule");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleUpdateSessionSchedule)}>
        <CustomInputField
          name="service_name"
          label="Service Name"
          disabled
          style={{
            opacity: 0.5,
            border: "1px solid #dcdcdc",
          }}
        />

        <CustomInputField
          name="intake_date"
          label="Select Date"
          type="date"
          placeholder="MM/DD/YYYY"
          required
          style={{ cursor: "pointer", border: "1px solid #dcdcdc" }}
          {...(sessionRange.min && { min: sessionRange.min })}
          {...(sessionRange.max && { max: sessionRange.max })}
        />
        <CustomInputField
          name="scheduled_time"
          label="Select Time"
          type="time"
          placeholder="HH:mm"
          required
          style={{ cursor: "pointer", border: "1px solid #dcdcdc" }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <CustomButton
            type="button"
            title="Discard"
            onClick={handleDiscard}
            style={{ minWidth: "100px" }}
          />
          <CustomButton
            type="submit"
            title={loading ? <Spinner width="25px" height="25px" /> : "Update"}
            style={{
              backgroundColor: "var(--primary-button-color)",
              minWidth: "100px",
              color: "#fff",
              padding: loading ? "5.75px 12px" : "10.5px 12px",
            }}
          />
        </div>
      </form>
    </FormProvider>
  );
};

export default EditSessionScheduleForm;
