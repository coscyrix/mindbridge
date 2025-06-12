import React, { useEffect, useRef, useState } from "react";
import { SessionHistoryContainer } from "../styles/session-history";
import { CLIENT_SESSION_LIST_DATA } from "../utils/constants";
import { useRouter } from "next/router";
import CustomSelect from "../components/CustomSelect";
import { ArrowIcon } from "../public/assets/icons";
import CustomSearch from "../components/CustomSearch";
import CustomClientDetails from "../components/CustomClientDetails";
import CommonServices from "../services/CommonServices";
import { useReferenceContext } from "../context/ReferenceContext";

function SessionHistory() {
  const [sessions, setSessios] = useState([]);
  const [sessionToBeDisplayed, setSessionToBeDisplayed] = useState([]);
  const [sessionLoading, setSessionLoading] = useState([]);
  const [counselors, setCounselors] = useState([
    { label: "All counselors", value: "allCounselors" },
  ]);
  const [selectCounselor, setSelectCounselor] = useState("allCounselors");
  const [filterText, setFilterText] = useState("");
  const [selectDate, setSelectDate] = useState(null);
  const { userObj } = useReferenceContext();

  const actionDropdownRef = useRef(null);
  const handleCellClick = (row) => {
    setSessionToBeDisplayed((prev) => {
      const data = prev?.map((session) => {
        if (session?.client_id === row?.client_id) {
          return { ...session, active: !session?.active };
        } else {
          return session;
        }
      });
      return data;
    });
  };

  const handleClickOutside = (e) => {
    if (
      actionDropdownRef?.current &&
      !actionDropdownRef?.current?.contains(e.target)
    ) {
      setSessionToBeDisplayed((prev) => {
        return prev?.map((session) => {
          return { ...session, active: false };
        });
      });
    }
  };
  const handleEdit = () => {
    console.log(":: handlEdit");
  };
  const handleDelete = () => {
    console.log(":: handleDelete");
  };

  const sessionColumns = CLIENT_SESSION_LIST_DATA(
    handleCellClick,
    handleEdit,
    handleDelete,
    actionDropdownRef,
    true
  );

  const fetchSessions = async (counselorId) => {
    try {
      setSessionLoading(true);
      let response;

      const isAdmin = userObj?.role_id === 4;
      const isSpecificCounselor =
        counselorId && counselorId !== "allCounselors";

      if (!isAdmin && counselorId !== "allCounselors") {
        response = await CommonServices.getSessionsByCounselor({
          role_id: 2,
          counselor_id: counselorId || userObj?.user_profile_id,
        });
      } else if (isAdmin && isSpecificCounselor) {
        response = await CommonServices.getSessionsByCounselor({
          counselor_id: counselorId,
        });
      } else {
        response = await CommonServices.getSessionsByCounselor({role_id:userObj?.role_id});
      }

      if (response.status === 200) {
        const { data } = response;
        setSessios(data);
        setSessionToBeDisplayed(data);
      }
    } catch (error) {
      console.error("Error fetching sessions", error);
    } finally {
      setSessionLoading(false);
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
        }));
        setCounselors([{ label: "All counselors", value: "allCounselors" }, ...counselorOptions]);
      }
    } catch (error) {
      console.log("Error fetching clients", error);
    }
  };

  const handleSelectCounselor = (data) => {
    const counselorId = data?.value;
    setSelectCounselor(counselorId);
    fetchSessions(counselorId);
  };

  const updateUserDataToDisplay = () => {
    let filteredData = sessions;

    if (selectDate) {
      filteredData = filteredData.filter(
        (data) => data?.req_dte_not_formatted === selectDate
      );
    }

    if (filterText) {
      filteredData = filteredData?.filter((row) => {
        return Object.keys(row).some((columnKey) => {
          const value = row[columnKey];

          const columns = sessionColumns || [];
          const isColumnKeyFound = columns?.some(
            (col) => col.selectorId === columnKey
          );

          if (isColumnKeyFound) {
            return value
              ?.toString()
              .toLowerCase()
              .includes(filterText.toString().toLowerCase().trim());
          }
        });
      });
    }
    setSessionToBeDisplayed(filteredData);
  };
  const router = useRouter();
  const getClientSessionDetail = (id) => {
    router.push(`/client-session/${id}`);
  };

  useEffect(() => {
    if ([3, 4].includes(userObj?.role_id) && userObj?.tenant_id) {
      fetchCounsellor();
    }
    fetchSessions("allCounselors");
  }, [userObj]);

  useEffect(() => {
    updateUserDataToDisplay();
  }, [selectDate, filterText]);

  useEffect(() => {
    window.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <SessionHistoryContainer>
      <div className="header-wrapper">
        <h2>Session History</h2>
        <p>
          Session history table with detailed records of past client sessions,
          including, dates, times, attendance, and results.
        </p>
      </div>
      <CustomClientDetails
        tableData={{
          columns: sessionColumns?.map((column) => {
            return {
              ...column,
              cell:
                column?.name === "Serial Number"
                  ? (row) => column.cell(row, getClientSessionDetail)
                  : column.cell,
            };
          }),
          data: sessionToBeDisplayed,
        }}
        selectableRows={false}
        selectCounselor={selectCounselor}
        handleSelectCounselor={handleSelectCounselor}
        counselors={counselors}
        loading={sessionLoading}
        tableCaption="Session History"
      >
        <div className="user-info-selects">
          <div className="custom-search-wrapper">
            <CustomSearch
              onFilter={(e) => setFilterText(e.target.value)}
              filterText={filterText}
            />
          </div>
          <div>
            <input
              type="date"
              onChange={(e) => setSelectDate(e.target.value)}
              style={{
                height: "35px",
                padding: "18px 15px",
                borderRadius: " 8px",
                border: " 1px solid #e1e1e1",
              }}
            />
          </div>
        </div>
      </CustomClientDetails>
    </SessionHistoryContainer>
  );
}

export default SessionHistory;
