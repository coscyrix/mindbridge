import { useEffect, useState } from "react";
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
import { DOWNLOAD_OPTIONS } from "../utils/constants";
import moment from "moment";

const Invoice = () => {
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
    { label: "All counselors", value: "allCounselors" },
  ]);
  const [invoiceData, setInvoiceData] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 9;
  const methods = useForm();
  const { setValue } = methods;

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
              row.session_status?.toLowerCase() == "show" ? "green" : "red",
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
      selector: (row) =>
        // `$${Number(row.session_price + row.session_gst).toFixed(2)}`
        `$${(Number(row.session_counselor_amt)+Number(row.session_system_amt)).toFixed(2)}`,
      selectorId: "session_price",
    },
    {
      name: "Tax",
      selector: (row) =>
        row.session_taxes ? `$${Number(row.session_taxes).toFixed(2)}` : "NA",
      selectorId: "session_taxes",
    },
    {
      name: "Amt. to Counselor",
      selector: (row) => `$${Number(row.session_counselor_amt).toFixed(2)}`,
      selectorId: "session_counselor_amt",
      minWidth: "150px",
    },
    {
      name: "Amt. to Admin",
      selector: (row) => `$${Number(row.session_system_amt).toFixed(2)}`,
      selectorId: "session_system_amt",
    },
  ];

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
        const allCounselors = data?.rec?.filter(
          (client) =>
            client?.role_id === 2 && client?.tenant_id === user?.tenant_id
        );
        const counselorOptions = allCounselors?.map((item) => {
          return {
            label: item?.user_first_name + " " + item?.user_last_name,
            value: item?.user_profile_id,
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
  const fetchFilteredInvoices = async ({ counselorId, startDate, endDate }) => {
    try {
      setLoading("tableData");
      const params = new URLSearchParams();
      params.append("role_id", roleId);
      
      // Only append counselor_id if it's not "allCounselors"
      if (counselorId && counselorId !== "allCounselors") {
        params.append("counselor_id", counselorId);
      } else if (roleId === 2) {
        // If role is counselor (2), always send their own ID
        params.append("counselor_id", user?.user_profile_id);
      }
      
      if (startDate) params.append("start_dte", startDate);
      if (endDate) params.append("end_dte", endDate);
      
      const response = await api.get(`/invoice/multi?${params.toString()}`);
      
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
    fetchFilteredInvoices({ counselorId, startDate, endDate });
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

  let columnOptions = [];

  // Add column titles to subHeadings
  columnOptions.push({
    heading: "Show/Hide Columns",
    subHeadings: columnTitles,
  });

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
    const userData = Cookies.get("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setRoleId(parsedUser?.role_id || null);
    }
  }, []);

  useEffect(() => {
    if (roleId !== null && user) {
      getInvoice();
      fetchCounsellor();
      if ([3, 4].includes(roleId)) {
        fetchFilteredInvoices({
          counselorId: "allCounselors",
          startDate,
          endDate,
        });
      }
    }
  }, [roleId, user]);

  const paginatedData = invoiceTableData?.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

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
          <div className="tab-container">
            <CustomTab
              heading={"Total Amount For A Month"}
              value={`$${
                invoices
                  ? (Number(invoices?.summary?.sum_session_counselor_amt)+Number(invoices?.summary?.sum_session_system_amt)).toFixed(2) || 0
                  : 0
              }`}
            />
            <CustomTab
              heading={"Total Amount to Associate for a Month: "}
              value={`$${
                invoices
                  ? Number(
                      invoices?.summary?.sum_session_counselor_amt
                    ).toFixed(2)
                  : 0
              }`}
            />
            <CustomTab
              heading={"Total Amount to Vapendama for a Month:"}
              value={`$${
                invoices
                  ? Number(invoices?.summary?.sum_session_system_amt).toFixed(2)
                  : 0
              }`}
            />
            <CustomTab
              heading={"Total Amount of Units:"}
              value={invoices?.summary?.sum_session_system_units || 0}
            />
          </div>
          <div className="search-container">
            <div className="search-and-select">
              <div className="custom-search-container">
                <CustomSearch
                  filterText={filterText}
                  onFilter={(e) => setFilterText(e.target.value)}
                />
              </div>
              <div className="custom-select-container">
                {[3, 4].includes(roleId) ? (
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
        columns={visibleColumns}
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
