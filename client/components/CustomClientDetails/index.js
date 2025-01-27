import React, { useEffect, useState } from "react";
import CustomTable from "../../components/CustomTable";
import CustomButton from "../../components/CustomButton";
import {
  AddIcon,
  ArrowIcon,
  DownloadIcon,
  SearchIcon,
  SettingsIcon,
  OpenEyeIcon,
  MenuIcon,
} from "../../public/assets/icons";
import CustomSearch from "../../components/CustomSearch";
import { TABLE_DATA } from "../../utils/constants";
import { ClientDetailsContainer } from "./style";
import { DOWNLOAD_OPTIONS } from "../../utils/constants";
import moment from "moment";

function CustomClientDetails({
  title,
  overview,
  itemsPerPage = 13,
  tableData = TABLE_DATA(),
  children,
  primaryButton,
  handleCreate,
  tableCaption = "",
  loading,
  customTab,
  ...props
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleColumns, setVisibleColumns] = useState(
    tableData?.columns?.map((col) => ({ ...col, omit: false }))
  );

  const [filterText, setFilterText] = useState("");

  const toggleColumn = (field) => {
    setVisibleColumns((prev) =>
      prev.map((col) =>
        col.name === field ? { ...col, omit: !col.omit } : col
      )
    );
  };

  const currentData = tableData?.data?.filter((row) => {
    return Object.keys(row).some((columnKey) => {
      const value = row[columnKey];

      const columns = tableData?.columns || [];
      const isColumnKeyFound = columns.some(
        (col) => col.selectorId === columnKey
      );

      if (isColumnKeyFound) {
        if (columnKey === "req_time") {
          const rawTime = row["req_time"];
          moment(rawTime, "HH:mm:ss.SSSZ").format("h:mm A");

          const formattedTime = moment
            .utc(row.req_time, "HH:mm:ss.SSSZ")
            .format("h:mm A");

          return formattedTime.includes(filterText.toLowerCase().trim());
        }

        if (columnKey === "created_at") {
          const rawDate = row["created_at"];
          const formattedDate = moment(rawDate, "YYYY-MM-DD")
            .format("D MMMM YY")
            .toLowerCase()
            .trim();

          return formattedDate.includes(filterText.toLowerCase().trim());
        }

        if (columnKey === "gst") {
          const gst = row["gst"] || 0;
          const mergedValue = Number(gst).toFixed(2).toString();

          return mergedValue
            .toLowerCase()
            .includes(filterText.toLowerCase().trim());
        }

        if (columnKey === "total_invoice") {
          const totalInvoice = row["total_invoice"] || 0;
          const mergedValue = Number(totalInvoice).toFixed(2).toString().trim();

          return mergedValue
            .toLowerCase()
            .includes(filterText.toLowerCase().trim());
        }

        if (columnKey === "total_invoice" || columnKey === "gst") {
          const totalInvoice = row["total_invoice"] || 0;
          const gst = row["gst"] || 0;
          const mergedValue = (Number(totalInvoice) + Number(gst))
            .toString()
            .trim();

          return mergedValue
            .toLowerCase()
            .includes(filterText.toLowerCase().trim());
        }

        if (columnKey === "user_first_name" || columnKey === "user_last_name") {
          const fullName = `${row["user_first_name"]} ${row["user_last_name"]}`
            .toLowerCase()
            .trim();
          return fullName.includes(filterText.toLowerCase().trim());
        }

        if (
          columnKey === "client_first_name" ||
          columnKey === "client_last_name"
        ) {
          const fullName =
            `${row["client_first_name"]} ${row["client_last_name"]}`
              .toLowerCase()
              .trim();

          return fullName.includes(filterText.toLowerCase().trim());
        }

        return value
          ?.toString()
          .toLowerCase()
          .includes(filterText.toString().toLowerCase().trim());
      }
    });
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const totalItems = filterText ? currentData.length : tableData?.data?.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const currentPageData = currentData?.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
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

  useEffect(() => {
    setCurrentPage(1);
  }, [filterText]);

  const formatDownloadOption = DOWNLOAD_OPTIONS(
    tableData?.columns,
    tableData?.data,
    tableCaption
  );

  return (
    <>
      <ClientDetailsContainer icon={<SearchIcon />}>
        <div className="content">
          <div className="tab-and-heading-container">
            <div className="custom-tab">{customTab}</div>
            <div className="heading-container">
              <div className="heading">
                <div className="heading-wrapper">
                  <div className="mobile-heading-wrapper">
                    <h2 className="heading-text">{title}</h2>
                    {primaryButton && (
                      <CustomButton
                        icon={<AddIcon />}
                        title={primaryButton}
                        onClick={handleCreate}
                        customClass="create-client-mobile-button"
                      />
                    )}
                  </div>
                  <p className="heading-desc">{overview}</p>
                </div>
                {children && <div className="children-wrapper">{children}</div>}
              </div>
              <div className="mobile-button-group">
                <div className="search">
                  <CustomSearch
                    onFilter={(e) => {
                      setFilterText(e.target.value);
                    }}
                    filterText={filterText}
                  />
                </div>
                <div className="dropdowns-container">
                  <div className="action-button-wrapper">
                    <CustomButton
                      icon={<MenuIcon />}
                      title="More Option"
                      dropdownOptions={DOWNLOAD_OPTIONS(
                        tableData?.columns,
                        tableData?.data,
                        tableCaption
                      )}
                    />
                  </div>
                  <div className="action-button-wrapper">
                    <CustomButton
                      icon={<SettingsIcon />}
                      dropdownOptions={columnOptions}
                      renderFooter={renderFooter}
                    />
                  </div>
                </div>
              </div>
              {/* Replace second CustomSearch usage */}
              <div className="button-group">
                <div className="search">
                  <CustomSearch
                    onFilter={(e) => setFilterText(e.target.value)}
                    filterText={filterText}
                  />
                </div>
                <div className="function-button">
                  <CustomButton
                    icon={<DownloadIcon />}
                    title="Download"
                    dropdownOptions={DOWNLOAD_OPTIONS(
                      tableData?.columns,
                      tableData?.data,
                      tableCaption
                    )}
                  />
                  <CustomButton
                    icon={<SettingsIcon />}
                    title="Columns"
                    dropdownOptions={columnOptions}
                    renderFooter={renderFooter}
                  />
                  {primaryButton && (
                    <CustomButton
                      icon={<AddIcon />}
                      title={primaryButton}
                      onClick={handleCreate}
                      customClass="create-client-button"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Table with Paginated Data */}
          <CustomTable
            columns={visibleColumns}
            data={currentPageData}
            loading={loading}
            {...props}
          />

          {/* Pagination Controls */}
          {!loading && itemsPerPage < totalItems && (
            <div className="pagination-controls">
              <CustomButton
                title="Previous"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                icon={<ArrowIcon />}
                customClass="prev-button"
              />

              {/* Page Numbers */}
              <div className="page-numbers">
                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index + 1}
                    className={`page-number ${
                      currentPage === index + 1 ? "active" : ""
                    }`}
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <CustomButton
                title="Next"
                onClick={handleNextPage}
                icon={<ArrowIcon />}
                disabled={currentPage === totalPages || !totalItems}
              />
            </div>
          )}
        </div>
      </ClientDetailsContainer>
    </>
  );
}

export default CustomClientDetails;
