import moment from "moment";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useReferenceContext } from "../../../context/ReferenceContext";
import { AddIcon, SettingsIcon } from "../../../public/assets/icons";
import {
  CONDITIONAL_ROW_STYLES,
} from "../../../utils/constants";
import {
  convertUTCToLocalTime
} from "../../../utils/helper";
import Spinner from "../../common/Spinner";
import CustomButton from "../../CustomButton";
import CustomTable from "../../CustomTable";
import CustomModal from "../../CustomModal";
import Select from "react-select";
import {
  CreateSessionFormWrapper,
  HomeworkButtonWrapper,
  AssessmentButtonWrapper,
  AssessmentModalWrapper,
} from "./style";
import { selectStyles } from "../../HomeworkModalContent/selectStyles";

// Custom Hooks
import { useSessionActions } from "./hooks/useSessionActions";
import { useSessionData } from "./hooks/useSessionData";
import { useSessionNotes } from "./hooks/useSessionNotes";

// Components
import SessionFormFields from "./SessionFormFields";
import SessionModals from "./SessionModals";
import SessionScheduleHeader from "./SessionScheduleHeader";
import { getSessionTableColumns } from "./SessionTableColumns";
import CommonServices from "../../../services/CommonServices";
import { useQueryData } from "../../../utils/hooks/useQueryData";
import { useMutationData } from "../../../utils/hooks/useMutationData";
import { toast } from "react-toastify";

function CreateSessionForm({
  time,
  fetchHomeWorkUploadStatus,
  isOpen,
  initialData,
  setInitialData,
  setIsOpen,
  confirmationModal,
  setConfirmationModal,
  userProfileId,
  fetchCounselorClient,
  fetchSessions,
  session,
  isHomeworkUpload,
  setHomeWorkUpload,
  counselorConfiguration,
  managerSplitDetails,
  counselor_id,
}) {
  const methods = useForm();
  const { userObj, forms } = useReferenceContext();
  const router = useRouter();
  
  // State
  const [formButton, setFormButton] = useState("Submit");
  const [editSessionModal, setEditSessionModal] = useState(false);
  const [showAdditionalService, setShowAdditionalService] = useState(false);
  const [activeRow, setActiveRow] = useState();
  const [sessionStatusModal, setSessionStatusModal] = useState(false);
  const [formButtonLoading, setFormButtonLoading] = useState(false);
  const [clientId, setClientId] = useState(null);
  const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false);
  const [isDiscard, setIsDiscard] = useState(false);
  const [isValueChanged, setIsValueChanged] = useState("yes");
  const [pendingValueChange, setPendingValueChange] = useState(null);
  const [showStatusConfirmationModal, setShowStatusConfirmationModal] = useState(false);
  const [showResetConfirmationModal, setShowResetConfirmationModal] = useState(false);
  const [clientSerialNum, setClientSerialNum] = useState(null);
  const [user, setUser] = useState(null);
  const [sessionRange, setSessionRange] = useState({
    min: false,
    max: false,
  });
  const [isWorkModalOpen, setIsWorkModalOpen] = useState(false);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [assessmentOptions, setAssessmentOptions] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState(null);

  // Custom Hooks
  const {
    servicesData,
    clients,
    scheduledSession,
    setScheduledSession,
    additionalSessions,
    setAddittionalSessions,
    sessionTableData,
    setSessionTableData,
    countNotes,
    setCountNotes,
    feeSplitDetails,
    counselorSplit,
    managerSplit,
    dischargeOrDelete,
    setDischargeOrDelete,
    fetchClients,
    fetchAllSplit,
    getAllSessionOfClients,
  } = useSessionData(userObj, initialData, isOpen);

  const {
    loader,
    setLoader,
    thrpyReqId,
    setThrpyReqId,
    showGeneratedSession,
    setShowGeneratedSession,
    handleGenerateSchedule,
    handleDischargeOrDelete,
    handleShowStatus,
    handleResetStatus,
    handleAffirmativeAction,
  } = useSessionActions(
    userObj,
    initialData,
    methods,
    getAllSessionOfClients,
    setIsOpen,
    fetchCounselorClient,
    setDischargeOrDelete,
    dischargeOrDelete
  );

  const {
    noteData,
    setNoteData,
    noteOpenModal,
    setNoteOpenModal,
    selectedSessionId,
    showVerification,
    setShowVerification,
    loading,
    handleNoteOpen,
    handleNoteClose,
    handleSaveNotes,
    handleViewNotes,
    getNotesCount,
  } = useSessionNotes(userObj);

  // Computed Values
  let match =
    counselorConfiguration?.find(
      (item) => item?.counselor_info?.user_id == counselor_id
    )?.tenant_share_percentage ?? managerSplitDetails?.tenant_share_percentage;

  const clientsDropdown = clients
    ?.filter((client) => !client?.has_schedule)
    .map((client) => ({
      label: `${client.user_first_name} ${client.user_last_name}`,
      value: client.user_profile_id,
      serialNumber: client.clam_num || "N/A",
      has_schedule: client.has_schedule,
      user_target_outcome: client.user_target_outcome,
    }));

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

  const infoTooltipContent =
    methods?.watch("client_first_name")?.user_target_outcome;

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

  const counselor = userObj?.role_id == 2;
  const manager = userObj?.role_id == 3;

  const combinedSessions = initialData
    ? [...(scheduledSession ?? []), ...(additionalSessions ?? [])]
    : sessionTableData ?? [];

  const existingSessionsForEdit = (combinedSessions || []).filter(Boolean);

  // Helper Functions
  const formatDate = (date) => {
    const formattedDate =
      date.getFullYear() +
      "-" +
      String(date.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(date.getDate()).padStart(2, "0");
    return formattedDate;
  };

  const handleNoShowStatus = (row) => {
    setSessionStatusModal(true);
    setActiveRow(row);
  };

  const handleSessionFormatChangeWithConfirmation = (
    value,
    field,
    fieldName
  ) => {
    setShowGeneratedSession(false);
    if (sessionTableData?.length > 0) {
      setPendingValueChange({
        fieldName: fieldName,
        value: value,
      });
      setConfirmationModal(true);
    } else {
      field.onChange(value);
    }
  };

  const handleGetScheduledSession = async () => {
    try {
      if (initialData) {
        setLoader("scheduledSessionLoading");
        const list = initialData?.session_obj || [];
        setScheduledSession(list?.filter((s) => s?.is_additional === 0));
        setAddittionalSessions(list?.filter((s) => s?.is_additional === 1));
      }
    } catch (error) {
      console.error("Error generating schedule:", error);
    } finally {
      setLoader(null);
    }
  };

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

  const onSubmit = async (formData) => {
    setIsOpen(false);
  };

  // Fetch all assessment form names using custom React Query hook (excluding CONSENT)
  const { data: assessmentFormNames } = useQueryData(
    ["assessment-form-names"],
    async () => {
      const response = await CommonServices.getAllAssessmentFormNames();
      const forms = response?.data?.rec || [];
      return forms.filter((name) => name !== "CONSENT");
    }
  );

  useEffect(() => {
    if (assessmentFormNames && Array.isArray(assessmentFormNames)) {
      const options = assessmentFormNames.map((name) => ({
        label: name,
        value: name,
      }));
      setAssessmentOptions(options);
    }
  }, [assessmentFormNames]);

  const handleOpenAssessmentModal = () => {
    setSelectedAssessment(null);
    setIsAssessmentModalOpen(true);
  };

  const { mutate: sendManualAssessment, isPending: isSendingAssessment } =
    useMutationData(
      ["send-manual-assessment"],
      async (payload) => {
        return await CommonServices.sendManualAssessment(payload);
      },
      undefined,
      () => {
        // On success: close modal and reset selection
        toast.success("Assessment sent successfully");
        setIsAssessmentModalOpen(false);
        setSelectedAssessment(null);
      }
    );

  // Table Columns
  const sessionTableColumns = getSessionTableColumns({
    userObj,
    forms,
    match,
    counselorSplit,
    managerSplit,
    initialData,
    getNotesCount: (row) => getNotesCount(countNotes, row),
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
  });

  // Effects
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
              convertUTCToLocalTime(
                `${initialData.req_dte_not_formatted}T${initialData.req_time}`
              ).date,
              "DD MMM YYYY"
            ).format("YYYY-MM-DD")
          : "",
        req_time: initialData.req_time
          ? moment(
              convertUTCToLocalTime(
                `${initialData.req_dte_not_formatted}T${initialData.req_time}`
              ).time,
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
    if (initialData?.req_id && router.pathname != "/client-management") {
      getAllSessionOfClients();
    }
  }, [isOpen]);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    setUser(JSON.parse(userData));
  }, []);

  useEffect(() => {
    if (
      Array.isArray(scheduledSession) &&
      scheduledSession.some((s) => s?.is_additional === 1)
    ) {
      setAddittionalSessions(
        scheduledSession?.filter((s) => s?.is_additional === 1)
      );
    }
  }, [scheduledSession]);

  return (
    <CreateSessionFormWrapper>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <div className="form_fields_wrapper"> 
            <div className="user-info-selects">
              <SessionScheduleHeader
                initialData={initialData}
                clientSerialNum={clientSerialNum}
                userObj={userObj}
                loader={loader}
                allSessionsStatusScheduled={allSessionsStatusScheduled}
                dischargeOrDelete={dischargeOrDelete}
                allSessionsStatusShowNoShow={allSessionsStatusShowNoShow}
                setDeleteConfirmationModal={setDeleteConfirmationModal}
              />

              <SessionFormFields
                initialData={initialData}
                methods={methods}
                clientsDropdown={clientsDropdown}
                servicesDropdown={servicesDropdown}
                servicesData={servicesData}
                sessionFormatDropdown={sessionFormatDropdown}
                handleSessionFormatChangeWithConfirmation={
                  handleSessionFormatChangeWithConfirmation
                }
                handleIntakeDate={handleIntakeDate}
                handleSessionTime={handleSessionTime}
                allSessionsStatusScheduled={allSessionsStatusScheduled}
                userObj={userObj}
                infoTooltipContent={infoTooltipContent}
              />

              {![3, 4].includes(userObj?.role_id) &&
                allSessionsStatusScheduled &&
                !showGeneratedSession && (
                  <button
                    type="button"
                    onClick={() =>
                      handleGenerateSchedule(
                        allSessionsStatusScheduled,
                        setSessionTableData,
                        setScheduledSession,
                        fetchAllSplit
                      )
                    }
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
<div className="button-group">


              {isHomeworkUpload && initialData && counselor && (
                <AssessmentButtonWrapper>
                  <CustomButton
                    onClick={handleOpenAssessmentModal}
                    icon={<SettingsIcon />}
                    title="Manual Assessment Upload"
                    type="button"
                    />
                </AssessmentButtonWrapper>
              )}

              {isHomeworkUpload && initialData && counselor && (
                <HomeworkButtonWrapper>
                  <CustomButton
                    onClick={() => setIsWorkModalOpen(true)}
                    icon={<SettingsIcon />}
                    title="Upload and Send Homework"
                    type="button"
                    />
                </HomeworkButtonWrapper>
              )}
              </div>

              {(initialData || sessionTableData) && (
                <CustomTable
                  columns={sessionTableColumns}
                  data={
                    initialData
                      ? scheduledSession?.filter((data) => {
                          return data?.is_additional === 0;
                        })
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
                  {![3, 4].includes(userObj?.role_id) && (
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

      {isAssessmentModalOpen && (
        <CustomModal
          isOpen={isAssessmentModalOpen}
          onRequestClose={() => setIsAssessmentModalOpen(false)}
          title="Manual Assessment Upload"
        >
          <AssessmentModalWrapper>
            <div className="select-wrapper">
              <label>Assessment</label>
              <Select
                options={assessmentOptions}
                placeholder="Select Assessment"
                value={assessmentOptions.find(
                  (opt) => opt.value === selectedAssessment
                ) || null}
                onChange={(option) =>
                  setSelectedAssessment(option ? option.value : null)
                }
                styles={selectStyles}
                menuPortalTarget={
                  typeof document !== "undefined" ? document.body : undefined
                }
                menuPosition="fixed"
              />
            </div>

            <div className="button-group">
              <CustomButton
                type="button"
                title="Cancel"
                onClick={() => setIsAssessmentModalOpen(false)}
              />
              <button
                className="save-button"
                type="button"
                disabled={!selectedAssessment || isSendingAssessment}
                style={{
                  opacity: !selectedAssessment || isSendingAssessment ? 0.6 : 1,
                  cursor:
                    !selectedAssessment || isSendingAssessment
                      ? "not-allowed"
                      : "pointer",
                }}
                onClick={() => {
                  if (!selectedAssessment) return;

                  const payload = {
                    req_id: initialData?.req_id,
                    session_id: session?.session_obj?.[0]?.session_id,
                    client_id: initialData?.client_id,
                    counselor_id: initialData?.counselor_id,
                    treatment_target:
                      initialData?.user_target_outcome ||
                      initialData?.treatment_target,
                    form_names: [selectedAssessment],
                  };

                  sendManualAssessment(payload);
                }}
              >
                {isSendingAssessment ? "Sending..." : "Send Assessment"}
              </button>
            </div>
          </AssessmentModalWrapper>
        </CustomModal>
      )}

      <SessionModals
        showAdditionalService={showAdditionalService}
        setShowAdditionalService={setShowAdditionalService}
        activeRow={activeRow}
        setActiveRow={setActiveRow}
        setScheduledSession={setScheduledSession}
        initialData={initialData}
        fetchClients={fetchClients}
        getAllSessionOfClients={getAllSessionOfClients}
        sessionStatusModal={sessionStatusModal}
        setSessionStatusModal={setSessionStatusModal}
        editSessionModal={editSessionModal}
        setEditSessionModal={setEditSessionModal}
        clientId={clientId}
        setSessionTableData={setSessionTableData}
        sessionRange={sessionRange}
        existingSessions={existingSessionsForEdit}
        confirmationModal={confirmationModal}
        setConfirmationModal={setConfirmationModal}
        handleAffirmativeAction={() =>
          handleAffirmativeAction(
            true,
            setConfirmationModal,
            setSessionTableData,
            setIsDiscard,
            pendingValueChange,
            setPendingValueChange
          )
        }
        loader={loader}
        deleteConfirmationModal={deleteConfirmationModal}
        setDeleteConfirmationModal={setDeleteConfirmationModal}
        dischargeOrDelete={dischargeOrDelete}
        handleDischargeOrDelete={() =>
          handleDischargeOrDelete(initialData?.req_id, userProfileId)
        }
        showStatusConfirmationModal={showStatusConfirmationModal}
        setShowStatusConfirmationModal={setShowStatusConfirmationModal}
        handleShowStatus={() =>
          handleShowStatus(activeRow, setShowStatusConfirmationModal)
        }
        showResetConfirmationModal={showResetConfirmationModal}
        setShowResetConfirmationModal={setShowResetConfirmationModal}
        handleResetStatus={() =>
          handleResetStatus(activeRow, setShowResetConfirmationModal)
        }
        noteOpenModal={noteOpenModal}
        setNoteOpenModal={setNoteOpenModal}
        selectedSessionId={selectedSessionId}
        showVerification={showVerification}
        setShowVerification={setShowVerification}
        noteData={noteData}
        setNoteData={setNoteData}
        handleNoteClose={handleNoteClose}
        handleSaveNotes={(updatedNotes) =>
          handleSaveNotes(updatedNotes, setScheduledSession, setCountNotes)
        }
        loading={loading}
        isWorkModalOpen={isWorkModalOpen}
        setIsWorkModalOpen={setIsWorkModalOpen}
        session={session}
      />
    </CreateSessionFormWrapper>
  );
}

export default CreateSessionForm;

