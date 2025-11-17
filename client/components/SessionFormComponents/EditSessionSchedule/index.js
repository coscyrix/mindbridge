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
  existingSessions = [],
}) => {
  const methods = useForm();
  const {
    handleSubmit,
    formState: { errors },
    reset,
  } = methods;

  const [loading, setLoading] = useState(false);

  const getPossibleIdentifiers = (session) => {
    if (!session) return [];
    const directIds = [
      session?.session_id,
      session?.sessionId,
      session?.scheduled_session_id,
      session?.session_obj_id,
      session?.sessionNumber,
      session?.session_number,
      session?.id,
    ]
      .filter((value) => value !== undefined && value !== null)
      .map((value) => String(value));

    const nestedSessionId = session?.session_obj?.session_id;
    if (nestedSessionId !== undefined && nestedSessionId !== null) {
      directIds.push(String(nestedSessionId));
    }

    return directIds;
  };

  const hasSharedIdentifier = (firstSession, secondSession) => {
    const firstIdentifiers = getPossibleIdentifiers(firstSession);
    const secondIdentifiers = getPossibleIdentifiers(secondSession);
    return (
      firstIdentifiers.length > 0 &&
      secondIdentifiers.length > 0 &&
      firstIdentifiers.some((id) => secondIdentifiers.includes(id))
    );
  };

  const getSessionMoment = (session) => {
    if (!session) return null;

    const sessionDate =
      session?.intake_date || session?.req_dte_not_formatted || session?.req_dte;
    const sessionTime =
      session?.scheduled_time || session?.req_time || session?.scheduledTime;

    if (!sessionDate || !sessionTime) return null;

    const ensureTrailingZ = (value) => {
      if (typeof value !== "string") return value;
      if (/Z$/i.test(value) || /[+-]\d{2}:?\d{2}$/.test(value)) {
        return value;
      }
      return `${value}Z`;
    };

    let combinedDateTime = "";

    if (typeof sessionTime === "string") {
      if (sessionTime.includes("T")) {
        combinedDateTime = sessionTime;
      } else if (sessionTime.includes(" ")) {
        combinedDateTime = sessionTime.includes("Z")
          ? sessionTime
          : ensureTrailingZ(sessionTime);
      } else {
        combinedDateTime = `${sessionDate}T${sessionTime}`;
      }
    }

    if (!combinedDateTime) {
      combinedDateTime = `${sessionDate}T${sessionTime}`;
    }

    let parsedMoment = moment.utc(combinedDateTime, moment.ISO_8601, true);

    if (!parsedMoment.isValid()) {
      parsedMoment = moment.utc(`${sessionDate} ${sessionTime}`, [
        "YYYY-MM-DD HH:mm:ss",
        "YYYY-MM-DD HH:mm:ss.SSS",
        "YYYY-MM-DD HH:mm:ss.SSSZ",
        "YYYY-MM-DD HH:mm",
        "YYYY-MM-DDTHH:mm:ss",
        "YYYY-MM-DDTHH:mm:ss.SSS",
        "YYYY-MM-DDTHH:mm:ss[Z]",
        moment.ISO_8601,
      ]);
    }

    return parsedMoment.isValid() ? parsedMoment : null;
  };

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

    const updatedSessionMoment = moment.utc(utcDateTime);
    if (!updatedSessionMoment.isValid()) {
      toast.error("Invalid session date or time selected. Please try again.");
      return;
    }
    const currentSessionMoment = getSessionMoment(activeData);

    const overlapsWithExistingSession = existingSessions?.some((session) => {
      if (!session) return false;

      const sessionMoment = getSessionMoment(session);
      if (!sessionMoment) return false;

      const isSameSession =
        hasSharedIdentifier(session, activeData) ||
        (currentSessionMoment && sessionMoment.isSame(currentSessionMoment));

      if (isSameSession) {
        return false;
      }

      return sessionMoment.isSame(updatedSessionMoment);
    });

    if (overlapsWithExistingSession) {
      toast.error(
        "Selected date and time overlap with an existing session. Please choose a different slot."
      );
      return;
    }

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
