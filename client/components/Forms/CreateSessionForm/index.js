import React, { useEffect, useState } from "react";
import { CreateSessionFormWrapper } from "./style";
import CustomInputField from "../../CustomInputField";
import { useForm, FormProvider, Controller } from "react-hook-form";
import CustomTable from "../../CustomTable";
import CustomButton from "../../CustomButton";
import { toast } from "react-toastify";
import moment from "moment";
import { useReferenceContext } from "../../../context/ReferenceContext";
import { AddIcon, InfoIcon } from "../../../public/assets/icons";
import { api } from "../../../utils/auth";
import CustomModal from "../../CustomModal";
import AdditionalServicesForm from "../../SessionFormComponents/AdditionalServices";
import NoShowReasonForm from "../../SessionFormComponents/NoShowReason";
import EditSessionScheduleForm from "../../SessionFormComponents/EditSessionSchedule";
import ConfirmationModal from "../../ConfirmationModal";
import CommonServices from "../../../services/CommonServices";
import {
  CONDITIONAL_ROW_STYLES,
  isWithin24Hours,
} from "../../../utils/constants";
import NotesModalContent from "../../NotesModalContent";
import AllNotesModalContent from "../../AllNotesModalContent";
import Link from "next/link";
import Spinner from "../../common/Spinner";
import Cookies from "js-cookie";
import CustomMultiSelect from "../../CustomMultiSelect";
import { Tooltip } from "react-tooltip";
import {
  convertLocalToUTCTime,
  convertUTCToLocalTime,
} from "../../../utils/helper";

function CreateSessionForm({
  isOpen,
  initialData,
  setInitialData,
  setIsOpen,
  confirmationModal,
  setConfirmationModal,
  userProfileId,
  fetchCounselorClient,
  fetchSessions,
}) {
  const methods = useForm();
  const { servicesData, userObj } = useReferenceContext();
  const [formButton, setFormButton] = useState("Submit");
  const [editSessionModal, setEditSessionModal] = useState(false);
  const [showAdditionalService, setShowAdditionalService] = useState(false);
  const [activeRow, setActiveRow] = useState();
  const [showGeneratedSession, setShowGeneratedSession] = useState(false);
  const [scheduledSession, setScheduledSession] = useState([]);
  const [thrpyReqId, setThrpyReqId] = useState(null);
  const [sessionStatusModal, setSessionStatusModal] = useState(false);
  const [createSessionPayload, setCreateSessionPayload] = useState(null);
  const [sessionTableData, setSessionTableData] = useState(null);
  const [formButtonLoading, setFormButtonLoading] = useState(false);
  const [clientId, setClientId] = useState(null);
  const [dischargeOrDelete, setDischargeOrDelete] = useState("Delete");
  const [loader, setLoader] = useState(null);
  const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [clients, setClients] = useState();
  const [noteOpenModal, setNoteOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countNotes, setCountNotes] = useState([]);
  const [additionalSessions, setAddittionalSessions] = useState([]);
  // to show verification on Notes Page
  const [showVerification, setShowVerification] = useState(true);
  const [user, setUser] = useState(null);
  const [sessionRange, setSessionRange] = useState({
    min: false,
    max: false,
  });
  // To open notes => to open notes data
  const [noteData, setNoteData] = useState({
    isOpen: false,
    sessionId: null,
    notes: "",
  });
  const [showStatusConfirmationModal, setShowStatusConfirmationModal] =
    useState(false);
  const [showResetConfirmationModal, setShowResetConfirmationModal] =
    useState(false);
  const [clientSerialNum, setClientSerialNum] = useState(null);
  const { forms } = useReferenceContext();

  const clientsDropdown = clients?.map((client) => ({
    label: `${client.user_first_name} ${client.user_last_name}`,
    value: client.user_profile_id,
    serialNumber: client.clam_num || "N/A",
    has_schedule: client.has_schedule,
    user_target_outcome: client.user_target_outcome,
  }));

  const infoTooltipContent =
    methods?.watch("client_first_name")?.user_target_outcome;

  const formatDate = (date) => {
    const formattedDate =
      date.getFullYear() +
      "-" +
      String(date.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(date.getDate()).padStart(2, "0");
    return formattedDate;
  };

  const servicesDropdown = servicesData
    ?.filter((service) => service.is_report == 0)
    .map((service) => ({
      label: service.service_name,
      value: service.service_id,
    }));

  const sessionFormatDropdown = [
    { label: "Online", value: "1" },
    { label: "In Person", value: "2" },
  ];

  // fun to open notes
  const handleNoteOpen = (row) => {
    setNoteData({
      isOpen: true,
      sessionId: row.session_id,
      notes: "",
    });
  };

  // fun to close notes modal
  const handleNoteClose = () => {
    setNoteData({
      isOpen: false,
      sessionId: null,
      notes: "",
    });
  };
  // get all sessions of a particular client
  const getAllSessionOfClients = async () => {
    setLoader("scheduledSessionLoading");
    try {
      const response = await api.get(
        `/thrpyReq/?req_id=${initialData?.req_id}`
      );
      if (response?.status === 200) {
        const scheduledSession = response?.data[0]?.session_obj;
        const result =
          scheduledSession &&
          scheduledSession?.some(
            (session) => session.session_status.toLowerCase() === "show"
          )
            ? "Discharge"
            : "Delete";
        setDischargeOrDelete(result);
        const addittionalSession = scheduledSession?.filter(
          (session) => session?.is_additional === 1
        );
        const updatedSessions = scheduledSession?.filter(
          (session) => session?.is_additional === 0
        );
        setScheduledSession(updatedSessions);
        setAddittionalSessions(addittionalSession);
        // update countNotes state
        const notes = scheduledSession?.map((session) => {
          return {
            session_id: session?.session_id,
            count: session?.session_notes?.length || 0,
          };
        });
        setCountNotes(notes);
      }
    } catch (error) {
      console.log(":: Error in getAllSessionOfClients", error);
    } finally {
      setLoader(null);
    }
  };

  // fun to save Notes
  const handleSaveNotes = async (updatedNotes) => {
    setLoading(true);
    try {
      const payload = {
        session_id: noteData?.sessionId,
        message: updatedNotes,
      };
      const response = await api.post("/notes", payload);
      if (response?.status === 200) {
        setScheduledSession((prev) => {
          return prev?.map((session) => {
            if (session?.session_id === noteData?.sessionId)
              return { ...session, notes: updatedNotes };
            else return session;
          });
        });
        // await getAllSessionOfClients();
        setCountNotes((prev) => {
          return prev?.map((note) => {
            if (note?.session_id === noteData?.sessionId) {
              return { ...note, count: note?.count + 1 };
            } else {
              return note;
            }
          });
        });
        handleNoteClose();
        toast.success("Note created successfully");
      }
    } catch (error) {
      console.log(":: createSessionForm.handleSaveNotes()", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewNotes = (row) => {
    if (!Cookies.get("note_verification_time")) {
      setShowVerification(true);
    } else {
      setShowVerification(false);
    }
    setSelectedSessionId(row?.session_id);
    setNoteOpenModal(true);
  };

  const getNotesCount = (row) => {
    const note = countNotes?.find(
      (note) => note?.session_id === row?.session_id
    )?.count;
    return note;
  };
  const sessionTableColumns = [
    {
      name: "Service Type",
      selector: (row) => row.service_name,
      selectorId: "service_desc",
    },
    {
      name: "Session Date",
      selector: (row) => convertUTCToLocalTime(row.intake_date).date,
      selectorId: "intake_date",
      maxWidth: "120px",
    },
    {
      name: "Session Time",
      selector: (row) => convertUTCToLocalTime(row.scheduled_time).time,
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
        const scheduledTime = moment.utc(
          `${row.intake_date} ${row.scheduled_time}`,
          "YYYY-MM-DD HH:mm:ssZ"
        );
        const sessionStatus = row?.session_status?.toLowerCase();
        {
          /* Display requirements for the action buttons and their data :
          REQ:1=> These buttons are only visible to admin and counselors for changing the status and updating the session time.
          REQ:2=> Once, clicked on any of the status action button, the action button hides if the session status has been set to show or no show
          for the case of counselor whereas in case of admin, the action button changes to reset so that the session status can be set to scheduled again.
          REQ:3=> The action buttons for all the sessions will only be visible till 24 hrs past the session. After 24 hours, they hide for both the
          admin and counselors.
          REQ:4=> The action buttons will not be visible for 'DISCHARGE REPORT'.
          REQ:5=> If the session time is null, the action buttons are not shown.
          
          //Effects of the Action buttons :
          EFFECT:1=> The 'DELETE' button will be converted to 'DISCHARGE' button as soon as one of the sessions has been set to SHOW.
          EFFECT:2=> The 'DISCHARGE' button will only be enabled once the status of all the sessions except 'DISCHARGE REPORT' session status has either 'SHOW'
          or 'NO SHOW' as status.*/
        }
        const showNoShowButtonDisplay =
          initialData &&
          sessionStatus != "show" &&
          sessionStatus != "no-show" &&
          sessionStatus != "discharged";
        return (
          <div style={{ cursor: "pointer" }}>
            {userObj?.role_id !== 4 &&
              showNoShowButtonDisplay &&
              isWithin24Hours(row.intake_date, row.scheduled_time) && (
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

                      if (rowIndex < tempData.length - 1) {
                        let minDate = new Date(row.intake_date);
                        let maxDate = new Date(
                          tempData[rowIndex + 1].intake_date
                        );
                        setSessionRange((prev) => ({
                          ...prev,
                          min: formatDate(minDate),
                          max: formatDate(maxDate),
                        }));
                      } else {
                        setSessionRange((prev) => ({
                          ...prev,
                          min: false,
                          max: false,
                        }));
                      }
                    }}
                  />
                </div>
              )}
            {initialData &&
              userObj?.role_id == 4 &&
              isWithin24Hours(row.intake_date, row.scheduled_time) && (
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
            {!initialData && (
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

                  if (rowIndex < tempData.length - 1) {
                    let minDate = new Date(row.intake_date);
                    let maxDate = new Date(tempData[rowIndex + 1].intake_date);
                    maxDate.setDate(maxDate.getDate() - 1);
                    setSessionRange((prev) => ({
                      ...prev,
                      min: formatDate(minDate),
                      max: formatDate(maxDate),
                    }));
                  }
                }}
              />
            )}
          </div>
        );
      },
    },
    {
      name: "Total Amt.",
      selector: (row) =>
        `$${Number(row.session_price + row.session_gst).toFixed(2)}`,
      selectorId: "session_price",
      maxWidth: "100px",
    },
    {
      name: "Tax",
      selector: (row) => `$${Number(row.session_gst).toFixed(2)}`,
      selectorId: "session_gst",
      maxWidth: "70px",
    },
    {
      name: "Amt. to Counselor",
      selector: (row) => `$${Number(row.session_counselor_amt).toFixed(2)}`,
      selectorId: "session_counselor_amt",
      maxWidth: "130px",
    },
    {
      name: "Amt. to Admin",
      selector: (row) => `$${Number(row.session_system_amt).toFixed(2)}`,
      selectorId: "session_system_amt",
      maxWidth: "120px",
    },
    {
      ...(user?.role_id != 4 && {
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
          .filter((code) => code)
          .join(", ");

        return <span>{attachedFormCodes?.toLowerCase() || "--"}</span>;
      },
    },
  ];

  const fetchClients = async () => {
    try {
      let response;
      if (userObj?.role_id == 2) {
        response = await api.get(
          `/user-profile/?role_id=2&counselor_id=${userObj?.user_profile_id}`
        );
      } else {
        response = await CommonServices.getClients();
      }
      if (response.status === 200) {
        const { data } = response;
        setClients(data?.rec?.filter((users) => users?.role_id === 1));
      }
    } catch (error) {
      console.log("Error fetching clients", error);
    }
  };

  const handleDischargeOrDelete = async (id) => {
    try {
      setLoader("dischargeOrDelete");
      let response;
      if (dischargeOrDelete == "Discharge") {
        response = await api.put(`thrpyReq/?req_id=${id}`, {
          thrpy_status: "DISCHARGED",
        });
        if (response.status === 200) {
          toast.success("Client Discharged!");
        }
      } else {
        response = await api.put(`thrpyReq/?req_id=${id}`, {
          status_yn: "n",
        });
        if (response.status === 200) {
          await fetchCounselorClient();
          toast.success("Client session data deleted!");
        }
      }
    } catch (error) {
      const errorMessage =
        dischargeOrDelete == "Discharge"
          ? "Error updating the client session status"
          : error.message;
      console.error("Error updating the client session status :", error);
      toast.error(error?.message);
    } finally {
      setLoader(null);
      setDeleteConfirmationModal(false);
      setIsOpen(false);
    }
  };

  const handleNoShowStatus = (row) => {
    setSessionStatusModal(true);
    setActiveRow(row);
  };

  const handleShowStatus = async (row) => {
    try {
      setLoader("showStatusLoader");
      const payload = {
        session_status: 2,
      };
      let response;
      if (userObj?.role_id == 4) {
        response = await api.put(
          `/session/?session_id=${row?.session_id}&role_id=4&user_profile_id=${userObj?.user_profile_id}`,
          payload
        );
      } else {
        response = await api.put(
          `/session/?session_id=${row?.session_id}`,
          payload
        );
      }
      if (response?.status === 200) {
        setShowStatusConfirmationModal(false);
        toast.success("Session status updated successfully!");
        await getAllSessionOfClients();
        dischargeOrDelete == "Delete" && setDischargeOrDelete("Discharge");
        setSessionStatusModal(false);
      }
    } catch (error) {
      toast.error(error?.message || "Error while updating the session status!");
    } finally {
      setLoader(null);
      setActiveRow("");
      setShowStatusConfirmationModal(false);
    }
  };

  const handleResetStatus = async (row) => {
    try {
      setLoader("resetStatusLoader");
      const payload = {
        session_status: 1,
      };
      let response;
      if (userObj?.role_id == 4) {
        response = await api.put(
          `/session/?session_id=${row?.session_id}&role_id=4&user_profile_id=${userObj?.user_profile_id}`,
          payload
        );
      } else {
        response = await api.put(
          `/session/?session_id=${row?.session_id}`,
          payload
        );
      }
      if (response?.status === 200) {
        setShowResetConfirmationModal(false);
        toast.success("Session status updated successfully!");
        await getAllSessionOfClients();
      }
    } catch (error) {
      toast.error("Error while updating the session status!");
    } finally {
      setLoader(null);
      setActiveRow("");
      setShowResetConfirmationModal(false);
    }
  };

  const handleAffirmativeAction = async () => {
    try {
      setLoader("discardChanges");
      if (thrpyReqId) {
        const response = await api.put(`/thrpyReq/?req_id=${thrpyReqId}`, {
          status_yn: "n",
        });
        if (response.status === 200) {
          toast.success("Therapy request discarded!");
        }
      }
      setIsOpen(false);
    } catch (error) {
      console.log("Error while discarding therapy request :", error);
      toast.error("Error while discarding therapy request.");
    } finally {
      setSessionTableData([]);
      setConfirmationModal(false);
      setIsOpen(false);
      setThrpyReqId(null);
      setLoader(null);
    }
  };

  const handleGenerateSchedule = async () => {
    const formData = methods.getValues();
    const { client_first_name } = formData;
    const hasOngoingSession =
      (!initialData && client_first_name?.has_schedule) ||
      (initialData && !allSessionsStatusScheduled);

    if (hasOngoingSession) {
      toast.error(
        "Cannot generate new session for the client having an ongoing session!"
      );
      return;
    }
    try {
      setLoader("generateSessionSchedule");
      if (formData) {
        const payloadDate = convertLocalToUTCTime(
          formData?.req_dte,
          formData?.req_time
        );
        const payload = {
          counselor_id: userObj?.user_profile_id,
          client_id: Number(formData?.client_first_name?.value),
          service_id: Number(formData?.service_id?.value),
          session_format_id: Number(formData?.session_format_id?.value),
          intake_dte: payloadDate,
        };

        const response = await api.post("/thrpyReq", payload);
        if (response.status === 200) {
          const { data } = response;
          const { req_dte_not_formatted, ...sessionPayload } = data?.rec[0];
          setCreateSessionPayload(sessionPayload);
          setThrpyReqId(data?.rec[0]?.req_id);
          if (initialData) {
            setScheduledSession(data?.rec[0]?.session_obj);
          } else {
            setSessionTableData(data?.rec[0]?.session_obj);
          }
          setShowGeneratedSession(true);
        }
      }
    } catch (error) {
      console.error("Error generating schedule:", error);
      toast.error(
        error?.message || "Failed to generate schedule. Please try again.",
        {
          position: "top-right",
        }
      );
    } finally {
      setLoader(null);
    }
  };

  const handleGetScheduledSession = async () => {
    try {
      if (initialData) {
        setLoader("scheduledSessionLoading");
        setScheduledSession(
          initialData?.session_obj ? initialData?.session_obj : []
        );
      }
    } catch (error) {
      console.error("Error generating schedule:", error);
      toast.error("Failed to generate schedule. Please try again.", {
        position: "top-right",
      });
    } finally {
      setLoader(null);
    }
  };

  const showStatusModalContent = (
    <div>
      <p>Are you sure you want to mark this client as shown and post fees?</p>
    </div>
  );

  const onSubmit = async (formData) => {
    setIsOpen(false);
  };

  const allSessionsStatusScheduled =
    loader != "scheduledSessionLoading" &&
    scheduledSession?.every(
      (session) => session.session_status.toLowerCase() === "scheduled"
    );

  const allSessionsStatusShowNoShow =
    loader !== "scheduledSessionLoading" &&
    scheduledSession?.every(
      (session) =>
        (session.service_code === "DR"
          ? ["show", "no-show", "discharged"].includes(
              session.session_status.toLowerCase()
            )
          : session.service_code === "DR") ||
        session.session_status.toLowerCase() === "show" ||
        session.session_status.toLowerCase() === "no-show"
    );

  useEffect(() => {
    if (!isOpen) {
      setClientSerialNum(null);
      setTimeout(() => setInitialData(null), 500);
      setScheduledSession([]);
      setAddittionalSessions([]);
      methods.reset();
      return;
    }

    if (initialData) {
      const formattedData = {
        ...initialData,
        req_dte: initialData.req_dte_not_formatted
          ? moment(
              convertUTCToLocalTime(initialData.req_dte_not_formatted).date,
              "DD MMM YYYY"
            ).format("YYYY-MM-DD")
          : "",
        req_time: initialData.req_time
          ? moment(
              convertUTCToLocalTime(initialData.req_time).time,
              "hh:mm a"
            ).format("HH:mm")
          : "",
        session_format_id:
          initialData.session_format_id === "ONLINE"
            ? { label: "Online", value: "1" }
            : { label: "In Person", value: "2" },
        service_id: {
          label: initialData?.service_name,
          value: initialData?.service_id,
        },
        client_first_name: {
          label:
            initialData?.client_first_name +
            " " +
            initialData?.client_last_name,
          value: initialData?.client_id,
          serialNumber: initialData?.client_clam_num || "N/A",
        },
      };
      setClientId(initialData?.client_id);
      methods.reset(formattedData);
      setShowGeneratedSession(true);
      setFormButton("Update");
    } else {
      methods.reset({
        client_first_name: "",
        service_id: "",
        session_format_id: "",
        session_desc: "",
        req_time: "",
        req_dte: "",
      });
      setFormButton("Submit");
      setShowGeneratedSession(false);
    }
    if (userProfileId) {
      methods.setValue("client_first_name", userProfileId);
    }
    handleGetScheduledSession();
    if (initialData?.req_id) {
      getAllSessionOfClients();
    }
  }, [isOpen]);

  useEffect(() => {
    fetchClients();
    const userData = Cookies.get("user");
    setUser(JSON.parse(userData));
  }, []);

  const handleIntakeDate = (e) => {
    methods.setValue("req_dte", e.target.value);
    if (initialData) {
      setScheduledSession([]);
    } else {
      setSessionTableData([]);
    }
  };

  const handleSessionTime = (e) => {
    methods.setValue("req_time", e.target.value);
    if (initialData) {
      setScheduledSession([]);
    } else {
      setSessionTableData([]);
    }
  };

  return (
    <CreateSessionFormWrapper>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <div className="form_fields_wrapper">
            <div className="user-info-selects">
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
                            "N/A"}
                        </span>
                      </label>

                      {(userObj?.role_id === 4 ||
                        (!loader && !allSessionsStatusScheduled)) && (
                        <>
                          <label>
                            <strong>Intake Date : </strong>
                            <span>{initialData?.req_dte || "N/A"}</span>
                          </label>
                          <label>
                            <strong>Session Time : </strong>
                            <span>
                              {moment
                                .utc(initialData?.req_time, "HH:mm:ssZ")
                                .format("hh:mm A") || "N/A"}
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
                      <span>
                        Update session schedule as per your convenience.
                      </span>
                      {(userObj?.role_id !== 4 ||
                        (userObj?.role_id === 4 &&
                          dischargeOrDelete === "Delete")) && (
                        <CustomButton
                          type="button"
                          title={dischargeOrDelete}
                          customClass={
                            !allSessionsStatusShowNoShow &&
                            dischargeOrDelete != "Delete"
                              ? "discharge-delete-button_disabled"
                              : "discharge-delete-button"
                          }
                          onClick={() => setDeleteConfirmationModal(true)}
                          disabled={
                            !allSessionsStatusShowNoShow &&
                            dischargeOrDelete != "Delete"
                          }
                        />
                      )}
                    </>
                  ) : (
                    "Schedule a session for any client."
                  )}
                </p>
              </div>
              {/* Create Session Schedule Name Field  */}
              {!initialData && (
                <div style={{ display: "flex", gap: "20px" }}>
                  <div className="select-wrapper">
                    <label>Client Name*</label>
                    <Controller
                      name="client_first_name"
                      control={methods.control}
                      defaultValue={[]}
                      rules={{ required: "This field is required" }}
                      render={({ field }) => (
                        <CustomMultiSelect
                          {...field}
                          options={clientsDropdown}
                          placeholder="Select a client"
                          isMulti={false}
                          isDisabled={initialData}
                        />
                      )}
                    />
                    {methods.formState.errors.client_first_name && (
                      <p className="custom-error-message">
                        {methods.formState.errors.client_first_name.message}
                      </p>
                    )}
                  </div>

                  {/* Change this field name so that it can value when we edit the sessions */}
                  <div className="select-wrapper">
                    <label style={{ display: "flex", gap: "4px" }}>
                      Service Type*
                      <InfoIcon data-tooltip-id="target-outcome-tooltip" />
                    </label>
                    <Tooltip
                      id="target-outcome-tooltip"
                      place="top"
                      variant="info"
                      content={
                        infoTooltipContent
                          ? infoTooltipContent[0].target_name
                          : `Select client to show the client's program.`
                      }
                    />
                    <Controller
                      name="service_id"
                      control={methods.control}
                      defaultValue=""
                      rules={{ required: "This field is required" }}
                      render={({ field }) => (
                        <CustomMultiSelect
                          {...field}
                          options={servicesDropdown}
                          placeholder="Select a service"
                          isMulti={false}
                          isDisabled={initialData}
                          onChange={(selectedOption) => {
                            setSessionTableData([]);
                            field.onChange(selectedOption);
                          }}
                        />
                      )}
                    />
                    {methods.formState.errors.service_id && (
                      <p className="custom-error-message">
                        {methods.formState.errors.service_id.message}
                      </p>
                    )}
                  </div>

                  {/* Session Format Field */}
                  <div className="select-wrapper">
                    <label>Session Format *</label>
                    <Controller
                      name="session_format_id"
                      control={methods.control}
                      defaultValue=""
                      rules={{ required: "This field is required" }}
                      render={({ field }) => (
                        <CustomMultiSelect
                          {...field}
                          options={sessionFormatDropdown}
                          placeholder="Select a format"
                          isMulti={false}
                          isDisabled={initialData}
                        />
                      )}
                    />
                    {methods.formState.errors.session_format_id && (
                      <p className="custom-error-message">
                        {methods.formState.errors.session_format_id.message}
                      </p>
                    )}
                  </div>
                </div>
              )}
              {/* Create Session Schedule Date and Time Fields */}
              {allSessionsStatusScheduled && userObj?.role_id != 4 && (
                <div className="date-time-wrapper">
                  <CustomInputField
                    name="req_dte"
                    label="Intake Date*"
                    type="date"
                    placeholder="Select Date"
                    customClass="date-input"
                    onChange={(e) => handleIntakeDate(e)}
                  />
                  <CustomInputField
                    name="req_time"
                    label="Session Time*"
                    type="time"
                    placeholder="Select Time"
                    customClass="time-input"
                    onChange={(e) => handleSessionTime(e)}
                  />
                </div>
              )}
              {/* Create Session Schedule ->  Generate Seesion Schedule button  */}
              {user?.role_id != 4 && allSessionsStatusScheduled && (
                <button
                  type="button"
                  onClick={handleGenerateSchedule}
                  className={`generate-session-button ${
                    loader == "generateSessionSchedule" && "disabled"
                  }`}
                  disabled={loader == "generateSessionSchedule"}
                >
                  {loader == "generateSessionSchedule"
                    ? "Generating Session Schedule..."
                    : "Generate Session Schedule"}
                </button>
              )}
              {/* session Table  */}
              {(initialData || sessionTableData) && (
                <CustomTable
                  columns={sessionTableColumns}
                  data={
                    initialData
                      ? scheduledSession
                      : sessionTableData
                      ? sessionTableData?.filter((data) => {
                          return data?.is_additional === 0;
                        })
                      : []
                  }
                  loading={
                    initialData &&
                    (loader == "scheduledSessionLoading" ||
                      loader == "generateSessionSchedule")
                  }
                  loaderBackground="#fff"
                  defaultSortFieldId="schedule_date"
                  selectableRows={false}
                  conditionalRowStyles={
                    CONDITIONAL_ROW_STYLES?.clientSessionSchedule
                  }
                  fixedHeaderScrollHeight="400px"
                />
              )}

              {scheduledSession?.length > 0 && initialData && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ fontWeight: 400, margin: "20px 0px" }}>
                    Additional Service
                  </div>
                  {userObj?.role_id !== 4 && (
                    <div
                      style={{
                        display: "flex",
                        gap: "2px",
                        cursor: "pointer",
                        padding: "20px",
                        color: "var(--link-color)",
                      }}
                      onClick={() => setShowAdditionalService(true)}
                    >
                      <AddIcon color="var(--link-color)" />
                      Add
                    </div>
                  )}
                </div>
              )}

              {initialData && loader !== "scheduledSessionLoading" && (
                <CustomTable
                  columns={sessionTableColumns}
                  data={additionalSessions}
                  defaultSortFieldId="schedule_date"
                  selectableRows={false}
                  conditionalRowStyles={
                    CONDITIONAL_ROW_STYLES?.clientSessionSchedule
                  }
                  fixedHeaderScrollHeight="190px"
                />
              )}
            </div>
            {!initialData && (
              <div className="buttons">
                <button
                  className={
                    formButton == "Submit" ? "create-button" : "update-button"
                  }
                  type="submit"
                  style={{ padding: formButtonLoading ? "5px 10px" : "10px" }}
                  onClick={async () => {
                    methods.reset();
                    setThrpyReqId(null);
                    setSessionTableData([]);
                    setFormButtonLoading(false);
                    setIsOpen(false);
                    if (formButton == "Submit" && fetchSessions)
                      await fetchSessions();
                    if (userProfileId && fetchCounselorClient) {
                      await fetchCounselorClient();
                    }
                  }}
                >
                  {formButtonLoading ? <Spinner /> : formButton}
                </button>
              </div>
            )}
          </div>
        </form>
      </FormProvider>
      <CustomModal
        isOpen={showAdditionalService}
        onRequestClose={() => {
          setActiveRow("");
          setShowAdditionalService(false);
        }}
        title={
          activeRow ? "Update additional service" : "Add additional service"
        }
      >
        <AdditionalServicesForm
          setAdditionalServices={setScheduledSession}
          initialData={activeRow}
          setActiveRow={setActiveRow}
          setShowAdditionalService={setShowAdditionalService}
          requestData={initialData}
          fetchClients={fetchClients}
          getAllSessionOfClients={getAllSessionOfClients}
        />
      </CustomModal>
      <CustomModal
        isOpen={sessionStatusModal}
        onRequestClose={() => setSessionStatusModal(false)}
        title="Reason for not showing up!"
      >
        <NoShowReasonForm
          activeData={activeRow}
          setActiveData={setActiveRow}
          setSessionStatusModal={setSessionStatusModal}
          getAllSessionsOfClient={getAllSessionOfClients}
        />
      </CustomModal>
      <CustomModal
        isOpen={editSessionModal}
        onRequestClose={() => {
          setEditSessionModal(false);
          setActiveRow("");
        }}
        title="Update the session schedule"
      >
        <EditSessionScheduleForm
          activeData={activeRow}
          setActiveData={setActiveRow}
          clientId={clientId}
          setScheduledSessions={
            initialData ? setScheduledSession : setSessionTableData
          }
          setEditSessionModal={setEditSessionModal}
          sessionRange={sessionRange}
        />
      </CustomModal>
      <ConfirmationModal
        isOpen={confirmationModal}
        onClose={() => setConfirmationModal(false)}
        affirmativeAction="Yes"
        discardAction="No"
        content="Are you sure you want to discard the changes?"
        handleAffirmativeAction={handleAffirmativeAction}
        loading={loader == "discardChanges"}
      />
      <ConfirmationModal
        isOpen={deleteConfirmationModal}
        onClose={() => setDeleteConfirmationModal(false)}
        affirmativeAction="Yes"
        discardAction="No"
        content={`Are you sure you want to ${dischargeOrDelete?.toLowerCase()} the client ${
          dischargeOrDelete == "Delete" ? "sessions" : ""
        }?`}
        handleAffirmativeAction={() =>
          handleDischargeOrDelete(initialData?.req_id)
        }
        loading={loader == "dischargeOrDelete"}
      />
      <ConfirmationModal
        isOpen={showStatusConfirmationModal}
        onClose={() => {
          setActiveRow("");
          setShowStatusConfirmationModal(false);
        }}
        affirmativeAction="Yes"
        discardAction="No"
        content={showStatusModalContent}
        handleAffirmativeAction={() => handleShowStatus(activeRow)}
        loading={loader == "showStatusLoader"}
      />
      <ConfirmationModal
        isOpen={showResetConfirmationModal}
        onClose={() => setShowResetConfirmationModal(false)}
        affirmativeAction="Yes"
        discardAction="No"
        content="Are you sure you want to reset this client's status to scheduled?"
        handleAffirmativeAction={() => handleResetStatus(activeRow)}
        loading={loader == "resetStatusLoader"}
      />
      {noteOpenModal && (
        <AllNotesModalContent
          isOpen={noteOpenModal}
          onClose={() => setNoteOpenModal(false)}
          selectedSessionId={selectedSessionId}
          showVerification={showVerification}
          setShowVerification={setShowVerification}
        />
      )}

      <NotesModalContent
        noteData={noteData}
        setNoteData={setNoteData}
        isOpen={noteData.isOpen}
        onClose={handleNoteClose}
        saveNotes={handleSaveNotes}
        initialNotes={noteData.notes}
        loading={loading}
        hidePagination
      />
    </CreateSessionFormWrapper>
  );
}

export default CreateSessionForm;
