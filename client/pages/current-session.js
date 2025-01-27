import React, { useEffect, useRef, useState } from "react";
import { CurrentSessionHeadingWrapper } from "../styles/current-session";
import { SESSION_TABLE_COLUMNS } from "../utils/constants";
import { api } from "../utils/auth";
import NotesModalContent from "../components/NotesModalContent";
import CustomTable from "../components/CustomTable";
import CustomSearch from "../components/CustomSearch";
import CustomButton from "../components/CustomButton";
import {
  ClosedEyeIcon,
  OpenEyeIcon,
  SettingsIcon,
} from "../public/assets/icons";

const handleSendMail = (row) => {
  console.log("::: Show alter Box", { ...row });
  alert(`Sending mail to clientId  ${row.client_id}`);
};

function CurrentSession() {
  const [rowToEdit, setRowToEdit] = useState();
  const [todaySession, setTodaySession] = useState([]);
  const [todaySessionFilterText, setTodaySessionFilterText] = useState("");
  const [todaySessionToBeDisplayed, setTodaySessionToBeDisplayed] = useState(
    []
  );
  const [tomorrowSession, setTomorrowSession] = useState([]);
  const [tomorrowSessionFilterText, setTomorrowSessionFilterText] =
    useState("");
  const [tomorrowSessionToBeDisplayed, setTomorrowSessionToBeDisplayed] =
    useState([]);

  const [activeRow, setActiveRow] = useState({});
  const [loading, setLoading] = useState(false);
  // const [noteData, setNoteData] = useState({
  //   isOpen: false,
  //   sessionId: null,
  //   notes: "",
  //   mode: "add",
  // });
  const dropdownTodayRef = useRef(null);
  const dropdownTomorrowRef = useState(null);

  // fun to get session data
  async function getCurrentSessionData() {
    setLoading(true);
    try {
      const response = await api.get(`/session/today?counselor_id=3`);
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

  // fun to open note
  // const handleNoteOpen = (row, mode) => {
  //   setNoteData({
  //     isOpen: true,
  //     sessionId: row.session_id,
  //     notes: row.notes || "",
  //     mode: mode,
  //   });
  // };

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
    console.log(":: handleDelete", row);
  };

  // getting today Session Columns
  const todayColumns = SESSION_TABLE_COLUMNS({
    // handleNoteOpen,
    // handleSendMail,
    handleCellClick: handleCellClickTodaySession,
    handleEdit,
    handleDelete,
    dropdownRef: dropdownTodayRef,
  });
  // getting tomorrow Session columns
  const tomorrowColumns = SESSION_TABLE_COLUMNS({
    // handleNoteOpen,
    // handleSendMail,
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

  // // fun to close notes modal
  // const handleNoteClose = () => {
  //   setNoteData({
  //     isOpen: false,
  //     sessionId: null,
  //     notes: "",
  //   });
  // };

  // // fun to save Notes
  // const handleSaveNotes = (updatedNotes) => {
  //   console.log(":: handleSaveNotes");
  //   const isTodaySession = todaySessionToBeDisplayed?.find(
  //     (session) => session?.session_id === noteData?.sessionId
  //   );
  //   if (isTodaySession) {
  //     setTodaySessionToBeDisplayed((prev) => {
  //       return prev?.map((session) => {
  //         if (session?.session_id === noteData?.sessionId)
  //           return { ...session, notes: updatedNotes };
  //         else return session;
  //       });
  //     });
  //   } else {
  //     setTomorrowSessionToBeDisplayed((prev) => {
  //       return prev?.map((session) => {
  //         if (session?.session_id === noteData?.sessionId)
  //           return { ...session, notes: updatedNotes };
  //         else return session;
  //       });
  //     });
  //   }
  //   handleNoteClose();
  // };
  // // fun to Edit Notes
  // const handleEditNote = (updatedNotes) => {
  //   console.log(":: handleEditNotes");
  //   const isTodaySession = todaySessionToBeDisplayed?.find(
  //     (session) => session?.session_id === noteData?.sessionId
  //   );
  //   if (isTodaySession) {
  //     setTodaySessionToBeDisplayed((prev) => {
  //       return prev?.map((session) => {
  //         if (session?.session_id === noteData?.sessionId)
  //           return { ...session, notes: updatedNotes };
  //         else return session;
  //       });
  //     });
  //   } else {
  //     setTomorrowSessionToBeDisplayed((prev) => {
  //       return prev?.map((session) => {
  //         if (session?.session_id === noteData?.sessionId)
  //           return { ...session, notes: updatedNotes };
  //         else return session;
  //       });
  //     });
  //   }
  //   handleNoteClose();
  // };

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

  useEffect(() => {
    updateTodaySessionToDisplay();
  }, [todaySessionFilterText]);

  useEffect(() => {
    updateTomorrowySessionToDisplay();
  }, [tomorrowSessionFilterText]);

  useEffect(() => {
    getCurrentSessionData();
  }, []);

  return (
    <CurrentSessionHeadingWrapper>
      <div className="header-wrapper">
        <h2>Current Session</h2>
        <p>
          Page tracking active client sessions, displaying service names, start
          times, and real-time updates for seamless session management.
        </p>
      </div>
      {todaySession?.length > 0 && (
        <div className="today-header">
          <div className={"today"}>Today Session</div>
          <div style={{ display: "flex", gap: "20px" }}>
            <CustomSearch
              filterText={todaySessionFilterText}
              onFilter={(e) => setTodaySessionFilterText(e.target.value)}
              placeholder="Search in today session"
            />
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
      )}

      <CustomTable
        columns={todaySessionVisibleColumns}
        data={todaySessionToBeDisplayed}
        loading={loading}
        pagination
        paginationRowsPerPageOptions={[5, 10, 15, 20, 25]}
        paginationPerPage={5}
      />
      {tomorrowSession?.length > 0 && (
        <div className={"tomorrow-header"}>
          <div className={"tomorrow"}>Tomorrow Session</div>
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
        </div>
      )}
      {!loading && (
        <CustomTable
          columns={tomorrowSessionVisibleColumns}
          data={tomorrowSessionToBeDisplayed}
          pagination
          paginationRowsPerPageOptions={[5, 10, 15, 20, 25]}
          paginationPerPage={5}
        />
      )}
      {/* <NotesModalContent
        noteData={noteData}
        setNoteData={setNoteData}
        isOpen={noteData.isOpen}
        onClose={handleNoteClose}
        saveNotes={noteData.notes ? handleEditNote : handleSaveNotes}
        initialNotes={noteData.notes}
        hidePagination
      /> */}
    </CurrentSessionHeadingWrapper>
  );
}

export default CurrentSession;
