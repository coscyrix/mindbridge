import React, { useState } from "react";
import CustomSearch from "../../components/CustomSearch";
import CustomButton from "../../components/CustomButton";
import {
  AddIcon,
  DownloadIcon,
  MenuIcon,
  OpenEyeIcon,
  SettingsIcon,
} from "../../public/assets/icons";
import { ClientSessionContainer } from "../../styles/client-session";
import { useRouter } from "next/router";
import {
  CLIENT_SESSION_LIST_DATA_BY_ID,
  DOWNLOAD_OPTIONS,
} from "../../utils/constants";
import CustomTable from "../../components/CustomTable";
import HomeworkModal from "../../components/HomeworkModalContent";
import ConfirmationModal from "../../components/ConfirmationModal";
import NotesModalContent from "../../components/NotesModalContent";
const tabLabels = ["Primary", "Additional"];

function ClientDetails() {
  const [activeTab, setActiveTab] = useState(0);
  const [isWorkModalOpen, setIsWorkModalOpen] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [edit, setEdit] = useState({});

  const [note, setNote] = useState("");

  const handleCellClick = (row) => {
    setActiveData((prev) => {
      return {
        columns: prev?.columns,
        data: prev?.data?.map((data) =>
          data.id === row.id ? { ...data, active: !data.active } : data
        ),
      };
    });
  };

  const handleEdit = (row) => {
    setEdit(row);
  };

  const handleDelete = (row) => {
    setActiveData((prev) => {
      return {
        ...prev,
        data: prev.data.filter((col) => col.id !== row.id),
      };
    });
  };

  const [activeData, setActiveData] = useState(
    CLIENT_SESSION_LIST_DATA_BY_ID(handleCellClick, handleEdit, handleDelete)
      .primaryServices || []
  );
  const [visibleColumns, setVisibleColumns] = useState(
    activeData?.columns?.map((col) => ({ ...col, omit: false }))
  );
  const [filterText, setFilterText] = useState("");
  const router = useRouter();
  const { id } = router.query;

  const filteredItems = activeData?.data?.filter((item) => {
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
      index === 0
        ? CLIENT_SESSION_LIST_DATA_BY_ID().primaryServices
        : CLIENT_SESSION_LIST_DATA_BY_ID().additionalServices
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

  const handleOpenAddNoteModal = () => {
    setShowAddNoteModal(true);
  };

  const handleCloseAddNoteModal = () => {
    setShowAddNoteModal(false);
    setNote("");
  };

  const handleAddNote = (note) => {
    handleCloseAddNoteModal();
    setNote("");
  };

  return (
    <ClientSessionContainer>
      <div className="content-container">
        <div className="heading-container">
          <div className="heading">
            <h2>Client Session List for id :&quot;{id}&quot;</h2>
            <p>#45678567 Mika</p>
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
              <CustomButton
                icon={<AddIcon />}
                title="Add/View Notes"
                customClass="add-view-notes"
                onClick={handleOpenAddNoteModal}
              />
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
                    activeData?.columns,
                    activeData?.data,
                    `Client Session List for ${id}`
                  )}
                />
              </div>
              <div className="medium-screen-button">
                <CustomButton
                  icon={<DownloadIcon />}
                  title="Download"
                  dropdownOptions={DOWNLOAD_OPTIONS(
                    activeData?.columns,
                    activeData?.data,
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
                <CustomButton
                  onClick={handleOpenWorkModal}
                  icon={<SettingsIcon />}
                  title="Upload and Send Homework"
                />
                <CustomButton
                  onClick={handleOpenConfirmationModal}
                  icon={<SettingsIcon />}
                  title="Send Consent Form"
                />
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
                activeData?.columns,
                activeData?.data,
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
            <CustomButton
              onClick={handleOpenWorkModal}
              icon={<SettingsIcon />}
              title="Upload and Send Homework"
            />
            <CustomButton
              onClick={handleOpenConfirmationModal}
              icon={<SettingsIcon />}
              title="Send Consent Form"
            />
            <CustomButton
              icon={<AddIcon />}
              title="Add/View Notes"
              customClass="add-view-notes"
              onClick={handleOpenAddNoteModal}
            />
          </div>
        </div>
        <CustomTable columns={visibleColumns} data={filteredItems} />
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
