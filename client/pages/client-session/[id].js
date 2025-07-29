import React, { useEffect, useRef, useState } from "react";
import CustomSearch from "../../components/CustomSearch";
import CustomButton from "../../components/CustomButton";
import {
  DownloadIcon,
  MenuIcon,
  OpenEyeIcon,
  SettingsIcon,
} from "../../public/assets/icons";
import { ClientSessionContainer } from "../../styles/client-session";
import { useRouter } from "next/router";
import {
  CLIENT_SESSION_LIST_DATA_BY_ID,
  CONDITIONAL_ROW_STYLES,
  DOWNLOAD_OPTIONS,
} from "../../utils/constants";
import CustomTable from "../../components/CustomTable";
import HomeworkModal from "../../components/HomeworkModalContent";
import ConfirmationModal from "../../components/ConfirmationModal";
import NotesModalContent from "../../components/NotesModalContent";
import { api } from "../../utils/auth";
import { useReferenceContext } from "../../context/ReferenceContext";
const tabLabels = ["Primary", "Additional"];

function ClientDetails() {
  const [activeTab, setActiveTab] = useState(0);
  const [isWorkModalOpen, setIsWorkModalOpen] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [edit, setEdit] = useState({});
  const [loading, setLoading] = useState(true);
  const [clientDetails, setClientDetails] = useState(null);
  const [services, setServices] = useState(null);
  const [activeData, setActiveData] = useState(null);
  const [note, setNote] = useState("");
  const [filterText, setFilterText] = useState("");
  const router = useRouter();
  const { id } = router.query;
  const actionDropdownRef = useRef(null);
  const { userObj } = useReferenceContext();
  const admin = userObj?.role_id == 4;

  const handleCellClick = (row) => {
    setActiveData((prev) =>
      prev?.map((data) =>
        data.session_id === row.session_id
          ? { ...data, active: !data.active }
          : data
      )
    );
  };

  const handleEdit = (row) => {
    setEdit(row);
  };

  const handleDelete = (row) => {
    setActiveData((prev) =>
      prev?.filter((data) => data.session_id !== row.session_id)
    );
  };

  const columns = CLIENT_SESSION_LIST_DATA_BY_ID(
    handleCellClick,
    handleEdit,
    handleDelete,
    actionDropdownRef
  );
  const [visibleColumns, setVisibleColumns] = useState(
    columns?.map((col) => ({ ...col, omit: false }))
  );

  const filteredItems = activeData?.filter((item) => {
    return item.serviceDesc
      ? item.serviceDesc.toLowerCase().includes(filterText.toLowerCase())
      : item;
  });

  const toggleColumn = (field) => {
    setVisibleColumns((prev) =>
      prev.map((col) =>
        col.name === field ? { ...col, omit: !col.omit } : col
      )
    );
  };

  const handleTabChange = (index) => {
    setActiveTab(index);
    setActiveData(
      index === 0 ? services?.primaryServices : services?.additionalServices
    );
  };
  const renderFooter = () => (
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
        onClick={() =>
          setVisibleColumns(
            visibleColumns?.map((col) => ({ ...col, omit: false }))
          )
        }
      >
        <OpenEyeIcon />
        Show All columns
      </p>
    </div>
  );

  const columnTitles = visibleColumns
    ?.filter((col) => col.name)
    .map((col) => ({
      ...col,
      onClick: () => toggleColumn(col.name),
      toggleIcon: true,
    }));

  let columnOptions = [];

  // Add column titles to subHeadings
  columnOptions.push({
    heading: "Show/Hide Columns",
    subHeadings: columnTitles,
  });

  const handleOpenWorkModal = () => {
    setIsWorkModalOpen(true);
  };

  const handleCloseWorkModal = () => {
    setIsWorkModalOpen(false);
  };

  const handleOpenConfirmationModal = () => {
    setShowConfirmationModal(true);
  };

  const handleCloseConfirmationModal = () => {
    setShowConfirmationModal(false);
  };

  const handleCloseAddNoteModal = () => {
    setShowAddNoteModal(false);
    setNote("");
  };

  const handleAddNote = (note) => {
    handleCloseAddNoteModal();
    setNote("");
  };

  const fetchClientSessions = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/thrpyReq/?req_id=${id}&role_id=${userObj?.role_id}&user_profile_id=${userObj?.user_profile_id}`
      );
      if (response.status === 200) {
        setClientDetails(response?.data?.at(0));
        setServices({
          primaryServices:
            response?.data
              ?.at(0)
              .session_obj?.filter((services) => services.is_additional == 0) ||
            [],
          additionalServices:
            response?.data
              ?.at(0)
              .session_obj?.filter((services) => services.is_additional == 1) ||
            [],
        });
        setActiveData(
          response?.data
            ?.at(0)
            .session_obj?.filter((services) => services.is_additional == 0) ||
            []
        );
      }
    } catch (error) {
      console.error("Error while fetching client sessions :", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClickOutside = (e) => {
    if (
      actionDropdownRef?.current &&
      !actionDropdownRef?.current?.contains(e.target)
    ) {
      setActiveData((prev) => {
        return prev?.map((session) => {
          return { ...session, active: false };
        });
      });
    }
  };

  useEffect(() => {
    if (id && !clientDetails) {
      fetchClientSessions();
    }
  }, [id]);

  useEffect(() => {
    window.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <ClientSessionContainer>
      <div className="content-container">
        <div className="heading-container">
          <div className="heading">
            <h2>
              Client Session List for :&quot;{clientDetails?.service_name}&quot;
            </h2>
            <p style={{ textTransform: "capitalize" }}>
              {`# ${clientDetails?.client_clam_num || ""} ${
                clientDetails?.client_first_name.toLowerCase() || ""
              } ${clientDetails?.client_last_name.toLowerCase() || ""}`}
            </p>
          </div>
          <div className="search-container">
            <CustomSearch
              placeholder="Search by description"
              onFilter={(e) => setFilterText(e.target.value)}
              filterText={filterText}
            />
            <div className="add-button">
              <div className="column-visibility-dropdown">
                <CustomButton
                  icon={<SettingsIcon />}
                  title="Columns"
                  dropdownOptions={columnOptions}
                  renderFooter={renderFooter}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="mobile-button-group">
          <div className="button-group-left">
            <div className="tab">
              {tabLabels.map((tab, index) => (
                <button
                  key={index}
                  className={`${activeTab === index ? "active" : ""}`}
                  onClick={() => handleTabChange(index)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="action-dropdown">
              <div className="more-option-button">
                <CustomButton
                  icon={<MenuIcon />}
                  title="More Option"
                  dropdownOptions={DOWNLOAD_OPTIONS(
                    columns,
                    activeData,
                    `Client Session List for ${id}`
                  )}
                />
              </div>
              <div className="medium-screen-button">
                <CustomButton
                  icon={<DownloadIcon />}
                  title="Download"
                  dropdownOptions={DOWNLOAD_OPTIONS(
                    columns,
                    activeData,
                    `Client Session List for ${id}`
                  )}
                />
                <CustomButton
                  customClass="column-visibility-button"
                  icon={<SettingsIcon />}
                  title="Columns"
                  dropdownOptions={columnOptions}
                  renderFooter={renderFooter}
                />
                {!admin && (
                  <CustomButton
                    onClick={handleOpenWorkModal}
                    icon={<SettingsIcon />}
                    title="Upload and Send Homework"
                  />
                )}
                {!admin && (
                  <CustomButton
                    onClick={handleOpenConfirmationModal}
                    icon={<SettingsIcon />}
                    title="Send Consent Form"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="button-group">
          <div className="button-group-left">
            <div className="tab">
              {tabLabels.map((tab, index) => (
                <button
                  key={index}
                  className={`${activeTab === index ? "active" : ""}`}
                  onClick={() => handleTabChange(index)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <CustomButton
              icon={<DownloadIcon />}
              title="Download"
              dropdownOptions={DOWNLOAD_OPTIONS(
                columns,
                activeData,
                `Client Session List for ${id}`
              )}
            />
            <CustomButton
              icon={<SettingsIcon />}
              title="Columns"
              dropdownOptions={columnOptions}
              renderFooter={renderFooter}
            />
          </div>
          <div className="button-group-right">
            {!admin && (
              <CustomButton
                onClick={handleOpenWorkModal}
                icon={<SettingsIcon />}
                title="Upload and Send Homework"
              />
            )}
            {!admin && (
              <CustomButton
                onClick={handleOpenConfirmationModal}
                icon={<SettingsIcon />}
                title="Send Consent Form"
              />
            )}
          </div>
        </div>
        <CustomTable
          loading={loading}
          columns={visibleColumns}
          data={filteredItems}
          conditionalRowStyles={CONDITIONAL_ROW_STYLES?.clientSessionSchedule}
          fixedHeaderScrollHeight="650px"
        />
      </div>
      <HomeworkModal isOpen={isWorkModalOpen} onClose={handleCloseWorkModal} />
      <ConfirmationModal
        isOpen={showConfirmationModal}
        onClose={handleCloseConfirmationModal}
      />
      <NotesModalContent
        notes={note}
        setNotes={setNote}
        isOpen={showAddNoteModal}
        onClose={handleCloseAddNoteModal}
        saveNotes={handleAddNote}
      />
    </ClientSessionContainer>
  );
}

export default ClientDetails;
