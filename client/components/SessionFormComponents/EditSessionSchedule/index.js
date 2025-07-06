import React, { useEffect, useState } from "react";
import { useForm, Controller, FormProvider } from "react-hook-form";
import moment from "moment";
import CustomInputField from "../../CustomInputField";
import CustomButton from "../../CustomButton";
import { useReferenceContext } from "../../../context/ReferenceContext";
import { api } from "../../../utils/auth";
import { toast } from "react-toastify";
import Spinner from "../../common/Spinner";
import {
  convertLocalToUTCTime,
  convertUTCToLocalTime,
} from "../../../utils/helper";

const EditSessionScheduleForm = ({
  activeData,
  setActiveData,
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

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeData) {
      const formattedData = {
        ...activeData,
        intake_date: moment(
          convertUTCToLocalTime(
            `${activeData.intake_date}T${activeData.scheduled_time}`
          ).date
        ).format("YYYY-MM-DD"),
        scheduled_time: moment(
          convertUTCToLocalTime(
            `${activeData.intake_date}T${activeData.scheduled_time}`
          ).time,
          "hh:mm a"
        ).format("HH:mm"),
      };
      reset(formattedData);
    }
  }, [activeData, reset]);

  const handleDiscard = () => {
    reset();
    setActiveData("");
    setEditSessionModal(false);
  };

  const handleUpdateSessionSchedule = async (formData) => {
    const utcDateTime = convertLocalToUTCTime(
      formData?.intake_date,
      formData?.scheduled_time
    );
    try {
      setLoading(true);
      const intakeDate = moment.utc(utcDateTime).format("YYYY-MM-DD");
      const scheduledTime = moment
        .utc(utcDateTime)
        .format("YYYY-MM-DD HH:mm:ss[Z]");

      const payload = {
        intake_date: intakeDate,
        scheduled_time: scheduledTime,
      };

      const response = await api.put(
        `session/?session_id=${formData?.session_id}`,
        payload
      );

      if (response?.status === 200) {
        const inputTime = moment.utc(utcDateTime).format("HH:mm");
        const inputDate = moment.utc(utcDateTime).format("YYYY-MM-DD");
        const sessionTableFormattedTime = moment(inputTime, "HH:mm").format(
          "HH:mm:ss.SSS[Z]"
        );

        setScheduledSessions((prevData) =>
          prevData.map((item, index) =>
            index === activeData?.rowIndex
              ? {
                  ...item,
                  intake_date: inputDate,
                  scheduled_time: sessionTableFormattedTime,
                }
              : item
          )
        );
        toast?.success("Session updated successfuly!");
      }
    } catch (error) {
      console.error("Error updating session schedule:", error.message || error);
      toast.error("Error updating session schedule");
    } finally {
      setActiveData("");
      setLoading(false);
      setEditSessionModal(false);
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
