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
import { toast } from "react-toastify";
import ToggleSwitch from "../CustomButton/ToggleButton";
import ApiConfig from "../../config/apiConfig";
import { api } from "../../utils/auth";
import { useRouter } from "next/router";

function CustomClientDetails({
  title,
  overview,
  itemsPerPage = 10,
  tableData = TABLE_DATA(),
  children,
  primaryButton,
  handleCreate,
  selectCounselor,
  handleSelectCounselor,
  handleSelectService,
  serviceOptions,
  tableCaption = "",
  loading,
  customTab,
  isHomeworkUpload,
  setHomeWorkUpload,
  session,
  counselor,
  setSelectedTenantId,
  getInvoice,
  ...props
}) {
  const [currentPage, setCurrentPage] = useState(0);
  const { userObj } = useReferenceContext();
  const { allCounselors } = useReferenceContext();

  // const dropdownAdjustedCounselors =
  //   allCounselors?.map((counselor) => ({
  //     label: counselor.user_first_name + " " + counselor.user_last_name,
  //     value: counselor.user_profile_id,
  //     tenant_id: counselor.tenant_id,
  //   })) || [];

  const [counselors, setCounselors] = useState([
    { label: "All counselors", value: "allCounselors" },
  ]);
  const uniqueManagersMap = new Map();
  const [allManager, setAllManagers] = useState(null);
  const [selectedManager, setSelectedManager] = useState(null);
  allManager?.forEach((user) => {
    if (!uniqueManagersMap.has(user.user_id)) {
      uniqueManagersMap.set(user.user_id, {
        label: `${user.user_first_name} ${user.user_last_name}`,
        value: user.user_id,
        tenant_id: user.tenant_id,
      });
    }
  });

  const managerOptions = [
    { label: "All Manager", value: "allManager", tenant_id: 0 },
    ...Array.from(uniqueManagersMap.values()),
  ];
  const fetchManagers = async () => {
    try {
      // setClientsLoading(true);
      const response = await CommonServices.getClients();
      if (response.status === 200) {
        const { data } = response;
        const filteredManagers = response?.data?.rec?.filter(
          (manager) => manager.role_id === 3
        );

        setAllManagers(filteredManagers);
      }
    } catch (error) {
      console.error("Error fetching clients", error);
    } finally {
      // setClientsLoading(false);
    }
  };
  const handleSelectManager = (selected) => {
    setSelectedManager(selected);
    setSelectedTenantId(selected);
    const matchingCounselors = allCounselors?.filter(
      (c) => c.tenant_id === selected.tenant_id
    );
    const uniqueCounselorsMap = new Map();
    matchingCounselors?.forEach((user) => {
      if (!uniqueCounselorsMap.has(user.user_id)) {
        uniqueCounselorsMap.set(user.user_id, {
          label: `${user.user_first_name} ${user.user_last_name}`,
          value: user.user_profile_id,
          tenant_id: user.tenant_id,
        });
      }
    });
    const counselorOptions = Array.from(uniqueCounselorsMap.values());
    setCounselors([
      { label: "All Counselor", value: "allCounselor", tenant_id: 0 },
      ...counselorOptions,
    ]);

    getInvoice("", selected?.tenant_id);
  };
  useEffect(() => {
    fetchManagers();
  }, []);

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
    // If no filter text, include all rows
    if (!filterText || filterText.trim() === "") {
      return true;
    }

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

  const handleServiceChange = (selected) => {
    handleSelectService(selected);
    setCurrentPage(0);
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
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const manager = userObj?.role_id == 3;
  const handleToggle = async (newState) => {
    try {
      let payload = {
        tenant_id: userObj?.tenant?.tenant_id,
        feature_name: "homework_upload_enabled",
        feature_value: newState.toString(),
      };
      const response = await api.put(
        `${ApiConfig.homeworkUpload.enableAndDisableUpload}`,
        payload
      );
      if (response?.status == 200) {
        setHomeWorkUpload(newState);
      }
      toast.success(response.data?.message);
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };
  const router = useRouter();
  const shouldHideButton =
    userObj?.role_id === 4 && router.pathname.includes("/services");
  return (
    <>
      <ClientDetailsContainer icon={<SearchIcon />}>
        <div className="content">
          <div className="tab-and-heading-container">
            <div className="custom-tab">{customTab}</div>
            <div className="heading-container">
              {/* <div className="heading">
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
              </div> */}
              <div>
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
                    {!shouldHideButton && primaryButton && (
                      <CustomButton
                        icon={<AddIcon />}
                        title={primaryButton}
                        onClick={handleCreate}
                        customClass="create-client-button"
                      />
                    )}
                  </div>
                  <div className="function-button">
                    {[3, 4].includes(user?.role_id) && handleSelectCounselor ? (
                      <div
                        key="counselor-select"
                        className="custom-select-container"
                      >
                        <CustomMultiSelect
                          options={
                            userObj.role_id === 4 ? counselors : counselor
                          }
                          onChange={handleSelectCounselor}
                          isMulti={false}
                          placeholder="Select a counselor"
                        />
                      </div>
                    ) : null}
                    {[4].includes(user?.role_id) &&
                      router.pathname === "/client-session" && (
                        <div
                          key="counselor-select"
                          className="custom-select-container"
                        >
                          <CustomMultiSelect
                            options={managerOptions}
                            onChange={handleSelectManager}
                            isMulti={false}
                            value={selectedManager}
                            placeholder="Select a manager"
                          />
                        </div>
                      )}
                    {router.pathname === "/services" &&
                    [4].includes(user?.role_id) ? (
                      <div
                        key="manager-select"
                        className="custom-select-container"
                      >
                        <CustomMultiSelect
                          options={serviceOptions}
                          onChange={handleServiceChange}
                          isMulti={false}
                          placeholder="Select a manager"
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
                    {!shouldHideButton && primaryButton && (
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
                        options={userObj.role_id === 4 ? counselors : counselor}
                        onChange={handleSelectCounselor}
                        isMulti={false}
                        placeholder="Select a counselor"
                      />
                    </div>
                  ) : null}
                  {[4].includes(user?.role_id) &&
                    router.pathname === "/client-session" && (
                      <div
                        key="counselor-select"
                        className="custom-select-container"
                      >
                        <CustomMultiSelect
                          options={managerOptions}
                          onChange={handleSelectManager}
                          isMulti={false}
                          value={selectedManager}
                          placeholder="Select a manager"
                        />
                      </div>
                    )}
                  {router.pathname === "/services" &&
                  [4].includes(user?.role_id) ? (
                    <div
                      key="manager-select"
                      className="custom-select-container"
                    >
                      <CustomMultiSelect
                        options={serviceOptions}
                        onChange={handleServiceChange}
                        isMulti={false}
                        placeholder="Select a manager"
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
                  {!shouldHideButton && primaryButton && (
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
            {manager && router.pathname === "/client-session" && (
              <ToggleSwitch
                isOn={isHomeworkUpload}
                title={"Enable Homwork upload for this counselor"}
                onToggle={handleToggle}
              />
            )}
          </div>

          <div className="table-filter">
            {children && <div className="children-wrapper">{children}</div>}
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
