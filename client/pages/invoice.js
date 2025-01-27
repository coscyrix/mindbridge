import { useEffect, useState } from "react";
import { InvoiceContainer, ModalButtons } from "../styles/invoice";
import { api } from "../utils/auth";
import CustomTable from "../components/CustomTable";
import CustomModal from "../components/CustomModal";
import CustomInputField from "../components/CustomInputField";
import { FormProvider, useForm } from "react-hook-form";
import CustomButton from "../components/CustomButton";
import { AddIcon, ArrowIcon } from "../public/assets/icons";
import CustomTab from "../components/CustomTab";
import CustomSelect from "../components/CustomSelect";
import CustomSearch from "../components/CustomSearch";
import CommonServices from "../services/CommonServices";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import Spinner from "../components/common/Spinner";
import ReactPaginate from "react-paginate";

const Invoice = () => {
  const [invoices, setInvoices] = useState(null);
  const [roleId, setRoleId] = useState(null);
  const [user, setUser] = useState(null);
  const [invoiceTableData, setInvoiceTableData] = useState([]);
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectCounselor, setSelectCounselor] = useState(null);
  const [filterText, setFilterText] = useState(null);
  const [loading, setLoading] = useState("tableData");
  const [counselors, setCounselors] = useState([]);
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
      const errorMessage = invoiceData?.invoice_nbr
        ? "Error while updating invoice."
        : "Error while creating invoice.";
      console.error("Error while creating invoice: ", error);
      toast.error(errorMessage);
    } finally {
      setLoading(null);
      setOpen(false);
    }
  };

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected);
  };

  const columns = [
    {
      name: "Service Date",
      selector: (row) => row.req_dte || "N/A",
      sortable: true,
      selectorId: "req_dte",
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
      selector: (row) => row.serial_number || "N/A",
      sortable: true,
      selectorId: "serial_number",
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
      name: "Total Amount (Monthly)",
      selector: (row) =>
        `$${Number(row.session_price || 0).toFixed(2)}` || "N/A",
      sortable: true,
      center: true,
      selectorId: "session_price",
    },
    {
      name: "Associate Amount (Monthly)",
      selector: (row) =>
        `$${Number(row.session_counselor_amt || 0).toFixed(2)}` || "N/A",
      sortable: true,
      center: true,
      selectorId: "session_counselor_amt",
    },
    {
      name: "Vapendama Amount (Monthly)",
      selector: (row) =>
        `$${Number(row.session_system_amt || 0).toFixed(2)}` || "N/A",
      sortable: true,
      center: true,
      selectorId: "session_system_amt",
    },
  ];

  const getInvoice = async () => {
    setLoading("tableData");
    try {
      let response;
      if (roleId == 2) {
        response = await api.get(
          `/invoice/multi?counselor_id=${user?.user_profile_id}&role_id=${roleId}`
        );
      } else {
        response = await api.get(`/invoice/multi?role_id=${roleId}`);
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
          (client) => client?.role_id === 2
        );
        const counselorOptions = allCounselors?.map((item) => {
          return {
            label: item?.user_first_name + " " + item?.user_last_name,
            value: item?.user_profile_id,
          };
        });
        setCounselors(counselorOptions);
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
      if (counselorId) params.append("counselor_id", counselorId);
      if (startDate) params.append("start_dte", startDate);
      if (endDate) params.append("end_dte", endDate);

      const response = await api.get(
        `/invoice/multi?role_id=${roleId}&${params.toString()}`
      );
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
          console.log(columnKey, "row");
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
    if (roleId !== null) {
      getInvoice();
      fetchCounsellor();
    }
  }, [roleId]);

  const paginatedData = invoiceTableData?.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  if (roleId === null) {
    return null;
  }

  console.log(paginatedData, "paginatedData");

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
                  ? Number(invoices?.summary?.sum_session_price).toFixed(2) || 0
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
            <div className="custom-search-container">
              <CustomSearch
                filterText={filterText}
                onFilter={(e) => setFilterText(e.target.value)}
              />
            </div>
            <div className="custom-select-container">
              {roleId == 4 ? (
                <div key="counselor-select">
                  <label>Counselor</label>
                  <CustomSelect
                    name="counselor"
                    options={counselors}
                    value={selectCounselor}
                    onChange={handleSelectCounselor}
                    dropdownIcon={
                      <ArrowIcon style={{ transform: "rotate(90deg)" }} />
                    }
                    placeholder="Select a counselor"
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
      <div style={{ width: "100%" }}>
        <ReactPaginate
          previousLabel={
            <CustomButton
              title="Previous"
              icon={<ArrowIcon />}
              disabled={currentPage === 0}
            />
          }
          nextLabel={
            <CustomButton
              title="Next"
              icon={<ArrowIcon />}
              disabled={
                currentPage === invoiceTableData?.length / itemsPerPage - 1
              }
            />
          }
          breakLabel={"..."}
          pageCount={Math.ceil(invoiceTableData?.length / itemsPerPage)}
          onPageChange={handlePageChange}
          containerClassName={"pagination"}
          activeClassName={"active"}
        />
      </div>

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
