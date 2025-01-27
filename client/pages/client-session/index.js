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
import moment from "moment";
import CustomButton from "../../components/CustomButton";
import { AddIcon } from "../../public/assets/icons";

function ClientSession() {
  const [showFlyout, setShowFlyout] = useState(false);
  const [activeData, setActiveData] = useState();
  const [confirmationModal, setConfirmationModal] = useState(false);
  const actionDropdownRef = useRef(null);
  const [sessions, setSessions] = useState();
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const tabLabels = [
    { id: 0, label: "Current Session", value: "currentSession" },
    { id: 1, label: "All Sessions", value: "allSessions" },
  ];

  const handleFilterData = () => {
    console.log("handleFilterData has been called");
  };

  const fetchSessions = async () => {
    try {
      setSessionsLoading(true);
      const response = await CommonServices.getSessions();
      if (response.status === 200) {
        const { data } = response;
        setSessions(data);
      }
    } catch (error) {
      console.log("Error fetching sessions", error);
    } finally {
      setSessionsLoading(false);
    }
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

  useEffect(() => {
    window.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    fetchSessions();
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
          A detailed table tracking client session schedules, session times and
          dates.
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
        />
      </CreateSessionLayout>
      <CustomClientDetails
        customTab={
          <div className="tab-container">
            <CustomTab
              heading={"Current Date"}
              value={moment().format("dddd, D MMMM YYYY")}
            />
            <CustomTab
              heading={"Total Amount For A Month"}
              value={"$852.272"}
            />
            <CustomTab
              heading={"Total Amount to Associate for a Month: "}
              value={"$340.908"}
            />
            <CustomTab
              heading={"Total Amount to Vapendama for a Month:"}
              value={"$511.362"}
            />
            <CustomTab heading={"Total Amount of Units:"} value={"5"} />
          </div>
        }
        tableCaption="Client Session List"
        tableData={{
          columns: sessionsDataColumns,
          data: sessions,
        }}
        primaryButton="Add Client Session"
        handleCreate={handleShowAddClientSession}
        onRowClicked={handleEdit}
        loading={sessionsLoading}
        fixedHeaderScrollHeight="550px"
        itemsPerPage={10}
      >
        <div className="custom-client-children">
          <SmartTab tabLabels={tabLabels} handleFilterData={handleFilterData} />
          {/* <CustomButton
            icon={<AddIcon />}
            title="Add Client Session"
            onClick={handleShowAddClientSession}
            customClass="create-client-button"
          /> */}
        </div>
      </CustomClientDetails>
    </ClientSessionWrapper>
  );
}

export default ClientSession;
