import { useEffect, useState, useRef } from "react";
import { InvoiceContainer, ModalButtons } from "../styles/invoice";
import { api } from "../utils/auth";
import CustomTable from "../components/CustomTable";
import CustomModal from "../components/CustomModal";
import CustomInputField from "../components/CustomInputField";
import { FormProvider, useForm } from "react-hook-form";
import CustomButton from "../components/CustomButton";
import {
  AddIcon,
  ArrowIcon,
  DownloadIcon,
  OpenEyeIcon,
  SettingsIcon,
} from "../public/assets/icons";
import CustomTab from "../components/CustomTab";
import CustomSelect from "../components/CustomSelect";
import CustomMultiSelect from "../components/CustomMultiSelect";
import CustomSearch from "../components/CustomSearch";
import CommonServices from "../services/CommonServices";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import Spinner from "../components/common/Spinner";
import CustomPagination from "../components/CustomPagination";
import { DOWNLOAD_OPTIONS, SERVICE_FEE_INFO } from "../utils/constants";
import moment from "moment";
import { useReferenceContext } from "../context/ReferenceContext";
import ApiConfig from "../config/apiConfig";
import { Skeleton } from "@mui/material";

const Invoice = () => {
  const { userObj } = useReferenceContext();
  const [invoices, setInvoices] = useState(null);
  const [roleId, setRoleId] = useState(null);
  const [user, setUser] = useState(null);
  const [invoiceTableData, setInvoiceTableData] = useState([]);
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectCounselor, setSelectCounselor] = useState("allCounselors");
  const [filterText, setFilterText] = useState(null);
  const [loading, setLoading] = useState("tableData");
  const [counselors, setCounselors] = useState([
    { label: "All counselors", value: "allCounselors", email: "" },
  ]);
  const [invoiceData, setInvoiceData] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 9;
  const methods = useForm();
  const { setValue } = methods;
  const monthRef = useRef(null);
  const [allManagers, setAllManagers] = useState(null);
  const { allCounselors } = useReferenceContext();
  const uniqueManagersMap = new Map();
  const [selectCounselorEmail, setSelectCounselorEmail] = useState(null);
  const [counselorConfiguration, setCounselorConfiguration] = useState(null);
  const [managerSplitDetails, setManagerSplitDetails] = useState(null);
  allManagers?.forEach((user) => {
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
  const [selectedManager, setSelectedManager] = useState(null);
  const [filteredCounselors, setFilteredCounselors] = useState([]);
  const handleSelectManager = (selected) => {
    setSelectedManager(selected);
    //match
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
    setCounselors(counselorOptions);
    setFilteredCounselors(matchingCounselors);
    const tenant_id = selected?.tenant_id;
    fetchFilteredInvoices({ startDate, endDate, tenant_id });
    const counselorId = selected?.value;
    setSelectCounselor(counselorId);
  };
  const fetchAllSplit = async () => {
    if (selectCounselor === "allCounselors" && userObj.role_id === 3) {
      return;
    }
    try {
      const tenant_id = userObj?.tenant_id;
      const response = await api.get(
        `${ApiConfig.feeSplitManagment.getAllfeesSplit}?tenant_id=${tenant_id}` // this is to be changed using 1 for dummy data
      );
      if (response.status == 200) {
        console.log(response);
        setCounselorConfiguration(
          response?.data?.data?.counselor_specific_configurations
        );
        setManagerSplitDetails(response?.data?.data?.default_configuration);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };
  const formatDate = (date) => date.toLocaleDateString("en-CA");

  const setDefaultDates = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setStartDate(formatDate(start));
    setEndDate(formatDate(end));
    monthRef.current = now.getMonth();
  };

  useEffect(() => {
    setDefaultDates();
  }, []);

  useEffect(() => {
    if (userObj && Object.keys(userObj).length > 0) {
      const now = new Date();
      const nextMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        1,
        0,
        0,
        0
      );
      const timeUntilNextMonth = nextMonth.getTime() - now.getTime();

      const timeout = setTimeout(() => {
        setDefaultDates();
        fetchFilteredInvoices({
          counselorId: selectCounselor,
          startDate: formatDate(
            new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1)
          ),
          endDate: formatDate(
            new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0)
          ),
        });
      }, timeUntilNextMonth);

      return () => clearTimeout(timeout);
    }
  }, [selectCounselor, user, roleId, userObj]);

  const handleAddInvoiceNumber = (row) => {
    setOpen(true);
    setInvoiceData(row);
    setValue("invoice_nbr", "");
  };

  const columns = [
    {
      name: "Start Date",
      selector: (row) =>
        row?.intake_date
          ? moment(row.intake_date).startOf("month").format("YYYY-MM-DD")
          : "N/A",
      sortable: true,
      selectorId: "start date",
    },
    {
      name: "End Date",
      selector: (row) =>
        row?.intake_date
          ? moment(row.intake_date).endOf("month").format("YYYY-MM-DD")
          : "N/A",
      sortable: true,
      selectorId: "end date",
    },
    {
      name: "Service Date",
      selector: (row) => row.intake_date || "N/A",
      sortable: true,
      selectorId: "intake_date",
    },
    {
      name: "Invoice Number",
      selector: (row) => row?.invoice_nbr || "N/A",
      sortable: true,
      selectorId: "invoice_nbr",
      cell: (row) => {
        if (!row?.invoice_nbr) {
          return (
            <button
              style={{
                color: "#007bff",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                background: "transparent",
              }}
              onClick={() => handleAddInvoiceNumber(row)}
            >
              <AddIcon />
              Add invoice
            </button>
          );
        }
        return row?.invoice_nbr;
      },
    },
    {
      name: "Serial Number",
      selector: (row) => row.client_clam_num || "N/A",
      sortable: true,
      selectorId: "client_clam_num",
    },
    {
      name: "Service Type",
      selector: (row) => row?.service_name || "N/A",
      sortable: true,
      selectorId: "service_name",
      minWidth: "250px",
    },
    {
      name: "Status",
      selector: (row) => row?.session_status,
      selectorId: "session_status",
      cell: (row) => (
        <div
          style={{
            color:
              row.session_status?.toLowerCase() === "show" ? "green" : "red",
            pointerEvents: "none",
          }}
        >
          {row.session_status}
        </div>
      ),
      sortable: true,
    },
    {
      name: "Total Amount",
      selector: (row) => `$${Number(row.session_price).toFixed(4)}`,
      selectorId: "session_price",
    },
    {
      name: "Tax",
      selector: (row) =>
        row.session_taxes ? `$${Number(row.session_taxes).toFixed(4)}` : "NA",
      selectorId: "session_taxes",
    },
    {
      name: "Amt. to Counselor",
      selector: (row) =>
        `$${Number(
          row.session_price *
            (row.fee_split_management.counselor_share_percentage / 100)
        ).toFixed(4)}`,
      selectorId: "session_counselor_amt",
      minWidth: "150px",
    },
    {
      name: "Amt. to Admin",
      selector: (row) => `$${Number(row.session_system_amt).toFixed(4)}`,
      selectorId: "session_system_amt",
    },
  ];
  if (invoiceTableData && invoiceTableData.length > 0) {
  }
  const [visibleColumns, setVisibleColumns] = useState(
    columns?.map((col) => ({ ...col, omit: false }))
  );

  const toggleColumn = (field) => {
    setVisibleColumns((prev) =>
      prev.map((col) =>
        col.name === field ? { ...col, omit: !col.omit } : col
      )
    );
  };

  const handleCreateOrUpdateInvoice = async (data) => {
    try {
      setLoading("invoiceNumber");
      const payload = {
        session_id: invoiceData?.session_id,
        invoice_nbr: data?.invoice_nbr,
      };
      let response;
      if (!invoiceData?.invoice_nbr) {
        response = await api.post("/invoice", payload);
      } else {
        response = await api.put(
          `/session/?session_id=${invoiceData?.session_id}`,
          { invoice_nbr: data?.invoice_nbr }
        );
      }
      if (response.status === 200) {
        const successMessage = invoiceData?.invoice_nbr
          ? "Invoice updated successfully!"
          : "Invoice created successfully!";
        toast.success(successMessage);
        setInvoiceTableData((prevData) =>
          prevData.map((invoice) =>
            invoice.session_id === payload.session_id
              ? { ...invoice, invoice_nbr: payload.invoice_nbr }
              : invoice
          )
        );
      }
    } catch (error) {
      console.error("Error while creating invoice: ", error);
      toast.error(error?.message);
    } finally {
      setLoading(null);
      setOpen(false);
    }
  };

  const getInvoice = async () => {
    setLoading("tableData");
    try {
      let response;
      if (roleId == 2) {
        response = await api.get(
          `/invoice/multi?counselor_id=${user?.user_profile_id}&role_id=${roleId}`
        );
      } else {
        response = await api.get(
          `/invoice/multi?role_id=${roleId}&counselor_id=${user?.user_profile_id}`
        );
      }
      if (response.status === 200) {
        setInvoices(response?.data?.rec);
        setInvoiceTableData(response?.data?.rec?.rec_list);
      }
    } catch (error) {
      console.log(":: Invoice.getInvoice()", error);
    } finally {
      setLoading(null);
    }
  };
  const fetchCounsellor = async () => {
    try {
      // setClientsLoading(true);
      const response = await CommonServices.getClients();
      if (response.status === 200) {
        const { data } = response;
        const filteredManagers = response?.data?.rec?.filter(
          (manager) => manager.role_id === 3
        );
        setAllManagers(filteredManagers);

        const allCounselors = data?.rec?.filter(
          (client) =>
            client?.role_id === 2 && client?.tenant_id === user?.tenant_id
        );
        const counselorOptions = allCounselors?.map((item) => {
          return {
            label: item?.user_first_name + " " + item?.user_last_name,
            value: item?.user_profile_id,
            email: item?.email,
          };
        });
        setCounselors([...counselors, ...counselorOptions]);
      }
    } catch (error) {
      console.log("Error fetching clients", error);
    } finally {
      // setClientsLoading(false);
    }
  };
  const fetchFilteredInvoices = async ({
    counselorId,
    startDate,
    endDate,
    tenant_id,
  }) => {
    try {
      setLoading("tableData");
      const params = new URLSearchParams();
      params.append("role_id", Number(userObj?.role_id));
      if (startDate) params.append("start_dte", startDate);
      if (endDate) params.append("end_dte", endDate);
      if (tenant_id || tenant_id !== undefined) {
        if (tenant_id) params.append("tenant_id", tenant_id);
        const response = await api.get(`/invoice/multi?${params}`);
        if (response?.status === 200) {
          setInvoices(response?.data?.rec);
          setInvoiceTableData(response?.data?.rec?.rec_list);
        }
      }
      // Only append counselor_id if it's not "allCounselors"
      console.log(counselorId, "l");
      if (
        counselorId &&
        counselorId !== "allCounselors" &&
        counselorId !== "allManager"
      ) {
        params.append("counselor_id", counselorId);
      } else if (roleId === 2) {
        // If role is counselor (2), always send their own ID
        params.append("counselor_id", user?.user_profile_id);
      }
      // if (tenant_id) params.append("tenant_id", tenant_id);
      const response = await api.get(`/invoice/multi?${params}`);
      if (response?.status === 200) {
        setInvoices(response?.data?.rec);
        setInvoiceTableData(response?.data?.rec?.rec_list);
      }
    } catch (error) {
      console.error(":: Invoice.fetchFilteredInvoices()", error);
    } finally {
      setLoading(null);
    }
  };

  const handleSelectCounselor = (data) => {
    const counselorId = data?.value;
    setSelectCounselor(counselorId);
    setSelectCounselorEmail(data.email);
    const counselor = allCounselors.find((c) => c.user_id === counselorId);
    const tenant_id = counselor?.tenant_id;
    fetchFilteredInvoices({ counselorId, startDate, endDate, tenant_id });
  };

  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);
    fetchFilteredInvoices({
      counselorId: selectCounselor,
      startDate: newStartDate,
      endDate,
    });
  };

  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    setEndDate(newEndDate);
    fetchFilteredInvoices({
      counselorId: selectCounselor,
      startDate,
      endDate: newEndDate,
    });
  };
  const handleEdit = (row) => {
    setOpen(true);
    setValue("invoice_nbr", row?.invoice_nbr);
    setInvoiceData(row);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const onSubmit = async (values) => {
    try {
      const payload = {
        // invoice_nbr:89888,
        ...values,
        // session_id: 1825,
      };
      const resposne = await api.put(
        `/session/?session_id=${invoiceData?.session_id}/?`,
        JSON.stringify(payload)
      );
    } catch (error) {
      console.log(":: Invoice.onSubmit()", error);
    }
  };
  const updateInvoiceDataToDisplay = () => {
    let filteredData = invoices?.rec_list;
    if (filterText) {
      filteredData = filteredData?.filter((row) => {
        return Object.keys(row)?.some((columnKey) => {
          const value = row[columnKey];
          const rowColumns = columns || [];
          const isColumnKeyFound = rowColumns?.some(
            (col) => col?.selectorId === columnKey
          );
          if (isColumnKeyFound) {
            const text = value
              ?.toString()
              ?.toLowerCase()
              ?.trim()
              ?.includes(filterText?.toString()?.toLowerCase()?.trim());
            return text;
          }
        });
      });
    }
    setInvoiceTableData(filteredData);
  };

  const columnTitles = visibleColumns
    ?.filter((col) => col.name)
    .map((col) => ({
      ...col,
      onClick: () => toggleColumn(col.name),
      toggleIcon: true,
    }));

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

  useEffect(() => {
    updateInvoiceDataToDisplay();
  }, [filterText]);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setRoleId(parsedUser?.role_id || null);
    }
  }, []);

  useEffect(() => {
    if (userObj && Object.keys(userObj).length > 0) {
      if (roleId !== null && user) {
        if ([3, 4].includes(roleId)) {
          fetchFilteredInvoices({
            counselorId: "allCounselors",
            startDate,
            endDate,
            ...(userObj?.role_id === 3 && { tenant_id: userObj?.tenant_id }),
          });
        } else {
          getInvoice();
        }
        fetchCounsellor();
      }
    }
  }, [roleId, user]);

  const paginatedData = invoiceTableData?.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const columnOptions = [];

  if (paginatedData && paginatedData.length > 0) {
    columnOptions.push({
      heading: "Show/Hide Columns",
      subHeadings: columnTitles,
    });
  }
  useEffect(() => {
    if (userObj && Object.keys(userObj).length > 0) {
      fetchAllSplit();
    }
  }, [selectCounselorEmail, userObj]);
  if (roleId === null) {
    return null;
  }

  return (
    <InvoiceContainer>
      <div className="top-section-wrapper">
        <h1>Invoices List</h1>
        <p>
          The Invoices List provides a detailed overview of all invoices
          generated, enabling easy tracking and management of billing records.
          View key details such as invoice numbers, client names, due dates,
          statuses, and total amounts at a glance.
        </p>

        <div className="tab-and-search-container">
          <div className="tab-container" style={{ marginTop: "12px" }}>
            <CustomTab
              heading={"Total Amount For A Month"}
              value={
                loading ? (
                  <Skeleton width={120} height={40} />
                ) : userObj?.role_id === 2 ? (
                  `$${Number(
                    invoices?.summary?.sum_session_total_amount
                  ).toFixed(4)}`
                ) : userObj?.role_id === 3 ? (
                  <>
                    Total Amount :{" $"}
                    {Number(
                      invoices?.summary?.sum_session_total_amount
                    ).toFixed(4)}
                  </>
                ) : userObj?.role_id === 4 ? (
                  <>
                    Total Amount :{" $"}
                    {Number(
                      invoices?.summary?.sum_session_total_amount
                    ).toFixed(4)}
                  </>
                ) : (
                  ""
                )
              }
            />
            {userObj?.role_id !== 4 && (
              <CustomTab
                heading="Monthly Associate Total:"
                value={
                  loading ? (
                    <Skeleton width={120} height={40} />
                  ) : userObj?.role_id === 2 ? (
                    `$${Number(
                      invoices?.summary?.sum_session_counselor_tenant_amt
                    ).toFixed(4)}`
                  ) : userObj?.role_id === 3 ? (
                    `$${Number(
                      invoices?.summary?.sum_session_counselor_amt
                    ).toFixed(4)}`
                  ) : (
                    ""
                  )
                }
              />
            )}
            <CustomTab
              heading="Detail breakdown"
              value={
                loading ? (
                  <Skeleton width={200} height={40} />
                ) : userObj?.role_id === 2 ? (
                  <>
                    <p>
                      Counsellor Share:{" $"}
                      {Number(
                        invoices?.summary?.sum_session_counselor_amt
                      ).toFixed(4)}{" "}
                      (
                      {
                        invoices?.summary?.fee_split_management
                          ?.counselor_share_percentage
                      }
                      %)
                    </p>
                    Tenant Share:{" $"}
                    {(
                      Number(invoices?.summary?.sum_session_tenant_amt) +
                      Number(invoices?.summary?.sum_session_system_amt)
                    ).toFixed(4)}{" "}
                    (
                    {
                      invoices?.summary?.fee_split_management
                        ?.tenant_share_percentage
                    }
                    %)
                  </>
                ) : userObj?.role_id === 3 ? (
                  <>
                    {/* Counsellor Share:{" "}
                    {Number(invoices?.summary?.sum_session_counselor_amt).toFixed(4)}
                    <br /> */}
                    Your Share:{" $"}
                    {Number(invoices?.summary?.sum_session_tenant_amt).toFixed(
                      4
                    )}
                  </>
                ) : userObj?.role_id === 4 ? (
                  <>
                    <p>
                      All Practice Amount:{" $"}
                      {Number(
                        invoices?.summary?.sum_session_total_amount
                      ).toFixed(4)}
                    </p>

                    <>
                      Counsellor Amount:{" $"}
                      {Number(
                        invoices?.summary?.sum_session_counselor_tenant_amt
                      ).toFixed(4)}{" "}
                      <br />
                      Tenant Amount:{" $"}
                      {Number(
                        invoices?.summary?.sum_session_tenant_amt
                      ).toFixed(4)}
                    </>
                  </>
                ) : (
                  ""
                )
              }
            />

            {(userObj?.role_id == 3 || userObj?.role_id == 4) && (
              <CustomTab
                heading={"Tax (GST) "}
                value={
                  loading ? (
                    <Skeleton width={120} height={40} />
                  ) : (
                    `$${Number(invoices?.summary?.sum_session_taxes)?.toFixed(
                      4
                    )}`
                  )
                }
              />
            )}

            {userObj?.role_id == 4 ? (
              <CustomTab
                heading={"Monthly Vapendama Total:"}
                value={
                  loading ? (
                    <Skeleton width={120} height={40} />
                  ) : (
                    `$${Number(
                      invoices?.summary?.sum_session_system_amt
                    )?.toFixed(4)}`
                  )
                }
              />
            ) : (
              userObj?.role_id !== 2 && (
                <CustomTab
                  heading={"Admin Fee:"}
                  value={
                    loading ? (
                      <Skeleton width={120} height={40} />
                    ) : (
                      `$${Number(
                        invoices?.summary?.sum_session_system_amt
                      )?.toFixed(4)}`
                    )
                  }
                />
              )
            )}
            <CustomTab
              heading={"Total Amount of Units:"}
              value={
                loading ? (
                  <Skeleton width={120} height={40} />
                ) : (
                  invoices?.summary?.sum_session_system_units || 0
                )
              }
            />
          </div>
          <div className="search-container">
            <div className="search-and-select">
              <div className="custom-select-container">
                {[3, 4].includes(roleId) ? (
                  <>
                    {[4].includes(roleId) ? (
                      <div key="counselor-select">
                        <label>Managers</label>
                        <CustomMultiSelect
                          options={managerOptions}
                          placeholder="Select manager"
                          isMulti={false}
                          onChange={handleSelectManager}
                          value={selectedManager}
                        />
                      </div>
                    ) : (
                      <></>
                    )}
                    <div key="counselor-select">
                      <label>Counselor</label>
                      {/* <CustomSelect
                      name="counselor"
                      options={counselors}
                      value={selectCounselor}
                      onChange={handleSelectCounselor}
                      dropdownIcon={
                        <ArrowIcon style={{ transform: "rotate(90deg)" }} />
                      }
                      placeholder="Select a counselor"
                    /> */}
                      <CustomMultiSelect
                        options={counselors}
                        placeholder="Select a counselor"
                        isMulti={false}
                        onChange={handleSelectCounselor}
                        value={counselors.find(
                          (option) => option.value === selectCounselor
                        )}
                      />
                    </div>
                  </>
                ) : null}
                <div>
                  <label>Start Date</label>
                  <input
                    onChange={handleStartDateChange}
                    type="date"
                    value={startDate ? startDate : ""}
                    placeholder="Select start date"
                    className="date-fields"
                  />
                </div>
                <div>
                  <label>End Date</label>
                  <input
                    onChange={handleEndDateChange}
                    type="date"
                    value={endDate ? endDate : ""}
                    placeholder="Select end date"
                    className="date-fields"
                  />
                </div>
                <div className="custom-search-container">
                  <CustomSearch
                    filterText={filterText}
                    onFilter={(e) => setFilterText(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="downloads-container">
              <CustomButton
                icon={<DownloadIcon />}
                title="Download"
                dropdownOptions={DOWNLOAD_OPTIONS(
                  columns,
                  invoiceTableData,
                  "Invoices List"
                )}
              />
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
      <CustomTable
        columns={columns}
        data={paginatedData || []}
        onRowclick={(row) => handleEdit(row)}
        loading={loading === "tableData"}
        selectableRows={false}
        fixedHeaderScrollHeight="500px"
      />

      {/* Pagination controls */}
      {!loading && itemsPerPage < invoiceTableData?.length && (
        <CustomPagination
          totalItems={invoiceTableData?.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      )}

      <CustomModal
        isOpen={open}
        onRequestClose={handleClose}
        title={!invoiceData?.invoice_nbr ? "Add Invoice" : "Edit Invoice"}
      >
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(handleCreateOrUpdateInvoice)}>
            <CustomInputField
              name={"invoice_nbr"}
              title="string"
              placeholder="Enter Invoice number"
            />
            <ModalButtons>
              <CustomButton
                onClick={() => setOpen(false)}
                customClass="cancel-button"
                title="Cancel"
              />
              <CustomButton
                type="submit"
                customClass="save-button"
                style={{
                  padding: loading == "invoiceNumber" && "5.75px 12px",
                  minWidth: 127,
                }}
                title={
                  methods.getValues("invoice_nbr") == "" ? (
                    loading == "invoiceNumber" ? (
                      <Spinner width="25px" height="25px" />
                    ) : (
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <AddIcon />
                        Add Invoice
                      </div>
                    )
                  ) : loading == "invoiceNumber" ? (
                    <Spinner width="25px" height="25px" />
                  ) : (
                    "Update Invoice"
                  )
                }
              />
            </ModalButtons>
          </form>
        </FormProvider>
      </CustomModal>
    </InvoiceContainer>
  );
};
export default Invoice;
