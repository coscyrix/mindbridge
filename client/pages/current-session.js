import React, { useEffect, useRef, useState } from "react";
import { CurrentSessionHeadingWrapper } from "../styles/current-session";
import { SESSION_TABLE_COLUMNS } from "../utils/constants";
import { api } from "../utils/auth";
import CustomTable from "../components/CustomTable";
import CustomSearch from "../components/CustomSearch";
import CustomButton from "../components/CustomButton";
import { OpenEyeIcon, SettingsIcon } from "../public/assets/icons";
import CommonServices from "../services/CommonServices";
import CustomMultiSelect from "../components/CustomMultiSelect";
import { useReferenceContext } from "../context/ReferenceContext";
import Cookies from "js-cookie";
import CreateSessionLayout from "../components/FormLayouts/CreateSessionLayout/CreateSessionLayout";
import CreateSessionForm from "../components/Forms/CreateSessionForm";

function CurrentSession() {
  const [showFlyout, setShowFlyout] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [activeData, setActiveData] = useState();
  const [sessions, setSessions] = useState();
  const [rowToEdit, setRowToEdit] = useState();
  const [todaySession, setTodaySession] = useState([]);
  const [todaySessionFilterText, setTodaySessionFilterText] = useState("");
  const [todaySessionToBeDisplayed, setTodaySessionToBeDisplayed] = useState(
    []
  );
  const [userData, setUserData] = useState({});
  const [tomorrowSession, setTomorrowSession] = useState([]);
  const [tomorrowSessionFilterText, setTomorrowSessionFilterText] =
    useState("");
  const [tomorrowSessionToBeDisplayed, setTomorrowSessionToBeDisplayed] =
    useState([]);
  const [counselors, setCounselors] = useState([
    { label: "All counselors", value: "allCounselors" },
  ]);
  const { userObj } = useReferenceContext();

  const [activeRow, setActiveRow] = useState({});
  const [selectedCounselor, setSelectedCounselor] = useState({
    label: "All counselors",
    value: "allCounselors",
  });
  const [loading, setLoading] = useState(false);
  const dropdownTodayRef = useRef(null);
  const dropdownTomorrowRef = useState(null);

  const handleEditSessionInfo = (row) => {
    setShowFlyout(true);
    setActiveData({ ...row, req_id: row.thrpy_req_id });
  };

  async function getCurrentSessionData(counselorId, role_id) {
    setLoading(true);
    let response;
    try {
      if (counselorId && counselorId !== "allCounselors") {
        response = await CommonServices.getCurrentSessions({
          counselor_id: counselorId,
          role_id: role_id,
        });
      } else {
        const payload = {
          // counselor_id: counselorId,
          role_id: role_id,
        };
        if (role_id != 4) {
          payload.tenant_id = userObj?.tenant_id;
        }

        // console.log(counselors, "counselors");
        response = await CommonServices.getCurrentSessions(payload);
      }
      if (response?.status === 200) {
        setTodaySession(response?.data?.session_today);
        setTodaySessionToBeDisplayed(response?.data?.session_today);
        setTomorrowSession(response?.data?.session_tomorrow);
        setTomorrowSessionToBeDisplayed(response?.data?.session_tomorrow);
      }
    } catch (error) {
      console.log(":: CurrentSession.getCurrentSessionData()", error);
    } finally {
      setLoading(false);
    }
  }

  // fun to handle when user click on action buttons
  const handleCellClickTodaySession = (row) => {
    setActiveRow(row);
    setTodaySessionToBeDisplayed((prev) => {
      const data = prev?.map((session) => {
        if (session?.session_id === row?.session_id)
          return { ...session, active: !session.active };
        else return session;
      });
      return data;
    });
  };
  const handleCellClickTomorrowSession = (row) => {
    setTomorrowSessionToBeDisplayed((prev) => {
      const data = prev?.map((session) => {
        if (session?.session_id === row?.session_id)
          return { ...session, active: !session.active };
        else return session;
      });
      return data;
    });
  };

  // handleEdit in action Buttons
  const handleEdit = (row) => {
    setRowToEdit(row);
  };

  // handleDelete in action Buttons
  const handleDelete = (row) => {
    console.log(":: handleDelete");
  };

  // getting today Session Columns
  const todayColumns = SESSION_TABLE_COLUMNS({
    handleCellClick: handleCellClickTodaySession,
    handleEdit,
    handleDelete,
    dropdownRef: dropdownTodayRef,
  });
  // getting tomorrow Session columns
  const tomorrowColumns = SESSION_TABLE_COLUMNS({
    handleCellClick: handleCellClickTomorrowSession,
    handleEdit,
    handleDelete,
    dropdownRef: dropdownTomorrowRef,
  });

  // Add omit to hide and show columns
  const [todaySessionVisibleColumns, setTodaySessionVisibleColumns] = useState(
    todayColumns?.map((column) => ({ ...column, omit: false }))
  );
  const [tomorrowSessionVisibleColumns, setTomorrowSessionVisibleColumns] =
    useState(tomorrowColumns?.map((column) => ({ ...column, omit: false })));

  // fun to hide and show columns based on selcted column in options dropdowns in Today session Table
  const handleTodaySessionColumnsToggle = (column) => {
    setTodaySessionVisibleColumns((prev) => {
      return prev?.map((item) => {
        if (item?.name === column?.name) {
          return { ...item, omit: !item.omit };
        } else {
          return item;
        }
      });
    });
  };
  // fun to hide and show columns based on selected column in options dropdwon in Tomorrow session Table
  const handleTomorrowSessionColumnsToggle = (column) => {
    setTomorrowSessionVisibleColumns((prev) => {
      return prev?.map((item) => {
        if (item?.name === column?.name) {
          return { ...item, omit: !item.omit };
        } else {
          return item;
        }
      });
    });
  };

  // fun to make all columns visible in Today Session Tab
  const handleShowAllTodaySessionColumns = () => {
    setTodaySessionVisibleColumns((prev) => {
      return prev?.map((item) => {
        return { ...item, omit: false };
      });
    });
  };
  // fun to make all columns visible in Tomorrow Session Tab
  const handleShowAllTomorrowColumns = () => {
    setTomorrowSessionVisibleColumns((prev) => {
      return prev?.map((item) => {
        return { ...item, omit: false };
      });
    });
  };

  // fun to close action menu when click outside
  const handleClickOutsideTodaySessionTable = (e) => {
    if (
      dropdownTodayRef.current &&
      !dropdownTodayRef.current.contains(e.target)
    ) {
      setTodaySessionToBeDisplayed((prev) => {
        return prev?.map((session) => {
          return { ...session, active: false };
        });
      });
    }
  };
  const handleClickOutsideTomorrowSessionTable = (e) => {
    if (
      dropdownTomorrowRef.current &&
      !dropdownTomorrowRef.current.contains(e.target)
    ) {
      setTomorrowSessionToBeDisplayed((prev) => {
        return prev?.map((session) => {
          return { ...session, active: false };
        });
      });
    }
  };

  useEffect(() => {
    window.addEventListener("mousedown", handleClickOutsideTodaySessionTable);

    return () => {
      window.removeEventListener(
        "mousedown",
        handleClickOutsideTodaySessionTable
      );
    };
  }, []);

  useEffect(() => {
    window.addEventListener(
      "mousedown",
      handleClickOutsideTomorrowSessionTable
    );

    return () => {
      window.removeEventListener(
        "mousedown",
        handleClickOutsideTomorrowSessionTable
      );
    };
  }, []);

  // creating heading and subHeadings to pass in CustomButtopn => to implement functiaonlity of options => in Today Session Table
  let todaySubHeadings = todaySessionVisibleColumns
    ?.filter((columns) => columns?.name)
    ?.map((column) => ({
      ...column,
      toggleIcon: true,
      onClick: () => handleTodaySessionColumnsToggle(column),
    }));
  const todaySessionOptions = [
    {
      heading: "Show/Hide Columns",
      subHeadings: todaySubHeadings,
    },
  ];
  // creating heading and subheading to pass in CustomOptions => to implement functionality of option => in TomorrowSession Table
  const tomorrowSubHeadings = tomorrowSessionVisibleColumns
    ?.filter((columns) => columns?.name)
    ?.map((column) => ({
      ...column,
      toggleIcon: true,
      onClick: () => handleTomorrowSessionColumnsToggle(column),
    }));
  const tomorrowSessionOptions = [
    {
      heading: "Show/Hide Columns",
      subHeadings: tomorrowSubHeadings,
    },
  ];

  // Component to show footer in Options in Today Session Columns
  const renderTodaySessionFooter = () => (
    <div
      style={{
        borderTop: "1px solid #ccc",
        cursor: "pointer",
        fontSize: "13px",
        fontWeight: 500,
        lineHeight: "15.6px",
        letterSpacing: "-0.02em",
        textAlign: "left",
        padding: "7px 10px",
        margin: "0px",
      }}
    >
      <p
        style={{
          margin: "0px",
          display: "flex",
          alignItems: "center",
          alignItems: "center",
          gap: "5px",
        }}
        onClick={() => handleShowAllTodaySessionColumns()}
      >
        <OpenEyeIcon />
        Show All columns
      </p>
    </div>
  );
  // Components to show footer in Options in Tomorrow Session Columns
  const renderTomorrowSessionFooter = () => (
    <div
      style={{
        borderTop: "1px solid #ccc",
        cursor: "pointer",
        fontSize: "13px",
        fontWeight: 500,
        lineHeight: "15.6px",
        letterSpacing: "-0.02em",
        textAlign: "left",
        padding: "7px 10px",
        margin: "0px",
      }}
    >
      <p
        style={{
          margin: "0px",
          display: "flex",
          alignItems: "center",
          gap: "5px",
        }}
        onClick={() => handleShowAllTomorrowColumns()}
      >
        <OpenEyeIcon />
        Show All columns
      </p>
    </div>
  );

  const updateTodaySessionToDisplay = () => {
    let filteredData = todaySession;
    if (todaySessionFilterText) {
      // Traversing all rows
      filteredData = filteredData?.filter((row) => {
        // Traversing each column of a particular row
        return Object.keys(row)?.some((columnKey) => {
          const value = row[columnKey];
          const rowColumns = todaySessionVisibleColumns || [];
          const isColumnKeyFound = rowColumns?.some(
            (col) => col?.selectorId === columnKey
          );
          if (isColumnKeyFound) {
            const text = value
              ?.toString()
              ?.toLowerCase()
              ?.trim()
              ?.includes(
                todaySessionFilterText?.toString()?.toLowerCase()?.trim()
              );
            return text;
          }
        });
      });
    }
    setTodaySessionToBeDisplayed(filteredData);
  };
  const updateTomorrowySessionToDisplay = () => {
    let filteredData = tomorrowSession;
    if (tomorrowSessionFilterText) {
      // Traversing all rows
      filteredData = filteredData?.filter((row) => {
        // Traversing each column of a particular row
        return Object.keys(row)?.some((columnKey) => {
          const value = row[columnKey];
          const rowColumns = tomorrowSessionVisibleColumns || [];
          const isColumnKeyFound = rowColumns?.some(
            (col) => col?.selectorId === columnKey
          );
          if (isColumnKeyFound) {
            const text = value
              ?.toString()
              ?.toLowerCase()
              ?.trim()
              ?.includes(
                tomorrowSessionFilterText?.toString()?.toLowerCase()?.trim()
              );
            return text;
          }
        });
      });
    }
    setTomorrowSessionToBeDisplayed(filteredData);
  };

  const fetchCounsellor = async () => {
    if (!userData?.tenant_id) return;
    try {
      setLoading(true);
      const response = await CommonServices.getClients();
      if (response.status === 200) {
        const { data } = response;
        const allCounselors = data?.rec?.filter(
          (counselor) =>
            counselor?.role_id == 2 &&
            counselor?.tenant_id === userData?.tenant_id
        );
        const counselorOptions = allCounselors?.map((item) => ({
          label: item?.user_first_name + " " + item?.user_last_name,
          value: item?.user_profile_id,
        }));
        setCounselors([
          { label: "All counselors", value: "allCounselors" },
          ...counselorOptions,
        ]);
        setSelectedCounselor({
          label: "All counselors",
          value: "allCounselors",
        });
      }
    } catch (error) {
      console.log("Error fetching clients", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCounselor = (data) => {
    setSelectedCounselor(data);
    const counselorId = data?.value;
    if (userData.role_id === 4 || userData.role_id === 3) {
      getCurrentSessionData(counselorId, userData?.role_id);
    } else {
      getCurrentSessionData(counselorId);
    }
  };

  useEffect(() => {
    if (userData && Object.keys(userData).length > 0) {
      if (userData?.role_id == 4 || userData?.role_id == 3) {
        fetchCounsellor();
        getCurrentSessionData("allCounselors", userData?.role_id);
      } else {
        getCurrentSessionData(userData?.user_profile_id, userData?.role_id);
      }
    }
  }, [userData]);

  useEffect(() => {
    updateTodaySessionToDisplay();
  }, [todaySessionFilterText]);

  useEffect(() => {
    updateTomorrowySessionToDisplay();
  }, [tomorrowSessionFilterText]);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const userObj = JSON.parse(userData);
    setUserData(userObj);
  }, []);

  useEffect(() => {
    if (userData && Object.keys(userData).length > 0) {
      userData?.role_id == 4 || userObj?.role_id == 3
        ? fetchCounsellor()
        : getCurrentSessionData(userObj?.user_profile_id, userObj?.role_id);
    }
  }, [userData]);

  return (
    <>
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
      <CurrentSessionHeadingWrapper>
        <div className="header-wrapper">
          <h2>Current Session</h2>
          <p>
            Page tracking active client sessions, displaying service names,
            start times, and real-time updates for seamless session management.
          </p>
        </div>
        <div className="today-header">
          <div className={"today"}>Today Session</div>
          <div style={{ display: "flex", gap: "20px" }}>
            <CustomSearch
              filterText={todaySessionFilterText}
              onFilter={(e) => setTodaySessionFilterText(e.target.value)}
              placeholder="Search in today session"
            />
            <div>
              {userData?.role_id == 4 || userData?.role_id == 3 ? (
                <div key="counselor-select" className="custom-select-container">
                  <CustomMultiSelect
                    options={counselors}
                    onChange={handleSelectCounselor}
                    value={selectedCounselor}
                    isMulti={false}
                    placeholder="Select a counselor"
                  />
                </div>
              ) : null}
            </div>
            <div style={{ position: "relative" }}>
              <CustomButton
                icon={<SettingsIcon />}
                title={"Columns"}
                dropdownOptions={todaySessionOptions}
                renderFooter={renderTodaySessionFooter}
              />
            </div>
          </div>
        </div>

        <CustomTable
          columns={todaySessionVisibleColumns}
          data={todaySessionToBeDisplayed}
          loading={loading}
          selectableRows={false}
          pagination
          paginationRowsPerPageOptions={[5, 10, 15, 20, 25]}
          paginationPerPage={5}
          onRowclick={handleEditSessionInfo}
        />
        <div className={"tomorrow-header"}>
          <div className={"tomorrow"}>Tomorrow Session</div>
          {tomorrowSession?.length > 0 && (
            <div style={{ display: "flex", gap: "30px" }}>
              <CustomSearch
                filterText={tomorrowSessionFilterText}
                onFilter={(e) => setTomorrowSessionFilterText(e.target.value)}
                placeholder="Search in tomorrow session"
              />
              <div style={{ position: "relative" }}>
                <CustomButton
                  icon={<SettingsIcon />}
                  title={"Columns"}
                  dropdownOptions={tomorrowSessionOptions}
                  renderFooter={renderTomorrowSessionFooter}
                />
              </div>
            </div>
          )}
        </div>

        {!loading && (
          <CustomTable
            columns={tomorrowSessionVisibleColumns}
            data={tomorrowSessionToBeDisplayed}
            pagination
            paginationRowsPerPageOptions={[5, 10, 15, 20, 25]}
            paginationPerPage={5}
            onRowclick={handleEditSessionInfo}
            selectableRows={false}
          />
        )}
      </CurrentSessionHeadingWrapper>
    </>
  );
}

export default CurrentSession;
