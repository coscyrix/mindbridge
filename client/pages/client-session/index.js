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

function ClientSession() {
  const [showFlyout, setShowFlyout] = useState(false);
  const [activeData, setActiveData] = useState();
  const [confirmationModal, setConfirmationModal] = useState(false);
  const actionDropdownRef = useRef(null);
  const [sessions, setSessions] = useState();
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [selectCounselor, setSelectCounselor] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const { userObj } = useReferenceContext();

  const tabLabels = [
    { id: 0, label: "Current Session", value: "currentSession" },
    { id: 1, label: "All Sessions", value: "allSessions" },
  ];

  const handleFilterData = () => {
    console.log("handleFilterData has been called");
  };

  const fetchSessions = async (counselorId) => {
    try {
      setSessionsLoading(true);
      let response;
      if (userObj?.role_id !== 4) {
        response = await CommonServices.getSessionsByCounselor({
          role_id: userObj?.role_id,
          counselor_id: userObj?.user_profile_id,
        });
      } else {
        if (counselorId && counselorId !== "allCounselors") {
          response = await CommonServices.getSessionsByCounselor({
            counselor_id: counselorId,
          });
        } else {
          response = await CommonServices.getSessions();
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

  const handleSelectCounselor = (data) => {
    const counselorId = data?.value;
    setSelectCounselor(counselorId);
    fetchSessions(counselorId);
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
      const res = await api.put(`/thrpyReq/?req_id=${row?.req_id}`, {
        status_yn: "n",
      });
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

  const getInvoice = async () => {
    try {
      let response;
      if (userObj?.role_id == 2) {
        response = await api.get(
          `/invoice/multi?counselor_id=${userObj?.user_profile_id}&role_id=${userObj?.role_id}`
        );
      } else {
        response = await api.get(
          `/invoice/multi?role_id=${userObj?.role_id}&counselor_id=${userObj?.user_profile_id}`
        );
      }
      if (response.status === 200) {
        setSummaryData(response?.data?.rec?.summary);
      }
    } catch (error) {
      console.log(":: Invoice.getInvoice()", error);
    }
  };

  useEffect(() => {
    window.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    fetchSessions();
    getInvoice();
  }, []);

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
          isOpen={showFlyout}
          setIsOpen={setShowFlyout}
          initialData={activeData}
          setInitialData={setActiveData}
          confirmationModal={confirmationModal}
          setConfirmationModal={setConfirmationModal}
          setSessions={setSessions}
          fetchSessions={fetchSessions}
          fetchCounselorClient={fetchSessions}
        />
      </CreateSessionLayout>
      <CustomClientDetails
        customTab={
          <div className="tab-container">
            {/* <CustomTab
              heading={"Current Date"}
              value={moment().format("dddd, D MMMM YYYY")}
            /> */}
            <CustomTab
              heading={"Total Amount For A Month"}
              value={`$${
                summaryData
                  ? Math.round(Number(summaryData?.sum_session_price)) || 0
                  : 0
              }`}
            />
            <CustomTab
              heading={"Total Amount to Associate for a Month: "}
              value={`$${
                summaryData
                  ? Math.round(
                      Number(summaryData?.sum_session_counselor_amt)
                    ) || 0
                  : 0
              }`}
            />
            <CustomTab
              heading={"Total Amount to Vapendama for a Month:"}
              value={`$${
                summaryData
                  ? Math.round(Number(summaryData?.sum_session_system_amt)) || 0
                  : 0
              }`}
            />
            <CustomTab
              heading={"Total Amount of Units:"}
              value={summaryData?.sum_session_system_units || 0}
            />
          </div>
        }
        tableCaption="Client Session List"
        tableData={{
          columns: sessionsDataColumns,
          data: sessions,
        }}
        primaryButton={userObj?.role_id !== 4 && "Add Client Session"}
        selectCounselor={selectCounselor}
        handleSelectCounselor={handleSelectCounselor}
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
