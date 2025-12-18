import { AddIcon } from "../../../public/assets/icons";
import { isWithin24Hours } from "../../../utils/constants";
import { convertUTCToLocalTime } from "../../../utils/helper";
import CustomButton from "../../CustomButton";

export const getSessionTableColumns = ({
  userObj,
  forms,
  match,
  counselorSplit,
  managerSplit,
  initialData,
  getNotesCount,
  handleViewNotes,
  handleNoteOpen,
  setActiveRow,
  setShowStatusConfirmationModal,
  handleNoShowStatus,
  setShowAdditionalService,
  setEditSessionModal,
  setShowResetConfirmationModal,
  scheduledSession,
  sessionTableData,
  setSessionRange,
  formatDate,
}) => {
  return [
    {
      name: "Service Type",
      selector: (row) => row.service_name,
      selectorId: "service_desc",
    },
    {
      name: "Session Date",
      selector: (row) => {
        // Always prioritize intake_date
        if (row?.intake_date) {
          return convertUTCToLocalTime(
            `${row.intake_date}T${row.req_time || "00:00:00"}`
          ).date;
        }
        
        // Fallback to scheduled_time if intake_date is not available
        if (row?.scheduled_time) {
          const scheduledTimeStr = String(row.scheduled_time);
          if (scheduledTimeStr.includes("T") || scheduledTimeStr.includes(" ")) {
            const normalizedDateTime = scheduledTimeStr.replace(" ", "T");
            return convertUTCToLocalTime(normalizedDateTime).date;
          }
        }
        
        // Last fallback to req_dte_not_formatted
        if (row?.req_dte_not_formatted) {
          return convertUTCToLocalTime(
            `${row.req_dte_not_formatted}T${row.req_time || "00:00:00"}`
          ).date;
        }
        
        return "";
      },
      selectorId: "intake_date",
      maxWidth: "120px",
    },
    {
      name: "Session Time",
      selector: (row) => {
        if (row?.scheduled_time) {
          const scheduledTimeStr = String(row.scheduled_time);
          if (scheduledTimeStr.includes("T") || scheduledTimeStr.includes(" ")) {
            const normalizedDateTime = scheduledTimeStr.replace(" ", "T");
            return convertUTCToLocalTime(normalizedDateTime).time;
          }
          if (row?.intake_date) {
            return convertUTCToLocalTime(
              `${row.intake_date}T${row.scheduled_time}`
            ).time;
          }
        }
        
        if (row?.intake_date && row?.req_time) {
          return convertUTCToLocalTime(
            `${row.intake_date}T${row.req_time}`
          ).time;
        }
        
        if (row?.intake_date) {
          const intakeTime = new Date(row.intake_date).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });
          return intakeTime !== "Invalid Date" ? intakeTime : "N/A";
        }
        
        return "N/A";
      },
      selectorId: "session_time",
      maxWidth: "120px",
    },
    {
      name: "Session Status",
      selector: (row) => row.session_status,
      selectorId: "session_status",
      maxWidth: "120px",
    },
    {
      name: "Actions",
      minWidth: "220px",
      cell: (row, rowIndex) => {
        const sessionStatus = row?.session_status?.toLowerCase();
        const isInactive = sessionStatus === "inactive";
        const showNoShowButtonDisplay =
          initialData &&
          sessionStatus != "show" &&
          sessionStatus != "no-show" &&
          sessionStatus != "discharged" &&
          !isInactive;

        // Don't show action buttons for inactive sessions
        if (isInactive) {
          return <div>—</div>;
        }

        return (
          <div style={{ cursor: "pointer" }}>
            {![3, 4].includes(userObj?.role_id) && showNoShowButtonDisplay && (
              <div
                className="action-buttons-container"
                style={{ display: "flex" }}
              >
                <CustomButton
                  type="button"
                  title="Show"
                  customClass="show-button"
                  onClick={() => {
                    setActiveRow(row);
                    setShowStatusConfirmationModal(true);
                  }}
                />
                <CustomButton
                  type="button"
                  title="No Show"
                  customClass="no-show-button"
                  onClick={() => handleNoShowStatus(row)}
                />
                <CustomButton
                  type="button"
                  title="Edit"
                  customClass="edit-button"
                  onClick={() => {
                    if (row?.is_additional === 1) {
                      setShowAdditionalService(true);
                      setActiveRow(row);
                    } else {
                      setEditSessionModal(true);
                      setActiveRow({ ...row, rowIndex });
                    }
                    const tempData = initialData
                      ? scheduledSession
                      : sessionTableData
                      ? sessionTableData?.filter((data) => {
                          return data?.is_additional === 0;
                        })
                      : [];

                    // Calculate minimum date: either today or previous session date (whichever is later)
                    const today = new Date();
                    const currentSessionDate = new Date(row.intake_date);
                    const previousSessionDate = rowIndex > 0 ? new Date(tempData[rowIndex - 1].intake_date) : null;
                    
                    // Min date should be the later of: today or previous session date
                    let minDate = today;
                    if (previousSessionDate && previousSessionDate > today) {
                      minDate = previousSessionDate;
                    }
                    
                    // Calculate maximum date: next session date (if exists)
                    let maxDate = null;
                    if (rowIndex < tempData.length - 1) {
                      maxDate = new Date(tempData[rowIndex + 1].intake_date);
                    }
                    
                    setSessionRange((prev) => ({
                      ...prev,
                      min: formatDate(minDate),
                      max: maxDate ? formatDate(maxDate) : false,
                    }));
                  }}
                />
              </div>
            )}
            {initialData &&
              [3, 4].includes(userObj?.role_id) &&
              isWithin24Hours(row.intake_date, row.scheduled_time) &&
              !isInactive && (
                <CustomButton
                  type="button"
                  title="Reset"
                  customClass="edit-button"
                  style={{ cursor: showNoShowButtonDisplay && "auto" }}
                  onClick={() => {
                    setActiveRow(row);
                    setShowResetConfirmationModal(true);
                  }}
                  disabled={showNoShowButtonDisplay}
                />
              )}
            {!initialData && !isInactive && (
              <CustomButton
                type="button"
                title="Edit"
                customClass="edit-button"
                onClick={() => {
                  setEditSessionModal(true);
                  setActiveRow({
                    ...row,
                    rowIndex,
                    sessionFormType: initialData
                      ? "UpdateSessionForm"
                      : "CreateSessionForm",
                  });
                  const tempData = initialData
                    ? scheduledSession
                    : sessionTableData
                    ? sessionTableData?.filter((data) => {
                        return data?.is_additional === 0;
                      })
                    : [];

                  // Calculate minimum date: either today or previous session date (whichever is later)
                  const today = new Date();
                  const currentSessionDate = new Date(row.intake_date);
                  const previousSessionDate = rowIndex > 0 ? new Date(tempData[rowIndex - 1].intake_date) : null;
                  
                  // Min date should be the later of: today or previous session date
                  let minDate = today;
                  if (previousSessionDate && previousSessionDate > today) {
                    minDate = previousSessionDate;
                  }
                  
                  // Calculate maximum date: next session date (if exists)
                  let maxDate = null;
                  if (rowIndex < tempData.length - 1) {
                    maxDate = new Date(tempData[rowIndex + 1].intake_date);
                  }
                  
                  setSessionRange((prev) => ({
                    ...prev,
                    min: formatDate(minDate),
                    max: maxDate ? formatDate(maxDate) : false,
                  }));
                }}
              />
            )}
          </div>
        );
      },
    },
    {
      name: "Total Amt.",
      selector: (row) => `$${Number(row.session_price).toFixed(4)}`,
      selectorId: "session_price",
      maxWidth: "100px",
    },
    {
      name: "Tax",
      selector: (row) => `$${Number(row.session_taxes).toFixed(4)}`,
      selectorId: "session_gst",
      maxWidth: "70px",
    },
    {
      name: "Amt. to Counselor",
      selector: (row) => {
        let sharePercentage = match;
        if (match == null) {
          sharePercentage =
            counselorSplit?.find(
              (item) => item?.counselor_info?.email === userObj?.email
            )?.tenant_share_percentage ?? managerSplit?.tenant_share_percentage;
        }
        if (userObj?.role_id === 3) {
          return `$${Number(
            row.session_price *
              (initialData?.fee_split_management?.counselor_share_percentage /
                100) || 0
          ).toFixed(4)}`;
        } else {
          const shareAmount =
            Number(row.session_price || 0) *
              (initialData?.fee_split_management?.counselor_share_percentage /
                100) || 0;
          return `$${shareAmount.toFixed(4)}`;
        }
      },
      selectorId: "session_counselor_amt",
      maxWidth: "130px",
    },
    {
      name: userObj?.role_id === 3 ? "Amt. to Admin" : "Amount to Practice",
      selector: (row) => {
        let sharePercentage = match;
        if (!match || match === undefined) {
          sharePercentage =
            counselorSplit?.find(
              (item) => item?.counselor_info?.email === userObj?.email
            )?.tenant_share_percentage ?? managerSplit?.tenant_share_percentage;
        }

        return userObj?.role_id === 3
          ? `$${Number(row.session_system_amt).toFixed(4)}`
          : `${sharePercentage ?? 0}%`;
      },
      selectorId: "session_system_amt",
      maxWidth: "120px",
    },
    {
      ...(![3, 4].includes(userObj?.role_id) && {
        name: "Notes",
        selector: (row) => row.notes,
        sortable: true,
        cell: (row) => {
          return (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  position: "relative",
                  display: "inline-block",
                  minWidth: "65px",
                }}
              >
                <button
                  type="button"
                  style={{
                    padding: "6px 12px",
                    borderRadius: "16px",
                    backgroundColor: "#f0f0f0",
                    color: "#333",
                    fontSize: "14px",
                    fontWeight: "500",
                    border: "1px solid #ccc",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    position: "relative",
                  }}
                  onClick={() => handleViewNotes(row)}
                >
                  Notes
                </button>
                {getNotesCount(row) > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "-5px",
                      right: "-5px",
                      backgroundColor: "red",
                      color: "white",
                      fontSize: "10px",
                      fontWeight: "bold",
                      borderRadius: "50%",
                      width: "16px",
                      height: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {getNotesCount(row)}
                  </div>
                )}
              </div>
              <CustomButton
                type="button"
                icon={<AddIcon />}
                customClass="add-notes"
                title="Add Notes"
                onClick={() => {
                  handleNoteOpen(row, "add");
                }}
              />
            </div>
          );
        },
        selectorId: "notes",
      }),
    },
    {
      name: "Sent Out Tools",
      cell: (row) => {
        const attachedFormIds = Array.isArray(row?.forms_array)
          ? row?.forms_array
          : [];
        const attachedFormCodes = attachedFormIds
          .map((id) => {
            const form = forms?.find((form) => form.form_id === Number(id));
            return form?.form_cde || null;
          })
          ?.filter((code) => code)
          .join(", ");

        return <span>{attachedFormCodes?.toLowerCase() || "--"}</span>;
      },
    },
  ];
};

