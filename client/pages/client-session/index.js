import React, { useEffect, useRef, useState } from "react";
import { CLIENT_SESSION_LIST_DATA } from "../../utils/constants";
import CustomClientDetails from "../../components/CustomClientDetails";
import CreateSessionLayout from "../../components/FormLayouts/CreateSessionLayout/CreateSessionLayout";
import CreateSessionForm from "../../components/Forms/CreateSessionForm";
import { ClientSessionWrapper } from "../../styles/client-session";
import SmartTab from "../../components/SmartTab";
import { api } from "../../utils/auth";
import { toast } from "react-toastify";
import CommonServices from "../../services/CommonServices";
import CustomTab from "../../components/CustomTab";
import CustomButton from "../../components/CustomButton";
import { AddIcon } from "../../public/assets/icons";
import { useReferenceContext } from "../../context/ReferenceContext";
import Skeleton from "@mui/material/Skeleton";
import ApiConfig from "../../config/apiConfig";

function ClientSession() {
  const [showFlyout, setShowFlyout] = useState(false);
  const [activeData, setActiveData] = useState();
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

  const tabLabels = [
    { id: 0, label: "Current Session", value: "currentSession" },
    { id: 1, label: "All Sessions", value: "allSessions" },
  ];
  const [counselorConfiguration, setCounselorConfiguration] = useState(null);
  const [managerSplitDetails, setManagerSplitDetails] = useState(null);
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
          { label: "All counselors", value: "allCounselors" },
          ...counselorOptions,
        ]);
      }
    } catch (error) {
      console.log("Error fetching clients", error);
    }
  };
  const [selectTenantId, setSelectTenantId] = useState(null);
  const [userId, setUserId] = useState(null);
  const handleSelectCounselor = (data) => {
    const counselorId = data?.value;
    const tenant_id = data?.tenant_id;
    setUserId(data.user_id);
    setSelectTenantId(tenant_id);
    setSelectCounselor(counselorId);
    setSelectCounselorEmail(data.email);
    fetchSessions(counselorId);
    getInvoice(counselorId);
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

  const handleShowAddClientSession = () => {
    setShowFlyout(true);
  };

  const getInvoice = async (counselorIdParam) => {
    setSummaryLoading(true);
    try {
      let response;
      if (userObj?.role_id === 2) {
        response = await api.get(
          `/invoice/multi?counselor_id=${userObj?.user_profile_id}&role_id=${userObj?.role_id}`
        );
      } else if (userObj.role_id === 4) {
        let url = `/invoice/multi?role_id=${userObj?.role_id}`;
        if (counselorIdParam && counselorIdParam !== "allCounselors") {
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
      console.log(":: Invoice.getInvoice()", error);
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
    if ([3, 4].includes(userObj?.role_id) && userObj?.tenant_id) {
      fetchCounsellor();
    }
    fetchSessions(selectCounselor);
    getInvoice();
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
      console.log(response);
      if (response?.status == 200) {
        // console.log(response?.data[0]?.feature_value);
        setHomeWorkUpload(response?.data[0]?.feature_value);
        toast.success(response.data?.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };
  useEffect(() => {
    fetchHomeWorkUploadStatus();
  }, []);
  const fetchAllSplit = async () => {
    if (selectCounselor === "allCounselors" && userObj.role_id === 3) {
      return;
    }

    try {
      console.log(selectCounselor);
      const tenant_id =
        userObj?.role_id === 2 ? userObj?.tenant_id : selectTenantId;
      console.log(tenant_id);
      const response = await api.get(
        `${ApiConfig.feeSplitManagment.getAllfeesSplit}?tenant_id=${tenant_id}` // this is to be changed using 1 for dummy data
      );
      if (response.status == 200) {
        console.log(response);
        setCounselorConfiguration(
          response?.data?.data?.counselor_specific_configurations
        );
        setManagerSplitDetails(response?.data?.data?.default_configuration);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };
  useEffect(() => {
    if (userObj.role_id === 2 || userObj.role_id == 3) {
      fetchAllSplit();
    }
  }, [selectCounselor]);

  return (
    <ClientSessionWrapper>
      <div className="client-session-heading">
        <div className="heading-wrapper">
          <h2 className="heading">Client Session Schedule</h2>
          <CustomButton
            icon={<AddIcon />}
            title="Add Client Session"
            onClick={handleShowAddClientSession}
            customClass="session-create-mobile-button"
          />
        </div>
        <p className="sub-heading">
          A detailed table tracking client session schedules, session times, and
          dates, with auto-submission of treatment assessment tools.
        </p>
      </div>
      <CreateSessionLayout
        isOpen={showFlyout}
        setIsOpen={setShowFlyout}
        initialData={activeData}
        setConfirmationModal={setConfirmationModal}
      >
        <CreateSessionForm
          isHomeworkUpload={isHomeworkUpload}
          setHomeWorkUpload={setHomeWorkUpload}
          isOpen={showFlyout}
          setIsOpen={setShowFlyout}
          initialData={activeData}
          setInitialData={setActiveData}
          confirmationModal={confirmationModal}
          setConfirmationModal={setConfirmationModal}
          setSessions={setSessions}
          session={activeData}
          fetchSessions={fetchSessions}
          fetchCounselorClient={fetchSessions}
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
              heading={"Total Amount For A Month"}
              value={
                summaryLoading ? (
                  <Skeleton width={120} height={40} />
                ) : (
                  `$${
                    summaryData
                      ? (
                          Number(summaryData?.sum_session_system_amt) +
                          Number(summaryData?.sum_session_counselor_amt)
                        ).toFixed(2) || 0
                      : 0
                  }`
                )
              }
            />
            <CustomTab
              heading={"Total Amount to Associate for a Month: "}
              value={
                summaryLoading ? (
                  <Skeleton width={120} height={40} />
                ) : userObj?.role_id === 4 ? (
                  `$${
                    summaryData
                      ? Number(summaryData?.sum_session_counselor_amt).toFixed(
                          2
                        ) || 0
                      : 0
                  }`
                ) : userObj?.role_id === 2 ? (
                  (() => {
                    const match = counselorConfiguration?.find(
                      (item) =>
                        item?.counselor_info?.email?.toLowerCase() ===
                        userObj?.counselor_profile?.email?.toLowerCase()
                    );
                    const total = summaryData
                      ? Number(summaryData?.sum_session_counselor_amt) +
                          Number(summaryData?.sum_session_system_amt) || 0
                      : 0;

                    const adminFeePercent =
                      userObj?.role_id === 2
                        ? Number(userObj?.tenant?.admin_fee) || 0
                        : Number(summaryData?.system_pcnt) || 0;
                    const adminFeeAmount = (total * adminFeePercent) / 100;
                    const netAfterAdmin = total - adminFeeAmount;

                    if (match?.counselor_share_percentage) {
                      const percentageAmount =
                        (netAfterAdmin * match.counselor_share_percentage) /
                        100;
                      return `$${percentageAmount.toFixed(2)}`;
                    }

                    return "$0.00";
                  })()
                ) : selectCounselor === "allCounselors" ? (
                  `$${
                    summaryData
                      ? Number(summaryData?.sum_session_tenant_amt).toFixed(
                          2
                        ) || 0
                      : 0
                  }`
                ) : (
                  (() => {
                    const match = counselorConfiguration?.find(
                      (item) =>
                        item?.counselor_info?.email?.toLowerCase() ===
                        selectCounselorEmail?.toLowerCase()
                    );

                    const total = summaryData
                      ? Number(summaryData?.sum_session_counselor_amt) +
                          Number(summaryData?.sum_session_system_amt) || 0
                      : 0;

                    const adminFeePercent =
                      userObj?.role_id === 2
                        ? Number(userObj?.tenant?.admin_fee) || 0
                        : Number(summaryData?.system_pcnt) || 0;
                    const adminFeeAmount = (total * adminFeePercent) / 100;
                    const netAfterAdmin = total - adminFeeAmount;

                    if (match?.tenant_share_percentage) {
                      const percentageAmount =
                        (netAfterAdmin * match.tenant_share_percentage) / 100;
                      return `$${percentageAmount.toFixed(2)}`;
                    }

                    return "$0.00";
                  })()
                )
                // (
                //   `$${
                //     summaryData
                //       ? Number(summaryData?.sum_session_tenant_amt).toFixed(
                //           2
                //         ) || 0
                //       : 0
                //   }`
                // )
              }
            />
            {userObj?.role_id === 3 && selectCounselor != "allCounselors" && (
              <CustomTab
                heading={"Detail breakdown"}
                value={(() => {
                  const match = counselorConfiguration?.find(
                    (item) =>
                      item?.counselor_info?.email?.toLowerCase() ===
                      selectCounselorEmail?.toLowerCase()
                  );

                  const total = summaryData
                    ? Number(summaryData?.sum_session_counselor_amt) +
                        Number(summaryData?.sum_session_system_amt) || 0
                    : 0;
                  const adminFeePercent =
                    userObj?.role_id === 2
                      ? Number(userObj?.tenant?.admin_fee) || 0
                      : Number(summaryData?.system_pcnt) || 0;
                  const adminFeeAmount = (total * adminFeePercent) / 100;
                  const netAfterAdmin = total - adminFeeAmount;

                  const counselorShare = match?.counselor_share_percentage
                    ? `$${(
                        (netAfterAdmin * match.counselor_share_percentage) /
                        100
                      ).toFixed(2)} (${match.counselor_share_percentage}%)`
                    : "$0.00";

                  const managerShare = match?.tenant_share_percentage
                    ? `$${(
                        (netAfterAdmin * match.tenant_share_percentage) /
                        100
                      ).toFixed(2)} (${match.tenant_share_percentage}%)`
                    : "$0.00";

                  return (
                    <>
                      Total: ${total.toFixed(2)} <br />
                      Admin Fee: {adminFeePercent}% = $
                      {adminFeeAmount.toFixed(2)} <br />
                      Net After Admin Fee: ${netAfterAdmin.toFixed(2)} <br />
                      Counselor Share: {counselorShare} <br />
                      Manager Share: {managerShare}
                    </>
                  );
                })()}
              />
            )}
            {userObj?.role_id === 2 && (
              <CustomTab
                heading={"Detail breakdown"}
                value={(() => {
                  const match = counselorConfiguration?.find(
                    (item) =>
                      item?.counselor_info?.email?.toLowerCase() ===
                      userObj?.counselor_profile?.email?.toLowerCase()
                  );
                  const adminFeePercent =
                    userObj?.role_id === 2
                      ? Number(userObj?.tenant?.admin_fee) || 0
                      : Number(summaryData?.system_pcnt) || 0;
                  const total = summaryData
                    ? Number(summaryData?.sum_session_counselor_amt) +
                        Number(summaryData?.sum_session_system_amt) || 0
                    : 0;
                  const admin_share = (total * adminFeePercent) / 100;
                  const netAfterAdmin = total - admin_share;
                  const counselorShare = match?.counselor_share_percentage
                    ? `$${(
                        (netAfterAdmin * match.counselor_share_percentage) /
                        100
                      ).toFixed(2)} (${match.counselor_share_percentage}%)`
                    : "$0.00";
                  const managerShare = match?.tenant_share_percentage
                    ? `$${(
                        (netAfterAdmin * match.tenant_share_percentage) /
                        100
                      ).toFixed(2)} (${match.tenant_share_percentage}%)`
                    : "$0.00";

                  return (
                    <>
                      Total ${total.toFixed(2)} <br />
                      Admin Fee: Total {total} - Admin Fee {admin_share}% <br />
                      New total admin fee: {total - admin_share} <br />
                      Counselor Share: {counselorShare} <br />
                      Manager Share: {managerShare}
                    </>
                  );
                })()}
              />
            )}
            {userObj?.role_id == 4 ? (
              <CustomTab
                heading={"Total Amount to Vapendama for a Month:"}
                value={`$${
                  summaryData
                    ? Number(summaryData?.sum_session_system_amt).toFixed(2) ||
                      0
                    : 0
                }`}
              />
            ) : (
              <CustomTab
                heading={"Admin Fee:"}
                value={
                  summaryLoading ? (
                    <Skeleton width={120} height={40} />
                  ) : userObj?.role_id === 4 ? (
                    `$${
                      summaryData
                        ? Number(summaryData?.sum_session_system_amt).toFixed(
                            2
                          ) || 0
                        : 0
                    }`
                  ) : userObj?.role_id == 3 ? (
                    (() => {
                      const baseAmount =
                        Number(summaryData?.sum_session_system_amt) +
                        Number(summaryData?.sum_session_counselor_amt);

                      const percentage = Number(summaryData?.system_pcnt);
                      const fee = ((baseAmount * percentage) / 100).toFixed(2);

                      return `Admin Fee: ${baseAmount.toFixed(
                        2
                      )} * ${percentage} = ${fee}`;
                    })()
                  ) : (
                    (() => {
                      const baseAmount =
                        Number(summaryData?.sum_session_system_amt) +
                        Number(summaryData?.sum_session_counselor_amt);

                      const percentage = Number(userObj?.tenant?.admin_fee);
                      const fee = ((baseAmount * percentage) / 100).toFixed(2);

                      return `Admin Fee: ${baseAmount.toFixed(
                        2
                      )} * ${percentage} = ${fee}`;
                    })()
                  )
                }
              />
            )}
            {/* <CustomTab
              heading={"Total Amount to Vapendama for a Month:"}
              value={
                summaryLoading ? (
                  <Skeleton width={120} height={40} />
                ) : userObj?.role_id === 4 ? (
                  `$${
                    summaryData
                      ? Number(summaryData?.sum_session_system_amt).toFixed(
                          2
                        ) || 0
                      : 0
                  }`
                ) : userObj?.role_id == 3 ? (
                  (() => {
                    const baseAmount =
                      Number(summaryData?.sum_session_system_amt) +
                      Number(summaryData?.sum_session_counselor_amt);

                    const percentage = Number(summaryData?.system_pcnt);
                    const fee = (baseAmount * percentage).toFixed(2);

                    return `Admin Fee: ${baseAmount.toFixed(
                      2
                    )} * ${percentage} = ${fee}`;
                  })()
                ) : (
                  (() => {
                    const baseAmount =
                      Number(summaryData?.sum_session_system_amt) +
                      Number(summaryData?.sum_session_counselor_amt);

                    const percentage = Number(userObj?.tenant?.admin_fee);
                    const fee = (baseAmount * percentage).toFixed(2);

                    return `Admin Fee: ${baseAmount.toFixed(
                      2
                    )} * ${percentage} = ${fee}`;
                  })()
                )
              }
            /> */}
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
        selectCounselor={selectCounselor}
        handleSelectCounselor={handleSelectCounselor}
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
    </ClientSessionWrapper>
  );
}

export default ClientSession;
