import React from "react";
import Link from "next/link";
import CustomButton from "../../CustomButton";
import { convertUTCToLocalTime } from "../../../utils/helper";

const SessionScheduleHeader = ({
  initialData,
  clientSerialNum,
  userObj,
  loader,
  allSessionsStatusScheduled,
  dischargeOrDelete,
  allSessionsStatusShowNoShow,
  setDeleteConfirmationModal,
}) => {
  return (
    <div>
      <div className="heading-container">
        <h2>{initialData ? "Update" : "Create"} Session Schedule</h2>
        {!initialData && clientSerialNum && (
          <label>
            <strong>Serial Number : </strong>
            {clientSerialNum}
          </label>
        )}
        {initialData && (
          <div className="session-details">
            <label>
              <strong>Serial Number : </strong>
              {initialData?.client_clam_num || "N/A"}
            </label>
            <label>
              <strong>Client Name : </strong>
              <Link href={`/client-session/${initialData?.req_id}`}>
                <span
                  style={{
                    textTransform: "capitalize",
                    color: "var(--link-color)",
                  }}
                >{`${initialData?.client_first_name || "N/A"} ${
                  initialData?.client_last_name || ""
                }`}</span>
              </Link>
            </label>
            <label>
              <strong>Session Format : </strong>
              <span style={{ textTransform: "capitalize" }}>
                {initialData?.session_format_id?.toLowerCase() ||
                  initialData?.session_format?.toLowerCase() ||
                  "N/A"}
              </span>
            </label>

            {([2, 3, 4].includes(userObj?.role_id) ||
              (!loader && !allSessionsStatusScheduled)) && (
              <>
                <label>
                  <strong>Intake Date : </strong>
                  <span>
                    {(() => {
                      const firstSession = initialData?.session_obj?.[0];
                      const dateTime =
                        firstSession?.intake_date &&
                        firstSession?.scheduled_time
                          ? `${firstSession.intake_date}T${firstSession.scheduled_time}`
                          : null;
                      return dateTime
                        ? convertUTCToLocalTime(dateTime).date || "N/A"
                        : "N/A";
                    })()}
                  </span>
                </label>
                <label>
                  <strong>Session Time : </strong>
                  <span>
                    {convertUTCToLocalTime(initialData.req_time).time || "N/A"}
                  </span>
                </label>
              </>
            )}
          </div>
        )}
      </div>
      <p>
        {initialData ? (
          <>
            <span>Update session schedule as per your convenience.</span>
            {(![3, 4].includes(userObj?.role_id) ||
              ([3, 4].includes(userObj?.role_id) &&
                dischargeOrDelete === "Delete")) && (
              <CustomButton
                type="button"
                title={dischargeOrDelete}
                customClass={
                  !allSessionsStatusShowNoShow && dischargeOrDelete != "Delete"
                    ? "discharge-delete-button_disabled"
                    : "discharge-delete-button"
                }
                onClick={() => setDeleteConfirmationModal(true)}
                disabled={
                  !allSessionsStatusShowNoShow && dischargeOrDelete != "Delete"
                }
              />
            )}
          </>
        ) : (
          "Schedule a session for any client."
        )}
      </p>
    </div>
  );
};

export default SessionScheduleHeader;
