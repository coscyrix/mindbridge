import React, { useEffect, useState } from "react";
import CustomTable from "../../components/CustomTable";
import CustomButton from "../../components/CustomButton";
import {
  AddIcon,
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
import CustomPagination from "../CustomPagination";
import { useReferenceContext } from "../../context/ReferenceContext";
import CommonServices from "../../services/CommonServices";
import CustomMultiSelect from "../CustomMultiSelect";
import Cookies from "js-cookie";

function CustomClientDetails({
  title,
  overview,
  itemsPerPage = 13,
  tableData = TABLE_DATA(),
  children,
  primaryButton,
  handleCreate,
  selectCounselor,
  handleSelectCounselor,
  tableCaption = "",
  loading,
  customTab,
  counselors: propCounselors,
  ...props
}) {
  const [currentPage, setCurrentPage] = useState(0);
  const { userObj } = useReferenceContext();
  const { allCounselors } = useReferenceContext();
  const dropdownAdjustedCounselors =
    allCounselors?.map((counselor) => ({
      label: counselor.user_first_name + " " + counselor.user_last_name,
      value: counselor.user_profile_id,
    })) || [];

  const counselors = propCounselors || [
    { label: "All counselors", value: "allCounselors" },
    ...dropdownAdjustedCounselors,
  ];
  const [visibleColumns, setVisibleColumns] = useState(
    tableData?.columns?.map((col) => ({ ...col, omit: false }))
  );
  const [user, setUser] = useState(null);

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

  const totalItems = filterText ? currentData.length : tableData?.data?.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const currentPageData = currentData?.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected);
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
    setCurrentPage(0);
  }, [filterText]);

  useEffect(() => {
    const userData = Cookies.get("user");
    setUser(JSON.parse(userData));
  }, []);

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
              <div>
                {[3, 4].includes(user?.role_id) && handleSelectCounselor ? (
                  <div
                    key="counselor-select"
                    className="custom-select-container"
                  >
                    <CustomMultiSelect
                      options={counselors}
                      onChange={handleSelectCounselor}
                      isMulti={false}
                      placeholder="Select a counselor"
                    />
                  </div>
                ) : null}
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
                  {[3, 4].includes(user?.role_id) && handleSelectCounselor ? (
                    <div
                      key="counselor-select"
                      className="custom-select-container"
                    >
                      <CustomMultiSelect
                        options={counselors}
                        onChange={handleSelectCounselor}
                        isMulti={false}
                        placeholder="Select a counselor"
                      />
                    </div>
                  ) : null}
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
            <CustomPagination
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          )}
        </div>
      </ClientDetailsContainer>
    </>
  );
}

export default CustomClientDetails;
