import React, { useEffect, useState } from "react";
import { CreateSessionFormWrapper } from "./style";
import CustomSelect from "../../CustomSelect";
import { ArrowIcon, MailIcon } from "../../../public/assets/icons";
import CustomTextArea from "../../CustomTextArea";
import CustomInputField from "../../CustomInputField";
import { useForm, FormProvider, Controller } from "react-hook-form";
import CustomTable from "../../CustomTable";
import CustomButton from "../../CustomButton";
import { toast } from "react-toastify";
import { zodResolver } from "@hookform/resolvers/zod";
import moment from "moment";
import { CreateClientSessionValidationSchema } from "../../../utils/validationSchema/validationSchema";
import { useReferenceContext } from "../../../context/ReferenceContext";
import { EditIcon, AddIcon } from "../../../public/assets/icons";
import { api } from "../../../utils/auth";
import CustomModal from "../../CustomModal";
import Spinner from "../../common/Spinner";
import AdditionalServicesForm from "../../SessionFormComponents/AdditionalServices";
import NoShowReasonForm from "../../SessionFormComponents/NoShowReason";
import EditSessionScheduleForm from "../../SessionFormComponents/EditSessionSchedule";
import ConfirmationModal from "../../ConfirmationModal";
import CommonServices from "../../../services/CommonServices";
import { useRouter } from "next/router";
import { CONDITIONAL_ROW_STYLES } from "../../../utils/constants";
import NotesModalContent from "../../NotesModalContent";
function CreateSessionForm({
  isOpen,
  initialData,
  setInitialData,
  setIsOpen,
  confirmationModal,
  setConfirmationModal,
  userProfileId,
  setSessions,
}) {
  const methods = useForm({
    resolver: zodResolver(CreateClientSessionValidationSchema),
  });

  const { servicesData, userObj } = useReferenceContext();
  const [formButton, setFormButton] = useState("Create");
  const [editSessionModal, setEditSessionModal] = useState(false);
  const [showAdditionalService, setShowAdditionalService] = useState(false);
  const [activeRow, setActiveRow] = useState();
  const [showGeneratedSession, setShowGeneratedSession] = useState(false);
  const [scheduledSession, setScheduledSession] = useState([]);
  const [thrpyReqId, setThrpyReqId] = useState(null);
  const [sessionStatusModal, setSessionStatusModal] = useState(false);
  const [createSessionPayload, setCreateSessionPayload] = useState(null);
  const [sessionTableData, setSessionTableData] = useState([]);
  const [formButtonLoading, setFormButtonLoading] = useState(false);
  const [additionalServices, setAdditionalServices] = useState([]);
  const [clientId, setClientId] = useState(null);
  const [dischargeOrDelete, setDischargeOrDelete] = useState(null);
  const [loader, setLoader] = useState(null);
  const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false);
  const [clients, setClients] = useState();
  const [sessionRange, setSessionRange] = useState({
    min: false,
    max: false,
  });
  // To open notes => to open notes data
  const [noteData, setNoteData] = useState({
    isOpen: false,
    sessionId: null,
    notes: "",
    mode: "add",
  });
  const [showStatusConfirmationModal, setShowStatusConfirmationModal] =
    useState(false);
  const [clientSerialNum, setClientSerialNum] = useState(null);
  const router = useRouter();
  const currentTime = moment();
  const { forms } = useReferenceContext();

  const clientsDropdown = clients?.map((client) => ({
    label: `${client.user_first_name} ${client.user_last_name}`,
    value: client.user_profile_id,
    serialNumber: client.clam_num || "N/A",
  }));

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
  const handleNoteOpen = (row, mode) => {
    setNoteData({
      isOpen: true,
      sessionId: row.session_id,
      notes: row.notes || "",
      mode: mode,
    });
  };

  const handleSendMail = (row) => {
    console.log("::: Show alter Box", { ...row });
    alert(`Sending mail to clientId  ${row.session_id}`);
  };

  // fun to close notes modal
  const handleNoteClose = () => {
    setNoteData({
      isOpen: false,
      sessionId: null,
      notes: "",
    });
  };

  // fun to save Notes
  const handleSaveNotes = async (updatedNotes) => {
    console.log("===== COMING TO HANDLESAVE NOTES", updatedNotes);
    try {
      const payload = {
        session_id: noteData?.sessionId,
        message: updatedNotes,
      };
      const response = await api.post("/notes", payload);
      console.log(":: response in add notes", response);
      if (response?.status === 200) {
        setScheduledSession((prev) => {
          return prev?.map((session) => {
            if (session?.session_id === noteData?.sessionId)
              return { ...session, notes: updatedNotes };
            else return session;
          });
        });
        handleNoteClose();
      }
    } catch (error) {
      console.log(":: createSessionForm.handleSaveNotes()", error);
    }
  };

  // fun to Edit Notes
  const handleEditNote = async (updatedNotes) => {
    console.log("======= COMING TO EDIT NOTES", updatedNotes);
    try {
      // update sechdule Session
      const payload = {
        session_id: noteData?.sessionId,
        message: updatedNotes,
      };
      const response = await api.put("/notes", payload);
      if (response?.status === 200) {
        setScheduledSession((prev) => {
          return prev?.map((session) => {
            if (session?.session_id === noteData?.sessionId)
              return { ...session, notes: updatedNotes };
            else return session;
          });
        });
        console.log("::: response in edit notes", response);
        handleNoteClose();
      }
    } catch (error) {
      console.log("::createSessionFormat().handleEditNote()", error);
    }
  };

  //  update session Table columns
  const sessionTableColumns = [
    {
      name: "Service Type",
      selector: (row) => row.service_name,
      selectorId: "service_desc",
    },
    {
      name: "Session Date",
      selector: (row) => row.intake_date,
      selectorId: "intake_date",
    },

    {
      name: "Session Time",
      selector: (row) =>
        moment.utc(row.scheduled_time, "HH:mm:ss.SSS[Z]").format("hh:mm A"),
      selectorId: "session_time",
    },
    {
      name: "Session Status",
      selector: (row) => row.session_status,
      selectorId: "session_status",
    },
    {
      name: "Attached Forms",
      cell: (row) => {
        console.log(row, "row");
        const attachedFormIds = Array.isArray(row?.forms_array)
          ? row?.forms_array
          : [];
        const attachedFormCodes = attachedFormIds
          .map((id) => {
            const form = forms.find((form) => form.form_id === Number(id));
            return form?.form_cde || null;
          })
          .filter((code) => code)
          .join(", ");

        return (
          <span style={{ textAlign: "center" }}>
            {attachedFormCodes || "--"}
          </span>
        );
      },
      name: "Notes",
      selector: (row) => row.notes,
      sortable: true,
      cell: (row) =>
        !row.notes ? (
          <CustomButton
            type="button"
            icon={<AddIcon />}
            customClass="add-notes"
            title="Add Notes"
            onClick={() => handleNoteOpen(row, "add")}
          />
        ) : (
          <span
            onClick={() => handleNoteOpen(row, "edit")}
            style={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              gap: "4px",
              maxWidth: "150px",
            }}
          >
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flex: 1,
              }}
            >
              {row.notes}
            </span>
            <EditIcon />
          </span>
        ),
      selectorId: "notes",
    },
    // {
    //   name: "Email Send Notification",
    //   selector: (row) => row.emailSendNotification,
    //   sortable: true,
    //   cell: (row) => (
    //     <CustomButton
    //       icon={<MailIcon />}
    //       customClass="send-mail"
    //       title="Send Email"
    //       onClick={() => handleSendMail(row)}
    //     />
    //   ),
    //   selectorId: "emailSendNotification",
    // },
    {
      name: "",
      minWidth: "220px",
      cell: (row, rowIndex) => {
        const scheduledTime = moment.utc(
          `${row.intake_date} ${row.scheduled_time}`,
          "YYYY-MM-DD HH:mm:ssZ"
        );
        const sessionStatus = row?.session_status.toLowerCase();
        const showNoShowButtonDisplay =
          initialData &&
          scheduledTime.isAfter(currentTime) &&
          sessionStatus != "show" &&
          sessionStatus != "no-show";
        return (
          <div style={{ cursor: "pointer" }}>
            {showNoShowButtonDisplay && (
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
                    setEditSessionModal(true);
                    setActiveRow({ ...row, rowIndex });
                    const tempData = initialData
                      ? scheduledSession
                      : sessionTableData?.filter((data) => {
                          return data?.is_additional === 0;
                        });

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
                        min: false,
                        max: false,
                      }));
                    }
                  }}
                />
              </div>
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
                    : sessionTableData?.filter((data) => {
                        return data?.is_additional === 0;
                      });

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
  ];

  // const AdditionalServicesColumns = [
  //   {
  //     name: "Service Name",
  //     selector: (row) => row.service_name,
  //     sortable: true,
  //   },
  //   {
  //     name: "Session Date",
  //     selector: (row) => row.intake_date,
  //     sortable: true,
  //   },
  //   {
  //     name: "Session Time",
  //     selector: (row) => moment(row.scheduled_time, "HH:mm").format("hh:mm A"),
  //     sortable: true,
  //   },
  //   {
  //     name: "",
  //     minWidth: "220px",
  //     cell: (row) => (
  //       <div
  //         style={{ cursor: "pointer" }}
  //         onClick={() => {
  //           setShowAdditionalService(true);
  //           setActiveRow(row);
  //         }}
  //       >
  //         <EditIcon />
  //       </div>
  //     ),
  //   },
  //   {
  //     name: "",
  //     sortable: true,
  //     cell: () => <div></div>,
  //   },
  // ];

  const fetchClients = async () => {
    try {
      const response = await CommonServices.getClients();
      if (response.status === 200) {
        const { data } = response;
        setClients(data?.rec);
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
          toast.success("Client session data deleted!");
        }
      }
    } catch (error) {
      const errorMessage =
        dischargeOrDelete == "Discharge"
          ? "Error updating the client session status"
          : "Error deleting the client session.";
      console.error("Error updating the client session status :", error);
      toast.error(errorMessage);
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
      const updateIndex = scheduledSession?.findIndex(
        (session) => session.session_id == row?.session_id
      );
      const response = await api.put(
        `/session/?session_id=${row?.session_id}`,
        payload
      );
      if (response?.status === 200) {
        toast.success("Session status updated successfully!");
        setScheduledSession((prev) =>
          prev.map((session, index) =>
            index === updateIndex
              ? { ...session, session_status: "SHOW", hide: true }
              : session
          )
        );
        dischargeOrDelete == "Delete" && setDischargeOrDelete("Discharge");
        setSessionStatusModal(false);
      }
    } catch (error) {
      toast.error("Error while updating the session status!");
    } finally {
      console?.log("finally block entrance");
      setLoader(null);
      setShowStatusConfirmationModal(false);
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
    try {
      const formData = methods.getValues();
      setLoader("generateSessionSchedule");

      if (formData) {
        const payloadDate = moment
          .utc(`${formData?.req_dte} ${formData?.req_time}`, "YYYY-MM-DD HH:mm")
          .format();

        const payload = {
          counselor_id: userObj?.role_id,
          client_id: Number(formData?.client_first_name),
          service_id: Number(formData?.service_id),
          session_format_id: Number(formData?.session_format_id),
          intake_dte: payloadDate,
        };

        const response = await api.post("/thrpyReq", payload);
        if (response.status === 200) {
          const { data } = response;
          const { req_dte_not_formatted, ...sessionPayload } = data?.rec[0];
          setCreateSessionPayload(sessionPayload);
          setThrpyReqId(data?.rec[0]?.req_id);
          setSessionTableData(data?.rec[0]?.session_obj);
          setShowGeneratedSession(true);
        }
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

  const onSubmit = async (formData) => {
    console.log(" ---->> onSubmit(formData)", formData);
    try {
      setFormButtonLoading(true);
      let response;
      if (initialData) {
        response = await api.put(`/thrpyReq/?req_id=${initialData?.req_id}`, {
          ...initialData,
          ...formData,
        });
        if (response.status === 200) {
          toast.success("Session Updated Successfully!", {
            position: "top-right",
          });
          setIsOpen(false);
        }
      } else {
        response = await api.put(
          `/thrpyReq/?req_id=${thrpyReqId}`,
          createSessionPayload
        );
        if (response.status === 200) {
          setSessionTableData([]);
          setSessions((prev) => [...prev, createSessionPayload]);
          toast.success("New Session Created Successfully!", {
            position: "top-right",
          });
          methods.reset();
        }
      }
    } catch (error) {
      const errorMessage = initialData
        ? "Failed to update the session. Please try again."
        : "Failed to create a new session. Please try again.";

      console.error(error);
      toast.error(errorMessage, { position: "top-right" });
    } finally {
      setSessionTableData([]);
      setFormButtonLoading(false);
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (!isOpen && router.pathname === "/client-session") {
      setClientSerialNum(null);
      setInitialData(null);
      methods.reset();
      return;
    }

    if (initialData) {
      const sessionObj = initialData?.session_obj;
      const result =
        sessionObj &&
        sessionObj?.some(
          (session) => session.session_status.toLowerCase() === "show"
        )
          ? "Discharge"
          : "Delete";
      setDischargeOrDelete(result);
      const formattedData = {
        ...initialData,
        req_dte: initialData.req_dte
          ? moment(initialData.req_dte, "dddd, MMMM D, YYYY").format(
              "YYYY-MM-DD"
            )
          : "",
        req_time: initialData.req_time
          ? moment(initialData.req_time, "HH:mm:ss.SSS[Z]").format("HH:mm")
          : "",
        session_format_id:
          initialData.session_format_id === "ONLINE" ? "1" : "2",
        client_first_name: initialData?.client_id,
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
      setFormButton("Create");
      setShowGeneratedSession(false);
    }
    if (userProfileId) {
      methods.setValue("client_first_name", userProfileId);
    }
    handleGetScheduledSession();
  }, [isOpen, initialData, clients]);

  useEffect(() => {
    fetchClients();
  }, []);

  console.log("=======>>>>>> sessionTableData", {
    scheduledSession,
    initialData,
  });

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
                      <strong>Serial Number :</strong>
                      {clientSerialNum}
                    </label>
                  )}
                  {initialData && (
                    <div className="session-details">
                      <label>
                        <strong>Serial Number :</strong>{" "}
                        {initialData?.client_clam_num || "N/A"}
                      </label>
                      <label>
                        <strong>Client Name :</strong>{" "}
                        {`${initialData?.client_first_name || "N/A"} ${
                          initialData?.client_last_name || ""
                        }`}
                      </label>
                      <label>
                        <strong>Session Format :</strong>{" "}
                        {initialData?.session_format_id || "N/A"}
                      </label>
                    </div>
                  )}
                </div>
                <p>
                  {initialData ? (
                    <>
                      <span>
                        Update session schedule as per your convenience.
                      </span>
                      <CustomButton
                        type="button"
                        title={dischargeOrDelete}
                        customClass="discharge-delete-button"
                        onClick={() => setDeleteConfirmationModal(true)}
                      />
                    </>
                  ) : (
                    "Schedule a session for any client."
                  )}
                </p>
              </div>
              {/* Client Field */}
              {!initialData && (
                <div style={{ display: "flex", gap: "20px" }}>
                  <div className="select-wrapper">
                    <label>Client Name*</label>
                    <Controller
                      name="client_first_name"
                      control={methods.control}
                      defaultValue=""
                      rules={{ required: "This field is required" }}
                      render={({ field }) => (
                        <CustomSelect
                          {...field}
                          options={clientsDropdown}
                          dropdownIcon={
                            <ArrowIcon style={{ transform: "rotate(90deg)" }} />
                          }
                          isError={!!methods.formState.errors.client_first_name}
                          disable={initialData}
                          onChange={(selectedOption) => {
                            setClientSerialNum(selectedOption?.serialNumber);
                            field.onChange(selectedOption?.value);
                          }}
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
                    <label>Service Type*</label>
                    <Controller
                      name="service_id"
                      control={methods.control}
                      defaultValue=""
                      rules={{ required: "This field is required" }}
                      render={({ field }) => (
                        <CustomSelect
                          {...field}
                          options={servicesDropdown}
                          dropdownIcon={
                            <ArrowIcon style={{ transform: "rotate(90deg)" }} />
                          }
                          isError={!!methods.formState.errors.service_name}
                          disable={initialData}
                          onChange={(selectedOption) => {
                            setSessionTableData([]);
                            field.onChange(selectedOption?.value);
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
                        <CustomSelect
                          {...field}
                          options={sessionFormatDropdown}
                          dropdownIcon={
                            <ArrowIcon style={{ transform: "rotate(90deg)" }} />
                          }
                          isError={!!methods.formState.errors.session_format_id}
                          className={initialData && "disabled"}
                          disable={initialData}
                          onChange={(selectedOption) => {
                            field.onChange(selectedOption?.value);
                          }}
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
              {/* Date and Time Fields */}
              {!initialData && (
                <div className="date-time-wrapper">
                  <CustomInputField
                    name="req_dte"
                    label="Intake Date*"
                    type="date"
                    required
                    placeholder="Select Date"
                    customClass={`date-input ${initialData && "disabled"}`}
                    disabled={initialData}
                  />
                  <CustomInputField
                    name="req_time"
                    label="Session Time*"
                    type="time"
                    required
                    placeholder="Select Time"
                    customClass={`time-input ${initialData && "disabled"}`}
                    disabled={initialData}
                  />
                </div>
              )}
              {!initialData && (
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
              {sessionTableData && (
                <CustomTable
                  columns={sessionTableColumns}
                  data={
                    initialData
                      ? scheduledSession
                      : sessionTableData?.filter((data) => {
                          return data?.is_additional === 0;
                        })
                  }
                  loading={initialData && loader == "scheduledSessionLoading"}
                  loaderBackground="#fff"
                  defaultSortFieldId="schedule_date"
                  selectableRows={false}
                  conditionalRowStyles={
                    CONDITIONAL_ROW_STYLES?.clientSessionSchedule
                  }
                  fixedHeaderScrollHeight="550px"
                />
              )}
            </div>
            {scheduledSession?.length > 0 && initialData && (
              <>
                <div
                  style={{
                    display: "flex",
                    gap: "2px",
                    cursor: "pointer",
                    padding: "20px",
                  }}
                  onClick={() => setShowAdditionalService(true)}
                >
                  <AddIcon />
                  <span>Additional Service</span>
                </div>
                {/* {additionalServices && (
                  <div
                    style={{
                      padding: "20px",
                      paddingTop: "0px",
                    }}
                  >
                    <CustomTable
                      columns={AdditionalServicesColumns}
                      data={additionalServices}
                      selectableRows={false}
                    />
                  </div>
                )} */}
              </>
            )}
            {/* <div className="buttons">
              {formButton === "Update" && (
                <button
                  type="button"
                  className="discard_button"
                  onClick={() => {
                    methods.reset();
                    setIsOpen(false);
                  }}
                >
                  Discard
                </button>
              )}
              <button
                className={
                  formButton == "Create" ? "create-button" : "update-button"
                }
                type="submit"
                style={{ padding: formButtonLoading ? "5px 10px" : "10px" }}
              >
                {formButtonLoading ? <Spinner /> : formButton}
              </button>
            </div> */}
          </div>
        </form>
      </FormProvider>
      <CustomModal
        isOpen={showAdditionalService}
        onRequestClose={() => {
          setShowAdditionalService(false);
          setActiveRow("");
        }}
        title={
          activeRow ? "Update additional service" : "Add additional service"
        }
      >
        <AdditionalServicesForm
          setAdditionalServices={setScheduledSession}
          initialData={activeRow}
          setShowAdditionalService={setShowAdditionalService}
          requestData={initialData}
        />
      </CustomModal>
      <CustomModal
        isOpen={sessionStatusModal}
        onRequestClose={() => setSessionStatusModal(false)}
        title="Reason for not showing up!"
      >
        <NoShowReasonForm
          activeData={activeRow}
          setSessionStatusModal={setSessionStatusModal}
          setScheduledSession={setScheduledSession}
          scheduledSession={scheduledSession}
        />
      </CustomModal>
      <CustomModal
        isOpen={editSessionModal}
        onRequestClose={() => setEditSessionModal(false)}
        title="Update the session schedule"
      >
        <EditSessionScheduleForm
          activeData={activeRow}
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
        onClose={() => setShowStatusConfirmationModal(false)}
        affirmativeAction="Yes"
        discardAction="No"
        content="Are you sure you want to mark this client as shown and post fees?"
        handleAffirmativeAction={() => handleShowStatus(activeRow)}
        loading={loader == "showStatusLoader"}
      />
      <NotesModalContent
        noteData={noteData}
        setNoteData={setNoteData}
        isOpen={noteData.isOpen}
        onClose={handleNoteClose}
        saveNotes={noteData.mode === "edit" ? handleEditNote : handleSaveNotes}
        initialNotes={noteData.notes}
        hidePagination
      />
    </CreateSessionFormWrapper>
  );
}

export default CreateSessionForm;
