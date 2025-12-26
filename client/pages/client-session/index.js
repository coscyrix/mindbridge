import React, { useEffect, useRef, useState } from "react";
import { CLIENT_SESSION_LIST_DATA } from "../../utils/constants";
import CustomClientDetails from "../../components/CustomClientDetails";
import CreateSessionLayout from "../../components/FormLayouts/CreateSessionLayout/CreateSessionLayout";
import CreateSessionForm from "../../components/Forms/CreateSessionForm";
import { ClientSessionWrapper, AbsenceModalWrapper } from "../../styles/client-session";
import SmartTab from "../../components/SmartTab";
import { api } from "../../utils/auth";
import { toast } from "react-toastify";
import CommonServices from "../../services/CommonServices";
import CustomTab from "../../components/CustomTab";
import CustomButton from "../../components/CustomButton";
import { AddIcon } from "../../public/assets/icons";
import { useReferenceContext } from "../../context/ReferenceContext";
import Skeleton from "@mui/material/Skeleton";
import { useRouter } from "next/router";
import ApiConfig from "../../config/apiConfig";
import { useSessionModal, useFeeSplit } from "../../utils/hooks";
import CustomModal from "../../components/CustomModal";
import CustomDatePicker from "../../components/DatePicker";
import ConfirmationModal from "../../components/ConfirmationModal";

function ClientSession() {
  const router = useRouter();
  const [counselorId, setCounselorId] = useState(null);
  const { open } = router.query;
  const [confirmationModal, setConfirmationModal] = useState(false);
  const actionDropdownRef = useRef(null);
  const [sessions, setSessions] = useState();
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [counselors, setCounselors] = useState([
    { label: "All counselors", value: "allCounselors" },
  ]);
  const [selectCounselor, setSelectCounselor] = useState("allCounselors");
  const [selectCounselorEmail, setSelectCounselorEmail] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const { userObj } = useReferenceContext();
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState("");
  const [absenceModalOpen, setAbsenceModalOpen] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [absenceLoading, setAbsenceLoading] = useState(false);
  
  const tabLabels = [
    { id: 0, label: "Current Session", value: "currentSession" },
    { id: 1, label: "All Sessions", value: "allSessions" },
  ];

  // Custom hooks for session modal and fee split management
  const {
    showModal: showFlyout,
    sessionData: activeData,
    setShowModal: setShowFlyout,
    setSessionData: setActiveData,
    closeSessionModal,
  } = useSessionModal();

  const {
    counselorConfiguration,
    managerSplitDetails,
    fetchFeeSplit,
  } = useFeeSplit();
  const handleFilterData = () => {
    console.log("handleFilterData has been called");
  };

  const fetchSessions = async (counselorId) => {
    try {
      setSessionsLoading(true);
      let response;
      if (userObj?.role_id === 3) {
        if (counselorId == "allCounselors") {
          response = await CommonServices.getSessionsByCounselor({
            role_id: 3,
            tenant_id: userObj?.tenant_id,
          });
        }
        // Always fetch with role_id: 3 for role 3 users
        else {
          response = await CommonServices.getSessionsByCounselor({
            role_id: 3,
            counselor_id: counselorId,
          });
        }
      } else if (userObj?.role_id !== 4) {
        response = await CommonServices.getSessionsByCounselor({
          role_id: userObj?.role_id,
          counselor_id: userObj?.user_profile_id,
        });
      } else {
        if (counselorId && counselorId !== "allCounselors") {
          response = await CommonServices.getSessionsByCounselor({
            role_id: 2,
            counselor_id: counselorId,
          });
        } else {
          response = await CommonServices.getSessionsByCounselor({
            role_id: userObj?.role_id,
          });
        }
      }
      if (response.status === 200) {
        const { data } = response;
        setSessions(
          data?.filter((session) => session.thrpy_status !== "DISCHARGED")
        );
      }
    } catch (error) {
      console.log("Error fetching sessions", error);
    } finally {
      setSessionsLoading(false);
    }
  };

  const fetchCounsellor = async () => {
    if (!userObj?.tenant_id) return;
    try {
      const response = await CommonServices.getClients();
      if (response.status === 200) {
        const { data } = response;
        const allCounselors = data?.rec?.filter(
          (client) =>
            client?.role_id === 2 && client?.tenant_id === userObj?.tenant_id
        );

        const counselorOptions = allCounselors?.map((item) => ({
          label: item?.user_first_name + " " + item?.user_last_name,
          value: item?.user_profile_id,
          tenant_id: item?.tenant_id,
          email: item?.email,
        }));
        setCounselors([
          {
            label: "All counselors",
            value: "allCounselors",
            tenant_id: selectTenantId,
          },
          ...counselorOptions,
        ]);
      }
    } catch (error) {
      console.log("Error fetching clients", error);
    }
  };
  const [selectTenantId, setSelectTenantId] = useState(null);
  const [userId, setUserId] = useState(null);

  // const handleSelectCounselor = (data) => {
  //   console.log(data, "getting data::::::");
  //   const counselorId = data?.value;
  //   const tenant_id = data?.tenant_id;
  //   setUserId(data.user_id);

  //   setSelectTenantId(tenant_id);

  //   setSelectCounselor(counselorId);
  //   setSelectCounselorEmail(data.email);
  //   if (data?.value === "allCounselor") {
  //     fetchSessions();
  //   } else {
  //     fetchSessions(counselorId);
  //   }

  //   getInvoice(counselorId, tenant_id);
  // };

  const handleSelectCounselor = (data) => {
    const counselorId = data?.value;

    if (counselorId !== "allCounselor") {
      setUserId(data.user_id);
      setSelectTenantId(data.tenant_id);
      setSelectCounselorEmail(data.email);
    }

    setSelectCounselor(counselorId);

    if (counselorId === "allCounselor") {
      fetchSessions();
    } else {
      fetchSessions(counselorId);
    }

    getInvoice(
      counselorId,
      counselorId === "allCounselor" ? selectTenantId : data.tenant_id
    );
  };

  const handleClickOutside = (e) => {
    if (
      actionDropdownRef.current &&
      !actionDropdownRef.current.contains(e.target)
    ) {
      setSessions((prev) =>
        prev?.map((data) => {
          return {
            ...data,
            active: false,
          };
        })
      );
    }
  };

  const handleCellClick = (row) => {
    setSessions((prev) => {
      return prev?.map((data) => {
        if (data.req_id === row.req_id) {
          return {
            ...data,
            active: !row.active,
          };
        } else {
          return {
            ...data,
            active: false,
          };
        }
      });
    });
  };

  const handleEdit = (row) => {
    setShowFlyout(true);
    setActiveData(row);
    if (row?.tenant_id) {
      setSelectTenantId(row.tenant_id);
    }
    setCounselorId(row?.counselor_id);
  };

  const handleDelete = async (row) => {
    try {
      const res = await api.put(
        `/thrpyReq/?req_id=${row?.req_id}&role_id=${userObj?.role_id}&user_profile_id=${userObj?.user_profile_id}`,
        {
          status_yn: "n",
        }
      );
      if (res.status === 200) {
        setSessions((prev) => {
          const updatedData = prev?.filter(
            (data) => data.req_id !== row?.req_id
          );
          return updatedData;
        });
      }
      toast.success("Session deleted Successfully", {
        position: "top-right",
      });
    } catch (err) {
      console.error(err);
      toast.error("Error while deleting the session", {
        position: "top-right",
      });
    }
    handleCellClick(row);
  };

  const sessionsDataColumns = CLIENT_SESSION_LIST_DATA(
    handleCellClick,
    handleEdit,
    handleDelete,
    actionDropdownRef
  );

  const handleShowAddClientSession = (row) => {
    setShowFlyout(true);
  };

  const handleAbsenceHandling = () => {
    setAbsenceModalOpen(true);
  };

  const handleAbsenceModalClose = () => {
    setAbsenceModalOpen(false);
    setStartDate(null);
    setEndDate(null);
    setNotificationModalOpen(false);
  };

  const handleAbsenceSubmit = () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates", {
        position: "top-right",
      });
      return;
    }

    if (startDate > endDate) {
      toast.error("Start date cannot be after end date", {
        position: "top-right",
      });
      return;
    }

    // Validate minimum 3 weeks (21 days) absence period
    const daysDifference = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    const minimumDays = 21; // 3 weeks
    
    if (daysDifference < minimumDays) {
      toast.error(
        `Absence period must be at least ${minimumDays} days (3 weeks). Current period: ${daysDifference} days`,
        {
          position: "top-right",
        }
      );
      return;
    }

    // Close the absence modal and show notification confirmation modal
    setAbsenceModalOpen(false);
    setNotificationModalOpen(true);
  };

  const handleNotificationConfirm = async (notifyAdmin) => {
    try {
      setAbsenceLoading(true);
      const counselor_id = userObj?.user_profile_id;
      const tenant_id = userObj?.tenant_id;

      if (!counselor_id) {
        toast.error("Counselor ID not found", {
          position: "top-right",
        });
        return;
      }

      const response = await api.post("/therapist-absence", {
        counselor_id,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        notify_admin: notifyAdmin,
        tenant_id,
      });

      if (response.status === 200) {
        const { data } = response;
        toast.success(
          `Absence handled successfully. ${data.paused_blocks} blocks paused, ${data.rescheduled_sessions} sessions rescheduled.`,
          {
            position: "top-right",
          }
        );
        
        // Refresh sessions list
        fetchSessions(selectCounselor);
        handleAbsenceModalClose();
      }
    } catch (error) {
      console.error("Error handling absence:", error);
      toast.error(error?.response?.data?.message || "Error handling absence", {
        position: "top-right",
      });
    } finally {
      setAbsenceLoading(false);
      setNotificationModalOpen(false);
    }
  };

  const getInvoice = async (counselorIdParam, tenantId) => {
    setSummaryLoading(true);
    try {
      let response;
      if (userObj?.role_id === 2) {
        response = await api.get(
          `/invoice/multi?counselor_id=${userObj?.user_profile_id}&role_id=${userObj?.role_id}`
        );
      } else if (userObj.role_id === 4) {
        let url = `/invoice/multi?role_id=${userObj?.role_id}`;
        if (tenantId) {
          url += `&tenant_id=${tenantId}`;
        }
        if (
          counselorIdParam &&
          counselorIdParam !== "allCounselors" &&
          counselorIdParam !== "allCounselor"
        ) {
          url += `&counselor_id=${counselorIdParam}`;
        }

        response = await api.get(url);

        if (response.status === 200) {
          setSummaryData(response?.data?.rec?.summary);
        }
      } else {
        let url = `/invoice/multi?role_id=${userObj?.role_id}&tenant_id=${userObj?.tenant_id}`;
        if (counselorIdParam && counselorIdParam !== "allCounselors") {
          url += `&counselor_id=${counselorIdParam}`;
        }
        response = await api.get(url);
      }
      if (response.status === 200) {
        setSummaryData(response?.data?.rec?.summary);
      }
    } catch (error) {
      console.error(":: Invoice.getInvoice()", error);
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    window.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (userObj && Object.keys(userObj).length > 0) {
      if ([3, 4].includes(userObj?.role_id) && userObj?.tenant_id) {
        fetchCounsellor();
      }
      fetchSessions(selectCounselor);
      getInvoice(selectCounselor, selectedTenantId?.tenant_id);
    }
  }, [userObj]);

  const [isHomeworkUpload, setHomeWorkUpload] = useState(false);
  const fetchHomeWorkUploadStatus = async () => {
    // Skip API call for admin users (role_id === 4)
    if (userObj?.role_id === 4) {
      return;
    }

    try {
      const response = await api.get(
        `${ApiConfig.homeworkUpload.fetchHomeworkUploadStatus}?tenant_id=${userObj?.tenant?.tenant_id}&feature_name=homework_upload_enabled`
      );
      if (response?.status == 200) {
        if (response?.data[0]?.feature_value === "true") {
          setHomeWorkUpload(true);
        }

        toast.success(response.data?.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };
  useEffect(() => {
    if (userObj && Object.keys(userObj).length > 0) {
      fetchHomeWorkUploadStatus();
    }
  }, [userObj]);
  useEffect(() => {
    // Skip fetching fee split for Manager (role 3) when "All Counselors" is selected
    if (selectCounselor === "allCounselors" && userObj.role_id === 3) {
      return;
    }

    if (
      userObj.role_id === 2 ||
      userObj.role_id == 3 ||
      (userObj.role_id == 4 && selectTenantId)
    ) {
      const tenant_id = userObj?.role_id === 2 ? userObj?.tenant_id : selectTenantId;
      if (tenant_id) {
        fetchFeeSplit(tenant_id);
      }
    }
  }, [selectCounselor, selectTenantId, fetchFeeSplit, userObj.role_id, userObj?.tenant_id]);
  useEffect(() => {
    if (open === "true") {
      setShowFlyout(true);
    }
  }, []);

  return (
    <ClientSessionWrapper>
      <div className="client-session-heading">
        <div className="heading-wrapper">
          <h2 className="heading">Client Session Schedule</h2>
          {/* <CustomButton
            icon={<AddIcon />}
            title="Add Client Session"
            onClick={handleShowAddClientSession}
            customClass="session-create-mobile-button"
          /> */}
        </div>
        <p className="sub-heading">
          A detailed table tracking client session schedules, session times, and
          dates, with auto-submission of treatment assessment tools.
        </p>
      </div>
      <CreateSessionLayout
        isOpen={showFlyout}
        setIsOpen={closeSessionModal}
        initialData={activeData}
        setConfirmationModal={setConfirmationModal}
      >
        <CreateSessionForm
          time={activeData?.req_time}
          isHomeworkUpload={isHomeworkUpload}
          fetchHomeWorkUploadStatus={fetchHomeWorkUploadStatus}
          setHomeWorkUpload={setHomeWorkUpload}
          isOpen={showFlyout}
          setIsOpen={closeSessionModal}
          initialData={activeData}
          setInitialData={setActiveData}
          confirmationModal={confirmationModal}
          setConfirmationModal={setConfirmationModal}
          setSessions={setSessions}
          session={activeData}
          fetchSessions={fetchSessions}
          fetchCounselorClient={fetchSessions}
          counselorConfiguration={counselorConfiguration}
          counselor_id={counselorId}
        />
      </CreateSessionLayout>
      <CustomClientDetails
        isHomeworkUpload={isHomeworkUpload}
        setHomeWorkUpload={setHomeWorkUpload}
        customTab={
          <div className="tab-container">
            {/* <CustomTab
              heading={"Current Date"}
              value={moment().format("dddd, D MMMM YYYY")}
            /> */}
            <CustomTab
              heading="Total Amount For A Month"
              value={
                summaryLoading ? (
                  <Skeleton width={120} height={40} />
                ) : userObj?.role_id === 2 ? (
                  `$${Number(summaryData?.sum_session_total_amount).toFixed(2)}`
                ) : userObj?.role_id === 3 ? (
                  <>
                    Total Amount :{" $"}
                    {Number(summaryData?.sum_session_total_amount).toFixed(2)}
                    {/* <p>
                      Total Tax:{" "}
                      {(
                        Number(summaryData?.sum_session_price) -
                        Number(summaryData?.sum_session_pre_tax_amount)
                      ).toFixed(4)}
                    </p>
                    <p>
                      Amount After Tax :{" "}
                      {Number(summaryData?.sum_session_price).toFixed(4)}
                    </p> */}
                  </>
                ) : userObj?.role_id === 4 ? (
                  <>
                    Total Amount :{" $"}
                    {Number(summaryData?.sum_session_total_amount).toFixed(2)}
                    {/* <p>
                      Tax Amount :{" "}
                      {(
                        Number(summaryData?.sum_session_price) -
                        Number(summaryData?.sum_session_pre_tax_amount)
                      ).toFixed(4)}
                    </p> */}
                    {/* <p>Amount After Tax : {summaryData?.sum_session_price} </p> */}
                  </>
                ) : (
                  ""
                )
              }
            />

            {userObj?.role_id !== 4 && (
              <CustomTab
                heading="Monthly Associate Total:"
                value={
                  summaryLoading ? (
                    <Skeleton width={120} height={40} />
                  ) : userObj?.role_id === 2 ? (
                    `$${Number(
                      summaryData?.sum_session_counselor_tenant_amt
                    ).toFixed(2)}`
                  ) : userObj?.role_id === 3 ? (
                    `$${Number(summaryData?.sum_session_counselor_amt).toFixed(
                      2
                    )}`
                  ) : (
                    ""
                  )
                }
              />
            )}

            <CustomTab
              heading="Detail breakdown"
              className="detail-breakdown-tab"
              value={
                summaryLoading ? (
                  <Skeleton width={200} height={40} />
                ) : userObj?.role_id === 2 ? (
                  <>
                    <p>
                      Counsellor Share:{" $"}
                      {Number(summaryData?.sum_session_counselor_amt).toFixed(
                        2
                      )}{" "}
                      (
                      {
                        summaryData?.fee_split_management
                          ?.counselor_share_percentage
                      }
                      %)
                    </p>
                    Tenant Share:{" $"}
                    {(
                      Number(summaryData?.sum_session_tenant_amt) +
                      Number(summaryData?.sum_session_system_amt)
                    ).toFixed(2)}{" "}
                    (
                    {summaryData?.fee_split_management?.tenant_share_percentage}
                    %)
                  </>
                ) : userObj?.role_id === 3 ? (
                  <>
                    {/* Counsellor Share:{" "}
                    {Number(summaryData?.sum_session_counselor_amt).toFixed(4)} */}
                    {/* <br /> */}
                    Your Share:{" $"}
                    {Number(summaryData?.sum_session_tenant_amt).toFixed(4)}
                  </>
                ) : userObj?.role_id === 4 ? (
                  <>
                    <p>
                      All Practice Amount:{" $"}
                      {Number(summaryData?.sum_session_total_amount).toFixed(4)}
                    </p>

                    <>
                      Counsellor Amount:{" $"}
                      {Number(
                        summaryData?.sum_session_counselor_tenant_amt
                      ).toFixed(4)}{" "}
                      <br />
                      Tenant Amount:{" $"}
                      {Number(summaryData?.sum_session_tenant_amt).toFixed(4)}
                    </>
                  </>
                ) : (
                  ""
                )
              }
            />

            {(userObj?.role_id == 3 || userObj?.role_id == 4) && (
              <CustomTab
                heading={"Tax (GST) "}
                value={
                  summaryLoading ? (
                    <Skeleton width={120} height={40} />
                  ) : (
                    `$${Number(summaryData?.sum_session_taxes)?.toFixed(4)}`
                  )
                }
              />
            )}

            {userObj?.role_id == 4 ? (
              <CustomTab
                heading={"Total Amount to Vapendama for a Month:"}
                value={
                  summaryLoading ? (
                    <Skeleton width={120} height={40} />
                  ) : (
                    `$${Number(summaryData?.sum_session_system_amt)?.toFixed(
                      4
                    )}`
                  )
                }
              />
            ) : (
              userObj?.role_id !== 2 && (
                <CustomTab
                  heading={"Admin Fee:"}
                  value={
                    summaryLoading ? (
                      <Skeleton width={120} height={40} />
                    ) : (
                      `$${Number(summaryData?.sum_session_system_amt)?.toFixed(
                        4
                      )}`
                    )
                  }
                />
              )
            )}

            <CustomTab
              heading={"Total Amount of Units:"}
              value={
                summaryLoading ? (
                  <Skeleton width={120} height={40} />
                ) : (
                  summaryData?.sum_session_system_units || 0
                )
              }
            />
          </div>
        }
        tableCaption="Client Session List"
        tableData={{
          columns: sessionsDataColumns,
          data: sessions,
        }}
        primaryButton={
          userObj?.role_id !== 4 &&
          userObj?.role_id !== 3 &&
          "Add Client Session"
        }
        secondaryButton={
          Number(userObj?.role_id) === 2 &&
          "Absence Management"
        }
        handleSecondaryAction={handleAbsenceHandling}
        selectCounselor={selectCounselor}
        handleSelectCounselor={handleSelectCounselor}
        setSelectedTenantId={setSelectedTenantId}
        getInvoice={getInvoice}
        counselor={counselors}
        handleCreate={handleShowAddClientSession}
        onRowClicked={handleEdit}
        loading={sessionsLoading}
        fixedHeaderScrollHeight="550px"
        itemsPerPage={10}
      >
        <div className="custom-client-children">
          <SmartTab
            tabLabels={tabLabels}
            handleFilterData={handleFilterData}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>
      </CustomClientDetails>

      {/* Absence Handling Modal */}
      <CustomModal
        isOpen={absenceModalOpen}
        onRequestClose={handleAbsenceModalClose}
        title="Absence Handling"
        customStyles={{ maxWidth: "600px" }}
      >
        <AbsenceModalWrapper>
          <div className="modal-content">
            <div className="date-field">
              <label>Start Date</label>
              <div className="date-picker-wrapper">
                <CustomDatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  dateFormat="yyyy-MM-dd"
                  placeholderText="Select start date"
                  isClearable
                />
              </div>
            </div>

            <div className="date-field">
              <label>End Date (Minimum 3 weeks from start date)</label>
              <div className="date-picker-wrapper">
                <CustomDatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={
                    startDate
                      ? new Date(new Date(startDate).setDate(startDate.getDate() + 20))
                      : null
                  }
                  dateFormat="yyyy-MM-dd"
                  placeholderText="Select end date (minimum 3 weeks)"
                  isClearable
                />
              </div>
            </div>

            {startDate && endDate && (() => {
              const daysDifference = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
              const minimumDays = 21;
              const isValid = daysDifference >= minimumDays;
              
              return (
                <div className={`date-range-info ${!isValid ? 'date-range-warning' : ''}`}>
                  <p className="info-text">
                    <span>📅</span>
                    <span>
                      Selected range: {startDate.toLocaleDateString()} to {endDate.toLocaleDateString()}
                      <span> ({daysDifference} days)</span>
                      {!isValid && (
                        <span style={{ color: '#dc3545', fontWeight: 'bold', marginLeft: '8px' }}>
                          ⚠️ Minimum {minimumDays} days (3 weeks) required
                        </span>
                      )}
                    </span>
                  </p>
                </div>
              );
            })()}

            <div className="button-group">
              <button
                className="cancel-button"
                onClick={handleAbsenceModalClose}
              >
                Cancel
              </button>
              <button
                className="submit-button"
                onClick={handleAbsenceSubmit}
                disabled={!startDate || !endDate}
              >
                Submit
              </button>
            </div>
          </div>
        </AbsenceModalWrapper>
      </CustomModal>

      <ConfirmationModal
        isOpen={notificationModalOpen}
        onClose={() => handleNotificationConfirm(false)}
        content="Notify Admin/Supplier of Therapist Absence?"
        affirmativeAction="Yes"
        discardAction="No"
        handleAffirmativeAction={() => handleNotificationConfirm(true)}
        loading={absenceLoading}
      />
    </ClientSessionWrapper>
  );
}

export default ClientSession;
