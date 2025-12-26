import {
  AddIcon,
  BankIcon,
  ClientsManagementIcon,
  CsvIcon,
  DashboardIcon,
  DeleteIcon,
  EditIcon,
  ExcelIcon,
  InvoiceIcon,
  MenuIcon,
  PdfIcon,
  PrintIcon,
  ServiceIcon,
  SessionIcon,
  UsersIcon,
} from "../public/assets/icons";
import CustomButton from "../components/CustomButton";

import Dropdown from "../components/Dropdown";
import moment from "moment";
import { TooltipButton, TooltipContainer } from "../components/Tooltip";
import { convertUTCToLocalTime } from "./helper";
import { CgProfile } from "react-icons/cg";
import React, { useState, useRef } from "react";
import {
  IconButton,
  Popover,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Direction } from "react-data-table-component";

const ActionMenu = ({ row, handleEdit, handleDelete }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton onClick={handleClick}>
        <MoreVertIcon />
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <List dense style={{ flexDirection: "column" }}>
          <ListItem
            style={{ gap: "10px" }}
            button
            onClick={() => {
              handleEdit(row);
              handleClose();
            }}
          >
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            <ListItemText primary="Edit" />
          </ListItem>
          <ListItem
            style={{ gap: "10px" }}
            button
            onClick={() => {
              handleDelete(row);
              handleClose();
            }}
          >
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            <ListItemText primary="Delete" />
          </ListItem>
        </List>
      </Popover>
    </>
  );
};

function exportToCSV(columns, data, tableCaption) {
  const headings = columns
    .filter((column) => column.name)
    .map((column) => column.name);

  const rows = data.map((item) => {
    return columns.map((column) =>
      column.selector ? column.selector(item) : ""
    );
  });

  const csvContent = [headings, ...rows].map((row) => row.join(",")).join("\n");

  const link = document.createElement("a");
  const csvData = `data:text/csv;charset=utf-8,${encodeURIComponent(
    csvContent
  )}`;
  link.setAttribute("href", csvData);
  link.setAttribute("download", `${tableCaption}.csv`);

  link.click();
}

export function capitalizeName(name) {
  return name ? name.charAt(0).toUpperCase() + name.slice(1).toLowerCase() : "";
}

function formatTime(time) {
  return time ? moment.utc(time, "HH:mm:ss.SSSZ").format("h:mm A") : "N/A";
}

//For the pdfFunction proper functioning, give selectorId to each column
async function exportToPDF(columns, data, tableCaption) {
  const { jsPDF } = await import("jspdf");
  const autoTable = await import("jspdf-autotable");

  const doc = new jsPDF();

  const headings = columns
    .filter((column) => column.name)
    .map((column) => column.name);

  const rows = data.map((item) => {
    return columns
      .filter((column) => column.name)
      .map((column) => {
        if (column.name === "Client Name") {
          const firstName = capitalizeName(
            item.client_first_name || item.user_first_name
          );
          const lastName = capitalizeName(
            item.client_last_name || item.user_last_name
          );
          return `${firstName} ${lastName}`.trim();
        }

        if (column.name === "Session Time") {
          return formatTime(item.req_time);
        }

        if (column.selector) {
          return column.selector(item);
        }

        if (column.selectorId) {
          return item[column.selectorId] || "N/A";
        }

        return "N/A";
      });
  });

  doc.text(tableCaption, 20, 10);

  autoTable.default(doc, {
    head: [headings],
    body: rows,
  });

  doc.save(`${tableCaption}.pdf`);
}

async function exportToExcel(columns, data, tableCaption) {
  const XLSX = await import("xlsx");

  const headings = columns
    .filter((column) => column.name)
    .map((column) => column.name);

  const rows = data.map((item) => {
    return columns.map((column) =>
      column.selector ? column.selector(item) : ""
    );
  });

  const worksheetData = [headings, ...rows];

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();

  const safeSheetName = tableCaption.slice(0, 31);
  XLSX.utils.book_append_sheet(workbook, worksheet, safeSheetName);
  XLSX.writeFile(workbook, `${tableCaption}.xlsx`);
}

export const isWithin24Hours = (intake_date, scheduled_time) => {
  if (!intake_date || !scheduled_time) return false;
  const scheduledDateTime = moment.utc(`${intake_date}T${scheduled_time}`);
  const twentyFourHoursLater = scheduledDateTime.clone().add(24, "hours");
  const currentDateTime = moment.utc();
  return currentDateTime.isBefore(twentyFourHoursLater);
};

export const SIDEBAR_HEADINGS = [
  {
    id: 1,
    icon: <DashboardIcon />,
    url: "/dashboard",
    title: "Dashboard",
  },
  {
    id: 10,
    icon: <SessionIcon />,
    url: "/appointments",
    title: "Appointments",
  },
  {
    id: 2,
    icon: <ClientsManagementIcon />,
    url: "/client-management",
    title: "Clients Management",
  },
  {
    id: 3,
    icon: <BankIcon />,
    url: "/client-session",
    title: "Client Session Schedule",
  },
  {
    id: 4,
    icon: <SessionIcon />,
    url: "/current-session",
    title: "Current Session",
  },
  {
    id: 5,
    icon: <UsersIcon />,
    url: "/session-history",
    title: "Session History",
  },
  {
    id: 8,
    icon: <UsersIcon />,
    url: "/onboarding",
    title: "Profile",
  },
  {
    id: 6,
    icon: <ServiceIcon />,
    url: "/services",
    title: "Service",
  },
  {
    id: 7,
    icon: <InvoiceIcon />,
    url: "/invoice",
    title: "Invoice",
  },
  {
    id: 8,
    icon: <DashboardIcon />,
    url: "/consent-management",
    title: "Consent Management",
  },
  {
    id: 9,
    icon: <DashboardIcon />,
    url: "/fee-split-management",
    title: "Fee Split Management",
  },
  // {
  //   id: 10,
  //   icon: <DashboardIcon />,
  //   url: "/logo-management",
  //   title: "Logo Managment",
  // },
];

// React Query Keys
export const QUERY_KEYS = {
  APPOINTMENTS: (userProfileId) => ["appointments", userProfileId],
};

export const TABLE_DATA = (handleCellClick, handleEdit, handleDelete) => {
  return {
    columns: [
      {
        name: "ID",
        selector: (row) => row.id,
        sortable: true,
        width: "100px",
        omit: false,
      },
      {
        name: "Serial Number",
        selector: (row) => row.serialNumber,
        sortable: true,
      },
      {
        name: "Client Name",
        selector: (row) => row.clientName,
        sortable: true,
      },
      {
        name: "Phone Number",
        selector: (row) => row.phoneNumber,
        sortable: true,
      },
      {
        name: "Client Email",
        selector: (row) => row.clientEmail,
        sortable: true,
        width: "300px",
      },
      {
        name: "",
        cell: (row) => (
          <div style={{ cursor: "pointer", position: "relative" }}>
            <div
              onClick={(e) => {
                handleCellClick(row);
              }}
            >
              <MenuIcon />
            </div>
            {row.active && (
              <div>
                <TooltipContainer>
                  <div
                    onClick={(e) => {
                      handleCellClick(row);
                      handleEdit(row);
                    }}
                  >
                    <TooltipButton title="Edit" icon={<EditIcon />} />
                  </div>
                  <div
                    onClick={(e) => {
                      handleCellClick(row);
                      handleDelete(row);
                    }}
                  >
                    <TooltipButton
                      title="Delete"
                      icon={<DeleteIcon />}
                      color="#d30028"
                    />
                  </div>
                </TooltipContainer>
              </div>
            )}
          </div>
        ),
        width: "50px",
        allowOverflow: true,
        button: true,
      },
    ],

    data: [
      {
        id: 69,
        serialNumber: 4433333,
        clientName: "Monday Client",
        phoneNumber: 4433333,
        clientEmail: "vapendamatesting@gmail.com",
      },
      {
        id: 71,
        serialNumber: 4333222,
        clientName: "Monday Client2",
        phoneNumber: 332222,
        clientEmail: "vapendamatesting@gmail.com",
      },
      {
        id: 72,
        serialNumber: 4433333,
        clientName: "July Client",
        phoneNumber: 4433333,
        clientEmail: "vapendamatesting@gmail.com",
      },
      {
        id: 73,
        serialNumber: 4433333,
        clientName: "Monday Client",
        phoneNumber: 4433333,
        clientEmail: "vapendamatesting@gmail.com",
      },
      {
        id: 74,
        serialNumber: 4433333,
        clientName: "Monday Client",
        phoneNumber: 4433333,
        clientEmail: "vapendamatesting@gmail.com",
      },
      {
        id: 75,
        serialNumber: 4433333,
        clientName: "Monday Client",
        phoneNumber: 4433333,
        clientEmail: "vapendamatesting@gmail.com",
      },
      {
        id: 76,
        serialNumber: 4433333,
        clientName: "Monday Client",
        phoneNumber: 4433333,
        clientEmail: "vapendamatesting@gmail.com",
      },
      {
        id: 77,
        serialNumber: 4433333,
        clientName: "Monday Client",
        phoneNumber: 4433333,
        clientEmail: "vapendamatesting@gmail.com",
      },
      {
        id: 1,
        serialNumber: 1,
        clientName: "Monday Client",
        phoneNumber: 4433333,
        clientEmail: "vapendamatesting@gmail.com",
      },
      {
        id: 2,
        serialNumber: 2,
        clientName: "Monday Client",
        phoneNumber: 4433333,
        clientEmail: "vapendamatesting@gmail.com",
      },
      {
        id: 3,
        serialNumber: 3,
        clientName: "Monday Client",
        phoneNumber: 4433333,
        clientEmail: "vapendamatesting@gmail.com",
      },
      {
        id: 4,
        serialNumber: 4,
        clientName: "Monday Client",
        phoneNumber: 4433333,
        clientEmail: "vapendamatesting@gmail.com",
      },
      {
        id: 5,
        serialNumber: 5,
        clientName: "Monday Client",
        phoneNumber: 4433333,
        clientEmail: "vapendamatesting@gmail.com",
      },
      {
        id: 6,
        serialNumber: 6,
        clientName: "Monday Client",
        phoneNumber: 4433333,
        clientEmail: "vapendamatesting@gmail.com",
      },
      {
        id: 7,
        serialNumber: 7,
        clientName: "Monday Client",
        phoneNumber: 4433333,
        clientEmail: "vapendamatesting@gmail.com",
      },
      {
        id: 9,
        serialNumber: 9,
        clientName: "Monday Client",
        phoneNumber: 4433333,
        clientEmail: "vapendamatesting@gmail.com",
      },
      {
        id: 10,
        serialNumber: 10,
        clientName: "Monday Client",
        phoneNumber: 4433333,
        clientEmail: "vapendamatesting@gmail.com",
      },
      {
        id: 11,
        serialNumber: 11,
        clientName: "Monday Client",
        phoneNumber: 4433333,
        clientEmail: "vapendamatesting@gmail.com",
      },
      {
        id: 12,
        serialNumber: 12,
        clientName: "Monday Client",
        phoneNumber: 4433333,
        clientEmail: "vapendamatesting@gmail.com",
      },
      {
        id: 13,
        serialNumber: 13,
        clientName: "Monday Client",
        phoneNumber: 4433333,
        clientEmail: "vapendamatesting@gmail.com",
      },
      {
        id: 14,
        serialNumber: 14,
        clientName: "Monday Client",
        phoneNumber: 4433333,
        clientEmail: "vapendamatesting@gmail.com",
      },
      {
        id: 15,
        serialNumber: 15,
        clientName: "Monday Client",
        phoneNumber: 4433333,
        clientEmail: "vapendamatesting@gmail.com",
      },
      {
        id: 16,
        serialNumber: 16,
        clientName: "Monday Client",
        phoneNumber: 4433333,
        clientEmail: "vapendamatesting@gmail.com",
      },
    ],
  };
};

export const CLIENT_SESSION_LIST_DATA = (
  handleCellClick,
  handleEdit,
  handleDelete,
  dropdownRef,
  showCell = false
) => {
  return [
    {
      name: "Client Name",
      sortable: true,
      cell: (row) => (
        <div
          style={{ textTransform: "capitalize" }}
          onClick={() => handleEdit(row)}
        >{`${row.client_first_name}  ${row.client_last_name}`}</div>
      ),
      selectorId: "client_first_name",
    },
    {
      name: "Service Type",
      selector: (row) => row.service_name || "NA",
      sortable: true,
      selectorId: "service_name",
    },
    {
      name: "Serial Number",
      selector: (row) => row.client_clam_num || "NA",
      sortable: true,
      selectorId: "client_clam_num",
      ...(showCell && {
        cell: (row, handleClick) => (
          <div
            style={{ color: "var(--link-color)", cursor: "pointer" }}
            onClick={() => {
              handleClick(row.req_id);
            }}
          >
            {row?.client_clam_num || "N/A"}
          </div>
        ),
      }),
    },
    {
      name: "Session Date",
      selector: (row) => row.req_dte_not_formatted,
      sortable: true,
      format: (row) =>
        convertUTCToLocalTime(`${row.req_dte_not_formatted}T${row.req_time}`)
          .date,
      selectorId: "req_dte_not_formatted",
    },
    {
      name: "Session Time",
      selector: (row) => row.req_time || "NA",
      sortable: true,
      format: (row) =>
        convertUTCToLocalTime(`${row.req_dte_not_formatted}T${row.req_time}`)
          .time,
      selectorId: "req_time",
    },
  ];
};
export const SESSION_TABLE_COLUMNS = (args) => {
  const { handleCellClick, handleEdit, handleDelete, dropdownRef } = args || {};
  return [
    {
      name: "Date",
      selector: (row) => {
        if (row?.scheduled_time) {
          const scheduledTimeStr = String(row.scheduled_time).trim();

          const hasDatePattern = scheduledTimeStr.match(/\d{4}-\d{2}-\d{2}/);
          const hasTimeSeparator = scheduledTimeStr.includes("T") || scheduledTimeStr.includes(" ");
          const isFullDateTime = hasDatePattern && hasTimeSeparator && scheduledTimeStr.length > 10;
          
          if (isFullDateTime) {
            const normalizedDateTime = scheduledTimeStr.replace(" ", "T");
            return convertUTCToLocalTime(normalizedDateTime).date;
          }
        }
        
        if (row?.intake_date) {
          if (row?.scheduled_time) {
            const scheduledTimeStr = String(row.scheduled_time).trim();
            const hasDatePattern = scheduledTimeStr.match(/\d{4}-\d{2}-\d{2}/);
            const hasTimeSeparator = scheduledTimeStr.includes("T") || scheduledTimeStr.includes(" ");
            const isFullDateTime = hasDatePattern && hasTimeSeparator && scheduledTimeStr.length > 10;
            
            if (!isFullDateTime) {
              return convertUTCToLocalTime(
                `${row.intake_date}T${row.scheduled_time}`
              ).date;
            }
            const normalizedDateTime = scheduledTimeStr.replace(" ", "T");
            return convertUTCToLocalTime(normalizedDateTime).date;
          }
          return convertUTCToLocalTime(`${row.intake_date}T00:00:00`).date;
        }
        
        return "";
      },
      sortable: true,
      selectorId: "intake_date",
    },
    {
      name: "Serial Number",
      selector: (row) => row.client_clam_num || "N/A",
      sortable: true,
      selectorId: "client_clam_num",
    },
    {
      name: "Client Name",
      selector: (row) => {
        const capitalize = (name) =>
          name[0].toUpperCase() + name.slice(1).toLowerCase();
        return `${capitalize(row.client_first_name)} ${capitalize(
          row?.client_last_name
        )}`;
      },
      sortable: true,
      selectorId: "client_first_name",
    },
    {
      name: "Service Type",
      selector: (row) => row.service_name,
      sortable: true,
      selectorId: "service_name",
    },
    {
      name: "Start Time",
      selector: (row) => {
        if (row?.scheduled_time) {
          const scheduledTimeStr = String(row.scheduled_time).trim();
          const hasDatePattern = scheduledTimeStr.match(/\d{4}-\d{2}-\d{2}/);
          const hasTimeSeparator = scheduledTimeStr.includes("T") || scheduledTimeStr.includes(" ");
          const isFullDateTime = hasDatePattern && hasTimeSeparator && scheduledTimeStr.length > 10;
          
          if (isFullDateTime) {
            const normalizedDateTime = scheduledTimeStr.replace(" ", "T");
            return convertUTCToLocalTime(normalizedDateTime).time;
          }
          
          if (row?.intake_date) {
            return convertUTCToLocalTime(
              `${row.intake_date}T${row.scheduled_time}`
            ).time;
          }
        }
        
        if (row?.intake_date) {
          const intakeTime = new Date(row.intake_date).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });
          return intakeTime !== "Invalid Date" ? intakeTime : "N/A";
        }
        
        return "N/A";
      },
      sortable: true,
      selectorId: "scheduled_time",
    },
    {
      name: "Online/In Person",
      selector: (row) => row.session_format,
      sortable: true,
      selectorId: "session_format",
    },
  ];
};
export const CLIENT_ALLSESSION_LIST_DATA = (args) => {
  const { moment, handleNoteOpen } = args || {};
  return [
    {
      name: "Service Type",
      selector: (row) => row.service_name,
      selectorId: "service_desc",
    },
    {
      name: "Session Date",
      selector: (row) => row.intake_date,
      selectorId: "intake_date",
    },

    {
      name: "Session Time",
      selector: (row) =>
        moment.utc(row.scheduled_time, "HH:mm:ss.SSS[Z]").format("hh:mm A"),
      selectorId: "session_time",
    },
    {
      name: "Session Status",
      selector: (row) => row.session_status,
      selectorId: "session_status",
    },
    {
      name: "Notes",
      selector: (row) => row.notes,
      sortable: true,
      cell: (row) =>
        !row.notes ? (
          <CustomButton
            type="button"
            icon={<AddIcon />}
            customClass="add-notes"
            title="Add Notes"
            onClick={() => handleNoteOpen(row, "add")}
          />
        ) : (
          <span
            onClick={() => handleNoteOpen(row, "edit")}
            style={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              gap: "4px",
              maxWidth: "150px",
            }}
          >
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flex: 1,
              }}
            >
              {row.notes}
            </span>
            <EditIcon />
          </span>
        ),
      selectorId: "notes",
    },
  ];
};

export const GRAPH_DATA = {
  X_AXIS_DATA: [
    { label: "Monday Client", value: "MondayClient" },
    { label: "Tuesday Client", value: "TuesdayClient" },
    { label: "Wednesday Client", value: "WednesdayClient" },
    { label: "Thursday Client", value: "ThursdayClient" },
    { label: "Friday Client", value: "FridayClient" },
    { label: "Saturday Client", value: "SaturdayClient" },
    { label: "Sunday Client", value: "SundayClient" },
  ],
  TOTAL_SESSIONS_DATA: [20, 30, 40, 50, 60, 70, 80],
  TOTAL_ATTENDANCE_DATA: [25, 35, 45, 55, 65, 75, 85],
  TOTAL_CANCELLED_DATA: [30, 40, 50, 60, 70, 80, 90],
};

//use this button for every table can chage for different data for different tables

const ClientManagementdownloadButtonConfig = {
  actionHeading: "Download",
  actions: [{ action: "CSV" }, { action: "PDF" }, { action: "Excel" }],
};

const ClientManagementcolumnVisibilityButtonConfig = {
  actionHeading: "Column Visibility",
  actions: [
    { action: "ID" },
    { action: "Serial Number" },
    { action: "Client Name" },
    { action: "Phone Name" },
    { action: "Client Email" },
  ],
};

export const ClientManagementTableActionButton = [
  ClientManagementdownloadButtonConfig,
  ClientManagementcolumnVisibilityButtonConfig,
];

export const SESSIONS_TABLE_DATA = () => [
  {
    id: 1,
    service_code: 27,
    service_desc: "PT",
    schedule_date: "27 Feb 2025",
    schedule_time: "04:04 am",
  },
  {
    id: 2,
    service_code: 27,
    service_desc: "PT",
    schedule_date: "27 Feb 2025",
    schedule_time: "04:04 am",
  },
  {
    id: 3,
    service_code: 27,
    service_desc: "PT",
    schedule_date: "27 Feb 2025",
    schedule_time: "04:04 am",
  },
  {
    id: 4,
    service_code: 27,
    service_desc: "PT",
    schedule_date: "27 Feb 2025",
    schedule_time: "04:04 am",
  },
  {
    id: 5,
    service_code: 27,
    service_desc: "PT",
    schedule_date: "27 Feb 2025",
    schedule_time: "04:04 am",
  },
];

export const SERVICES_TABLE_COLUMNS = (
  handleCellClick,
  handleEdit,
  handleDelete,
  dropdownRef
) => [
  {
    name: "ID",
    selector: (row) => row.service_id,
    sortable: true,
    width: "100px",
    selectorId: "service_id",
  },
  {
    name: "Service Type",
    selector: (row) => row.service_name,
    sortable: true,
    selectorId: "service_name",
  },
  {
    name: "Service Code",
    selector: (row) => row.service_code,
    sortable: true,
    selectorId: "service_code",
  },
  {
    name: "Total Invoice",
    selector: (row) =>
      `$${(Number(row.total_invoice) - Number(row?.gst)).toFixed(4)}`,
    sortable: true,
    selectorId: "total_invoice",
  },
  {
    name: "Tax",
    selector: (row) => `$${Number(row.gst).toFixed(4)}`,
    sortable: true,
    selectorId: "gst",
  },
  {
    name: "Total Invoice + Tax",
    selector: (row) => `$${Number(row.total_invoice).toFixed(4)}`,
    sortable: true,
    selectorId: "total_invoice",
  },
  {
    name: "Disc %",
    selector: (row) => row.discount_pcnt,
    sortable: true,
    selectorId: "discount_pcnt",
  },
  {
    name: "",
    cell: (row) => (
      <ActionMenu
        row={row}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
      />
    ),
    width: "50px",
    allowOverflow: true,
    button: true,
  },
];

export const SessionDropDownData = [
  { label: "All Users", value: "All Users" },
  { label: "Alice", value: "Alice" },
  { label: "Bob", value: "Bob" },
  { label: "Charlie", value: "Charlie" },
  { label: "Diana", value: "Diana" },
  { label: "Eve", value: "Eve" },
];

export const yearDropDownData = [
  { label: "All Years", value: "All Years" },
  { label: 2019, value: 2019 },
  { label: 2020, value: 2020 },
  { label: 2021, value: 2021 },
  { label: 2023, value: 2023 },
  { label: 2024, value: 2024 },
  { label: 2025, value: 2025 },
];
export const monthDropDownData = [
  { label: "All Months", value: "All Months" },
  { label: "January", value: "January" },
  { label: "February", value: "February" },
  { label: "March", value: "March" },
  { label: "April", value: "April" },
  { label: "May", value: "May" },
  { label: "June", value: "June" },
  { label: "July", value: "July" },
  { label: "August", value: "August" },
  { label: "September", value: "September" },
  { label: "October", value: "October" },
  { label: "November", value: "November" },
  { label: "December", value: "December" },
];

export const SESSION_HISTORY_DATA = {
  columns: [
    {
      name: "Client Name",
      selector: (row) => row.clientName,
      sortable: true,
      selectorId: "clientName",
    },
    {
      name: "Serial Number",
      selector: (row) => row.serialNumber,
      sortable: true,
      cell: (row, handleClick) => (
        <div
          style={{ color: "var(--link-color)", cursor: "pointer" }}
          onClick={() => handleClick(row.serialNumber)}
        >
          {row.serialNumber}
        </div>
      ),
      selectorId: "serialNumber",
    },
    {
      name: "Service Type",
      selector: (row) => row.serviceName,
      sortable: true,
      selectorId: "serviceName",
    },
    {
      name: "Session Date",
      selector: (row) => row.sessionDate,
      sortable: true,
      selectorId: "sessionDate",
    },
    {
      name: "Total Session",
      selector: (row) => row.totalSession,
      sortable: true,
      selectorId: "totalSession",
    },
    {
      name: "Total Attendance",
      selector: (row) => row.totalAttendance,
      sortable: true,
      selectorId: "totalAttendance",
    },
    {
      name: "Total Cancellation",
      selector: (row) => row.totalCancellation,
      sortable: true,
      selectorId: "totalCancellation",
    },
    {
      name: "Current Status",
      selector: (row) => row.currentStatus,
      sortable: true,
      selectorId: "currentStatus",
    },
    {
      name: "Cancellation Reason",
      selector: (row) => row.cancellationReason,
      sortable: true,
      selectorId: "cancellationReason",
    },
    {
      name: "",
      cell: (row) => (
        <div
          onClick={() => {
            handleCellClick(row.id);
          }}
          style={{ cursor: "pointer", position: "relative" }}
        >
          <MenuIcon />
          {row.active && (
            <TooltipContainer>
              <TooltipButton title="Edit" icon={<PrintIcon />} />
              <TooltipButton
                title="Delete"
                icon={<DeleteIcon />}
                color="#d30028"
              />
            </TooltipContainer>
          )}
        </div>
      ),
      width: "50px",
      // ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ],
  Data: [
    {
      clientName: "John Doe",
      serialNumber: "001",
      serviceName: "Therapy",
      sessionDate: "2024",
      totalSession: 10,
      totalAttendance: 8,
      totalCancellation: 2,
      currentStatus: "Active",
      cancellationReason: "Illness",
    },
    {
      clientName: "Bob",
      serialNumber: "002",
      serviceName: "Consultation",
      sessionDate: "2025",
      totalSession: 5,
      totalAttendance: 5,
      totalCancellation: 0,
      currentStatus: "Completed",
      cancellationReason: "",
    },
    {
      clientName: "Alice Brown",
      serialNumber: "003",
      serviceName: "Massage",
      sessionDate: "2024",
      totalSession: 8,
      totalAttendance: 7,
      totalCancellation: 1,
      currentStatus: "Active",
      cancellationReason: "Personal",
    },
    {
      clientName: "Bob Johnson",
      serialNumber: "004",
      serviceName: "Coaching",
      sessionDate: "2024",
      totalSession: 12,
      totalAttendance: 10,
      totalCancellation: 2,
      currentStatus: "Inactive",
      cancellationReason: "Scheduling Conflict",
    },
    {
      clientName: "Eva White",
      serialNumber: "005",
      serviceName: "Nutrition Consultation",
      sessionDate: "2024",
      totalSession: 6,
      totalAttendance: 6,
      totalCancellation: 0,
      currentStatus: "Completed",
      cancellationReason: "",
    },
  ],
};

export const CLIENT_DETAIL_DATA = (handleDischarge) => ({
  columns: [
    {
      name: "ID",
      selector: (row) => row.id,
    },
    {
      name: "Client Name",
      selector: (row) => row.clientName,
    },
    {
      name: "Service Description",
      selector: (row) => row.serviceDescription,
    },
    {
      name: "Intake Date",
      selector: (row) => row.intakeDate,
    },
    {
      name: "Scheduled Time",
      selector: (row) => row.scheduledTime,
    },
    {
      name: "Serial Number",
      selector: (row) => row.serialNumber,
    },
    {
      name: "",
      cell: (row) => (
        <div className="col-action-buttons">
          <CustomButton
            customClass={"discharge-button"}
            title="Discharge"
            onClick={() => handleDischarge(row)}
          />
        </div>
      ),
    },
  ],
  data: [
    {
      id: 1,
      clientName: "John Doe",
      serviceDescription: "Consultation",
      intakeDate: "2024-11-25",
      scheduledTime: "10:00 AM",
      serialNumber: "SN123456",
    },
  ],
  onRowClicked: (row) => {
    handleDetails(row); // Call handleGetDetail when the row is clicked
  },
});

export const CLIENT_SESSION_LIST_DATA_BY_ID = (
  handleCellClick,
  handleEdit,
  handleDelete,
  dropdownRef,
  feeSplitData = null
) => [
  {
    name: "ID",
    selector: (row) => row.session_id,
  },
  {
    name: "Session date/time",
    selector: (row) => row.intake_date,
  },
  {
    name: "Service code",
    selector: (row) => row.service_code,
  },
  {
    name: "Service desc",
    selector: (row) => row.service_name,
    minWidth: "220px",
  },
  {
    name: "Total Amount",
    selector: (row) => `$${Number(row.session_price).toFixed(4)}`,
  },
  {
    name: "Tax",
    selector: (row) => `$${Number(row.session_taxes).toFixed(4)}`,
  },
  {
    name: "Amt. to Counselor",
    selector: (row) => {
      console.log("feeSplitData", feeSplitData);
      if (feeSplitData && feeSplitData.is_fee_split_enabled) {
        const counselorAmount =
          (Number(row.session_price || 0) *
            feeSplitData.counselor_share_percentage) /
          100;
        return `$${counselorAmount.toFixed(4)}`;
      } else {
        // Default: full amount to counselor
        return `$${Number(row.session_price || 0).toFixed(4)}`;
      }
    },
  },
  {
    name: "Amt. to Admin",
    selector: (row) => {
      // Default: system amount
      return `$${Number(row.session_system_amt || 0).toFixed(4)}`;
    },
  },
  {
    name: "",
    cell: (row) => (
      <div style={{ cursor: "pointer", display: "flex", gap: "10px" }}>
        <div
          style={{
            background: "#D1FADF",
            borderRadius: "20px",
            padding: "5px",
            display: "flex",
            alignItems: "center",
            gap: "5px",
            color: "#002709",
            fontSize: "12px",
            fontWeight: 600,
            lineHeight: "14.1px",
            letterSpacing: "-0.02em",
            textAlign: "left",
            minWidth: "max-content",
            height: "18px",
            textTransform: "capitalize",
          }}
        >
          <div
            style={{
              borderRadius: "50%",
              width: "6px",
              height: "6px",
              background: "#00AE14",
            }}
          />
          {row.session_format.toLowerCase()}
        </div>
      </div>
    ),
    ignoreRowClick: true,
    allowOverflow: true,
    button: true,
  },
  // {
  //   name: "",
  //   cell: (row, index) => (
  //     <Dropdown
  //       ref={dropdownRef}
  //       row={row}
  //       index={index}
  //       handleCellClick={handleCellClick}
  //       handleEdit={handleEdit}
  //       handleDelete={handleDelete}
  //     />
  //   ),
  //   width: "50px",
  //   allowOverflow: true,
  //   button: true,
  // },
];

export const DOWNLOAD_OPTIONS = (columns, data, tableCaption) => [
  {
    subHeadings: [
      {
        name: "Print Report",
        icon: <PrintIcon />,
        onClick: () => console.log("Print Report"),
      },
    ],
  },
  {
    subHeadings: [
      {
        name: "Download PDF",
        icon: <PdfIcon />,
        onClick: async () => {
          await exportToPDF(columns, data, tableCaption);
        }, // Pass `data` here
      },
      {
        name: "Download Excel",
        icon: <ExcelIcon />,
        onClick: async () => await exportToExcel(columns, data, tableCaption), // Pass `data` here
      },
      {
        name: "Download CSV",
        icon: <CsvIcon />,
        onClick: () => exportToCSV(columns, data, tableCaption), // Pass `data` here
      },
    ],
  },
];

export const REPORTS_TABLE_DATA_COLUMNS = (handleClientClick) => [
  {
    name: "Client Name",
    selector: (row) => `${row.client_first_name} ${row.client_last_name}`,
    sortable: true,
    selectorId: "client_first_name",
    cell: handleClientClick ? (row) => (
      <div
        style={{ 
          color: "var(--link-color)", 
          cursor: "pointer",
          textTransform: "capitalize"
        }}
        onClick={() => handleClientClick(row)}
      >
        {`${row.client_first_name} ${row.client_last_name}`}
      </div>
    ) : undefined,
    style: {
      textTransform: "capitalize",
    },
  },
  {
    name: "Report Name",
    selector: (row) => row.report_name,
    sortable: true,
    selectorId: "report_name",
  },
  {
    name: "Report Status",
    selector: (row) => row.report_status,
    sortable: true,
    cell: (row) => (
      <div style={{ display: "flex", gap: "2px", alignItems: "center" }}>
        <div
          style={{
            height: "15px",
            width: "15px",
            borderRadius: "50%",
            border: "1px solid #000",
            backgroundColor: row.report_status.includes("Past")
              ? "#fe000a"
              : row.report_status.includes("Future")
              ? "#00ca00"
              : "#fff000",
          }}
        />
        <span>{row.report_status}</span>
      </div>
    ),
    selectorId: "report_status",
  },
  {
    name: "Due Date",
    selector: (row) => convertUTCToLocalTime(row.due_date).date,
    sortable: true,
    selectorId: "due_date",
  },
];

export const ASSESSMENT_DATA_COLUMNS = (handleTreatmentTools, handleClientClick) => [
  {
    name: "Client Name",
    selector: (row) => `${row.client_first_name} ${row.client_last_name}`,
    sortable: true,
    selectorId: "client_first_name",
    cell: handleClientClick ? (row) => (
      <div
        style={{ 
          color: "var(--link-color)", 
          cursor: "pointer",
          textTransform: "capitalize"
        }}
        onClick={() => handleClientClick(row)}
      >
        {`${row.client_first_name} ${row.client_last_name}`}
      </div>
    ) : undefined,
    style: {
      textTransform: "capitalize",
    },
  },
  {
    name: "Serial Number",
    selector: (row) => row.client_clam_num || "NA",
    sortable: true,
    selectorId: "client_first_name",
  },
  {
    name: "Treatment Tool",
    selector: (row) => row.form_cde,
    sortable: true,
    selectorId: "form_cde",
    cell: (row) => (
      <div
        style={{ color: "var(--link-color)", cursor: "pointer" }}
        onClick={() => {
          handleTreatmentTools(row);
        }}
      >
        {row?.form_cde || "N/A"}
      </div>
    ),
  },
  // {
  //   name: "Date Sent",
  //   selector: (row) => convertUTCToLocalTime(row.date_sent).date,
  //   sortable: true,
  //   selectorId: "date_sent",
  // },
  {
    name: "Due Date",
    selector: (row) => convertUTCToLocalTime(row.due_date).date,
    sortable: true,
    selectorId: "due_date",
  },
];

export const CLIENT_MANAGEMENT_DATA = (
  handleCellClick,
  handleEdit,
  handleDelete,
  handleEditSessionInfo,
  dropdownRef,
  handleActivate,
  handleDeactivate,
  showActivationActions = false,
  userRoleId,
  currentUserId = null
) => {
  const columns = [
    {
      name: "ID",
      selector: (row) => row.user_profile_id,
      sortable: true,
      selectorId: "user_profile_id",
      maxWidth: "20px",
    },
    {
      name: "Client Name",
      cell: (row) => (
        <div
          style={{ textTransform: "capitalize" }}
          onClick={() => handleEditSessionInfo(row)}
        >{`${row.user_first_name}  ${row.user_last_name}`}</div>
      ),
      sortable: true,
      selectorId: "user_first_name",
    },
    {
      name: "Serial Number",
      selector: (row) => row.clam_num || "N/A",
      sortable: true,
      selectorId: "clam_num",
    },
    {
      name: "Phone Number",
      selector: (row) => row.user_phone_nbr || "N/A",
      sortable: true,
      selectorId: "user_phone_nbr",
    },
    {
      name: "Client Email",
      selector: (row) => row.email,
      sortable: true,
      selectorId: "email",
    },
  ];

  // Add Status column for counselors/tenants when activation actions are enabled
  if (showActivationActions) {
    columns.push({
      name: "Status",
      cell: (row) => {
        const isActivated = row?.isActivated !== false && row?.isActivated !== undefined;
        return (
          <div
            style={{
              color: isActivated ? "#4caf50" : "#ff9800",
              fontWeight: "500",
              textTransform: "capitalize",
            }}
          >
            {isActivated ? "Active" : "Inactive"}
          </div>
        );
      },
      sortable: true,
      selectorId: "isActivated",
    });
  }

  columns.push({
    name: "",
    cell: (row) => (
      <Dropdown
        ref={dropdownRef}
        row={row}
        handleCellClick={handleCellClick}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        handleActivate={handleActivate}
        handleDeactivate={handleDeactivate}
        showActivationActions={showActivationActions}
        userRoleId={userRoleId}
        currentUserId={currentUserId}
      />
    ),
    width: "50px",
    allowOverflow: true,
    button: true,
  });

  return columns;
};

export const roles = [
  { label: "Patient", value: 1 },
  { label: "Counsellor", value: 2 },
  { label: "Support user", value: 3 },
  { label: "Admin", value: 4 },
];

export const SERVICES = [
  { label: "Mental Health Counseling", value: "Mental Health Counseling" },
  { label: "Therapy Sessions", value: "Therapy Sessions" },
  { label: "Psychiatric Evaluation", value: "Psychiatric Evaluation" },
  { label: "General Checkup", value: "General Checkup" },
  { label: "Physical Therapy", value: "Physical Therapy" },
  { label: "Dental Care", value: "Dental Care" },
  { label: "Pediatric Care", value: "Pediatric Care" },
  { label: "Cardiology Services", value: "Cardiology Services" },
];

export const TARGET = [
  { value: "ocean", label: "Ocean" },
  { value: "blue", label: "Blue" },
  { value: "purple", label: "Purple" },
];

export const POSITIONS = [
  { value: "0", label: "0" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
];

export const SERVICE_ID = [
  { value: "ocean", label: "Ocean" },
  { value: "blue", label: "Blue" },
  { value: "purple", label: "Purple" },
];

export const AdditionalServicesColumns = [
  {
    name: "Service Description",
    selector: (row) => row.service_desc,
    sortable: true,
  },
  {
    name: "Schedule Date",
    selector: (row) => row.schedule_date,
    sortable: true,
  },
  {
    name: "Schedule Time",
    selector: (row) => row.schedule_time,
    sortable: true,
  },
];

export const AdditionalServicesData = [
  {
    sessionDate: "Tuesday, July 13, 2024",
    serviceCodes: "Bord_Cons",
    serviceDescription: "Board Member Consultation",
    scheduledTime: "1.30pm",
    sessionFormat: "In-Person",
    showStatus: "Show",
  },
  {
    sessionDate: "Friday, August 14, 2024",
    serviceCodes: "Pro_Cons",
    serviceDescription: "Service Provider Consultation",
    scheduledTime: "2.30pm",
    sessionFormat: "Online",
    showStatus: "No Show",
  },
  {
    sessionDate: "Thursday, September 1, 2024",
    serviceCodes: "UnBill",
    serviceDescription: "Unbillable Service",
    scheduledTime: "1.00pm",
    sessionFormat: "In-Person",
    showStatus: "No Show",
  },
  {
    sessionDate: "Tuesday, July 22, 2024",
    serviceCodes: "Bord_Cons",
    serviceDescription: "Board Member Consultation",
    scheduledTime: "1.30pm",
    sessionFormat: "In-Person",
    showStatus: "No Show",
  },
  {
    sessionDate: "Friday, August 29, 2024",
    serviceCodes: "Pro_Cons",
    serviceDescription: "Service Provider Consultation",
    scheduledTime: "2.30pm",
    sessionFormat: "Online",
    showStatus: "Show",
  },
];

export const IPF_FORM_QUESTIONS = {
  relationship: [
    {
      id: "item1",
      text: "When necessary, I cooperated on tasks with my spouse or partner.",
    },
    {
      id: "item2",
      text: "I shared household chores or duties with my spouse or partner.",
    },
    {
      id: "item3",
      text: "I had trouble sharing thoughts or feelings with my spouse or partner.",
    },
    {
      id: "item4",
      text: "I showed interest in my spouse or partner's activities.",
    },
    {
      id: "item5",
      text: "I had trouble settling arguments or disagreements with my spouse or partner.",
    },
    { id: "item6", text: "I was patient with my spouse or partner." },
    {
      id: "item7",
      text: "I had trouble giving emotional support to my spouse or partner.",
    },
    { id: "item8", text: "I was affectionate with my spouse or partner." },
    {
      id: "item9",
      text: "My partner or spouse and I did activities that brought us closer together.",
    },
    {
      id: "item10",
      text: "I was interested in sexual activity with my spouse or partner.",
    },
    {
      id: "item11",
      text: "I had trouble becoming sexually aroused with my spouse or partner.",
    },
  ],
  family: [
    {
      id: "item12",
      text: "I stayed in touch with family members (e.g. phone calls, e-mails, texts).",
    },
    {
      id: "item13",
      text: "My family and I did activities that brought us closer together.",
    },
    {
      id: "item14",
      text: "I was affectionate with my family members.",
    },
    {
      id: "item15",
      text: "I had trouble being patient with family members.",
    },
    {
      id: "item16",
      text: "I had trouble communicating thoughts or feelings to family members.",
    },
    {
      id: "item17",
      text: "I had trouble giving emotional support to family members.",
    },
    {
      id: "item18",
      text: "I had trouble settling arguments or disagreements with family members.",
    },
  ],
  work: [
    {
      id: "item19",
      text: "I had trouble showing up on time for work.",
    },
    {
      id: "item20",
      text: "I reported for work when I was supposed to.",
    },
    {
      id: "item21",
      text: "I got along well with others at work.",
    },
    { id: "item22", text: "I stayed interested in my work." },
    {
      id: "item23",
      text: "I had trouble being patient with others at work.",
    },
    {
      id: "item24",
      text: "I performed my job to the best of my ability.",
    },
    { id: "item25", text: "I completed my work on time." },
    {
      id: "item26",
      text: "I had trouble settling arguments or disagreements with others at work.",
    },
    {
      id: "item27",
      text: "I solved problems or challenges at work without much difficulty.",
    },
    {
      id: "item28",
      text: "I maintained a reasonable balance between work and home.",
    },
    {
      id: "item29",
      text: "I was able to perform my work duties without needing any extra help.",
    },
    {
      id: "item30",
      text: "When necessary, I cooperated on work-related tasks with others.",
    },
    {
      id: "item31",
      text: "I showed my skills and knowledge of the job.",
    },
    {
      id: "item32",
      text: "I showed others at work that they could depend on me.",
    },
    {
      id: "item33",
      text: "I came up with ideas and put them into action at work.",
    },
    {
      id: "item34",
      text: "I took responsibility for my work.",
    },
    {
      id: "item35",
      text: "I prioritized work-related tasks appropriately.",
    },
    { id: "item36", text: "I worked hard every day." },
    {
      id: "item37",
      text: "I made sure that the work environment was pleasant for others.",
    },
    {
      id: "item38",
      text: "I had trouble expressing my ideas, thoughts or feelings to others at work.",
    },
    {
      id: "item39",
      text: "I had trouble being supportive of others at work.",
    },
  ],
  social: [
    { id: "item40", text: "I was willing to meet new people." },
    {
      id: "item41",
      text: "I stayed in touch with friends (returning phone calls, emails, visiting).",
    },
    {
      id: "item42",
      text: "My friends and I did activities that brought us closer together.",
    },
    {
      id: "item43",
      text: "I had trouble being patient with my friends.",
    },
    {
      id: "item44",
      text: "I had trouble settling arguments or disagreements with my friends.",
    },
    {
      id: "item45",
      text: "I had trouble sharing my thoughts or feelings with my friends.",
    },
    {
      id: "item46",
      text: "I had trouble giving emotional support to my friends.",
    },
    { id: "item47", text: "I showed affection for my friends." },
  ],
  parenting: [
    {
      id: "item48",
      text: "My children were able to depend on me for whatever they needed.",
    },
    {
      id: "item49",
      text: "I was interested in my children's activities.",
    },
    {
      id: "item50",
      text: "I had trouble communicating with my children.",
    },
    { id: "item51", text: "I was affectionate with my children." },
    {
      id: "item52",
      text: "I appropriately shared thoughts or feelings with my children.",
    },
    {
      id: "item53",
      text: "My children and I did activities that brought us closer together.",
    },
    {
      id: "item54",
      text: "I talked with, or taught, my children about important life issues.",
    },
    { id: "item55", text: "I was a good role model for my children." },
    {
      id: "item56",
      text: "I had trouble giving emotional support to my children.",
    },
    {
      id: "item57",
      text: "I had trouble settling conflicts or disagreements with my children.",
    },
  ],
  school: [
    { id: "item58", text: "I attended classes regularly." },
    {
      id: "item59",
      text: "I stayed interested in my classes and schoolwork.",
    },
    { id: "item60", text: "I arrived on time for my classes." },
    {
      id: "item61",
      text: "I had trouble being supportive of my classmates' achievements.",
    },
    { id: "item62", text: "I turned in assignments late." },
    {
      id: "item63",
      text: "I solved problems and challenges in class without much difficulty.",
    },
    {
      id: "item64",
      text: "I took responsibility for my schoolwork.",
    },
    {
      id: "item65",
      text: "I was patient with my classmates and/or instructors.",
    },
    {
      id: "item66",
      text: "I had trouble settling disagreements or arguments with instructors and/or classmates.",
    },
    {
      id: "item67",
      text: "I had trouble remembering what the instructor said.",
    },
    { id: "item68", text: "I could easily remember what I read." },
    { id: "item69", text: "I understood course material." },
    {
      id: "item70",
      text: "When necessary, I cooperated with classmates.",
    },
    {
      id: "item71",
      text: "I got along with classmates and/or instructors.",
    },
    {
      id: "item72",
      text: "I completed my schoolwork to the best of my ability.",
    },
  ],
  personalCare: [
    {
      id: "item73",
      text: "I had trouble keeping up with household chores (for example, cleaning, cooking, yard work, etc).",
    },
    {
      id: "item74",
      text: "I maintained good personal hygiene and grooming (for example, showering, brushing teeth, etc).",
    },
    {
      id: "item75",
      text: "I had trouble managing my medical care (for example, medications, doctors' appointments, physical therapy, etc).",
    },
    { id: "item76", text: "I ate healthy and nutritious meals." },
    {
      id: "item77",
      text: "I had trouble keeping up with chores outside the house (shopping, appointments, other errands).",
    },
    { id: "item78", text: "I had trouble managing my finances." },
    {
      id: "item79",
      text: "I was physically active (for example, walking, exercising, playing sports, gardening, etc).",
    },
    {
      id: "item80",
      text: "I spent time doing activities or hobbies that were fun or relaxing.",
    },
  ],
};

export const CONDITIONAL_ROW_STYLES = {
  defaultConditions: [{}],
  clientManagent: [
    {
      when: (row) => row.isPaused === true,
      style: {
        background: "transparent",
        color: "#ffc107",
        "&:hover": {
          backgroundColor: "white",
          color: "#ff9800",
          cursor: "pointer",
        },
      },
    },
    {
      when: (row) => row.has_schedule && row.isPaused !== true,
      style: {
        background: "transparent",
        color: "#00c317",
        "&:hover": {
          backgroundColor: "white",
          color: "#009914",
          cursor: "pointer",
        },
      },
    },
    {
      when: (row) => !row.has_schedule,
      style: {
        background: "transparent",
        "&:hover": {
          backgroundColor: "white",
          cursor: "pointer",
        },
      },
    },
  ],
  clientSessionSchedule: [
    {
      when: (row) => row.is_report === 1,
      style: {
        color: "#d32d41",
        "&:hover": {
          color: "#ac3e31",
          cursor: "pointer",
        },
      },
    },
    {
      when: (row) => row.session_status?.toLowerCase() === "inactive",
      style: {
        opacity: 0.6,
        backgroundColor: "#f8f9fa",
        color: "#6c757d",
        fontStyle: "italic",
        "&:hover": {
          backgroundColor: "#f8f9fa",
          opacity: 0.7,
          cursor: "not-allowed",
        },
      },
    },
  ],
};

export const INVOICE_DUMMY_DATA = [
  {
    service_date: "2025-01-01",
    invoice_nbr: "VAP20250101_1",
    serial_number: "SN-1001",
    service_code: "SC-001",
    total_amount_for_month: 5000.0,
    associate_for_month: 3000.0,
    vapendama: 2000.0,
    status: "Paid",
  },
  {
    service_date: "2025-01-15",
    invoice_nbr: "VAP20250115_2",
    serial_number: "SN-1002",
    service_code: "SC-002",
    total_amount_for_month: 7000.0,
    associate_for_month: 4000.0,
    vapendama: 3000.0,
    status: "Pending",
  },
  {
    service_date: "2025-01-30",
    invoice_nbr: "VAP20250130_3",
    serial_number: "SN-1003",
    service_code: "SC-003",
    total_amount_for_month: 6500.0,
    associate_for_month: 3500.0,
    vapendama: 3000.0,
    status: "Overdue",
  },
  {
    service_date: "2025-02-01",
    invoice_nbr: "VAP20250201_4",
    serial_number: "SN-1004",
    service_code: "SC-004",
    total_amount_for_month: 8000.0,
    associate_for_month: 5000.0,
    vapendama: 3000.0,
    status: "Paid",
  },
  {
    service_date: "2025-02-15",
    invoice_nbr: "VAP20250215_5",
    serial_number: "SN-1005",
    service_code: "SC-005",
    total_amount_for_month: 9000.0,
    associate_for_month: 6000.0,
    vapendama: 3000.0,
    status: "Pending",
  },
  {
    service_date: "2025-02-15",
    invoice_nbr: "VAP20250215_5",
    serial_number: "SN-1005",
    service_code: "SC-005",
    total_amount_for_month: 9000.0,
    associate_for_month: 6000.0,
    vapendama: 3000.0,
    status: "Pending",
  },
  {
    service_date: "2025-02-15",
    invoice_nbr: "VAP20250215_5",
    serial_number: "SN-1005",
    service_code: "SC-005",
    total_amount_for_month: 9000.0,
    associate_for_month: 6000.0,
    vapendama: 3000.0,
    status: "Pending",
  },
  {
    service_date: "2025-02-15",
    invoice_nbr: "VAP20250215_5",
    serial_number: "SN-1005",
    service_code: "SC-005",
    total_amount_for_month: 9000.0,
    associate_for_month: 6000.0,
    vapendama: 3000.0,
    status: "Pending",
  },
  {
    service_date: "2025-02-15",
    invoice_nbr: "VAP20250215_5",
    serial_number: "SN-1005",
    service_code: "SC-005",
    total_amount_for_month: 9000.0,
    associate_for_month: 6000.0,
    vapendama: 3000.0,
    status: "Pending",
  },
  {
    service_date: "2025-02-15",
    invoice_nbr: "VAP20250215_5",
    serial_number: "SN-1005",
    service_code: "SC-005",
    total_amount_for_month: 9000.0,
    associate_for_month: 6000.0,
    vapendama: 3000.0,
    status: "Pending",
  },
];

export const DIFFICULY_SCORE_ARR = [
  { icon: "✅", label: "Not difficult at all", value: 0 },
  {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="25" height="20" viewBox="0 0 460 460" style="
">
  <!-- Yellow Triangle Background -->
  <path fill="#ffc800" stroke="#ffc800" d="M449.07 399.08 278.64 82.58c-12.08-22.44-44.26-22.44-56.35 0L51.87 399.08A32 32 0 0 0 80 446.25h340.89a32 32 0 0 0 28.18-47.17z"></path>
  
  <!-- Black Exclamation Mark -->
  <circle cx="255" cy="340" r="22" fill="#000"></circle>
  <rect x="245" y="140" width="20" height="140" fill="#000"></rect>
</svg>`,
    label: "Somewhat difficult",
    value: 1,
  },
  { icon: "🔴", label: "Very difficult", value: 2 },
  {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="25" height="22" fill="#fc2800" stroke="#fc2800" stroke-width="0" viewBox="0 0 24 24">
  <!-- Background Circle -->
  <circle cx="12" cy="10" r="12" fill="#fc2800"></circle>

  <!-- White Horizontal Line -->
  <rect x="5" y="8" width="14" height="4" fill="#fff"></rect>
</svg>`,
    label: "Extremely difficult",
    value: 3,
  },
];

export const DIFFICULT_DAYS_OBJ = {
  h1Icon: "📅",
  h2Icon: "🚫",
  h3Icon: `<svg
  xmlns="http://www.w3.org/2000/svg"
  width="16"
  height="16"
  viewBox="0 0 512 512"
>
  <!-- Yellow Triangle Background -->
  <path
    fill="#ffc800"
    stroke="#ffc800"
    d="M449.07 399.08 278.64 82.58c-12.08-22.44-44.26-22.44-56.35 0L51.87 399.08A32 32 0 0 0 80 446.25h340.89a32 32 0 0 0 28.18-47.17z"
  />
  
  <!-- Black Exclamation Mark -->
  <circle cx="256" cy="368" r="16" fill="#000" />
  <rect x="246" y="170" width="16" height="120" fill="#000" />
</svg>`,
};
export const SUPPORT_EMAIL = "admin-rasham@mindbridge.solutions";
export const DEMO_MAIL_BODY = `Hi, I would like to explore the demo.`;
export const SERVICE_FEE_INFO = [
  "2% Service Fee + 5% (Tax)",
  "Total Monthly Revenue (Include Tax) = $100",
  "Service Fee = $100 * .02 = $2 + 5% (Tax)",
  "Total Service Fee = $2.1",
];

export const TREATMENT_TARGET = [
  { label: "Anxiety", value: 1 },
  { label: "Depression", value: 2 },
  { label: "Stress Management", value: 3 },
  { label: "Relationship Issues", value: 4 },
  { label: "Grief and Loss", value: 5 },
  { label: "Trauma and PTSD", value: 6 },
  { label: "Self-Esteem and Self-Confidence Issues", value: 7 },
  { label: "Addiction and Substance Abuse", value: 8 },
  { label: "Identity and Self-Exploration", value: 9 },
  { label: "Family and Parenting Issues", value: 10 },
  { label: "Work and Career-Related Issues", value: 11 },
  { label: "Chronic Illness and Health-Related Concerns", value: 12 },
  { label: "Anger Management", value: 13 },
  { label: "Eating Disorders and Body Image Issues", value: 14 },
  { label: "Life Transitions", value: 15 },
  { label: "Coping with Disability", value: 16 },
  { label: "Other", value: 17 },
];

export const CONSENT_OPTIONS = [
  { label: "Limits of confidentiality", value: "limits_of_confidentiality" },
  {
    label: "Session cancellation policy",
    value: "session_cancellation_policy",
  },
  { label: "Data privacy notice", value: "data_privacy_notice" },
  { label: "Client rights and responsibilities", value: "client_rights" },
];
export const CONSENT_CATEGORY_OPTIONS = [
  { label: "Group Therapy", value: "group_therapy" },
  { label: "Individual Care", value: "individual_care" },
  { label: "Family Sessions", value: "family_sessions" },
  { label: "Psychiatric Evaluation", value: "psychiatric_evaluation" },
];

export const service_templates = [
  { service_id: 101, service_price: 120.5 },
  { service_id: 102, service_price: 150.0 },
  { service_id: 103, service_price: 99.99 },
  { service_id: 104, service_price: 200.0 },
  { service_id: 105, service_price: 250.0 },
  { service_id: 106, service_price: 175.25 },
  { service_id: 107, service_price: 80.0 },
  { service_id: 108, service_price: 300.0 },
  { service_id: 109, service_price: 199.99 },
  { service_id: 110, service_price: 220.0 },
  { service_id: 111, service_price: 185.75 },
  { service_id: 112, service_price: 140.0 },
  { service_id: 113, service_price: 210.5 },
  { service_id: 114, service_price: 95.0 },
  { service_id: 115, service_price: 135.0 },
  { service_id: 116, service_price: 180.0 },
  { service_id: 117, service_price: 275.0 },
  { service_id: 118, service_price: 160.0 },
  { service_id: 119, service_price: 240.0 },
  { service_id: 120, service_price: 110.0 },
];

export const gasQuestionBank = {
  1: [
    {
      question:
        "How often do you use anxiety management techniques (eg deep breathing grounding exercises progressive muscle relaxation)",
      name: "q1",
      options: [
        { label: "Never (0 times per week)", value: -2 },
        { label: "Rarely (1-2 times per week)", value: -1 },
        { label: "Occasionally (3-4 times per week) ", value: 0 },
        { label: "Regularly (5-6 times per week)", value: 1 },
        { label: "Daily (7+ times per week)", value: 2 },
      ],
    },
    {
      question: "How effective are these techniques in reducing your anxiety??",
      name: "q2",
      options: [
        {
          label: "They do not help at all, and I feel overwhelmed",
          value: -2,
        },
        {
          label:
            "They help slightly, but I still struggle to regulate emotions",
          value: -1,
        },
        {
          label: "They help somewhat, and I feel some control over my emotions",
          value: 0,
        },
        {
          label:
            "They are effective in most situations, and I manage distress well",
          value: 1,
        },
        {
          label:
            "They are very effective, and I confidently handle high-stress situations ",
          value: 2,
        },
      ],
    },
    {
      question: " How well do you manage anxious thoughts without avoidance?",
      name: "q3",
      options: [
        {
          label: "No, I only use them in therapy",
          value: -2,
        },
        {
          label: "Rarely, I forget to use them in daily life",
          value: -1,
        },
        {
          label: "Sometimes, I remember to use them in specific situations",
          value: 0,
        },
        {
          label: "Often, I apply them in most situations without reminders",
          value: 1,
        },
        {
          label: "Always, I use them automatically in all stressful situations",
          value: 2,
        },
      ],
    },
    {
      question:
        "How confident are you in handling anxiety-provoking situations?",
      name: "q4",
      options: [
        {
          label: "Not confident at all, I feel overwhelmed frequently",
          value: -2,
        },
        {
          label: "Slightly confident, but I need guidance",
          value: -1,
        },
        {
          label:
            "Moderately confident, I can manage some emotions independently",
          value: 0,
        },
        {
          label: "Confident, I regulate emotions well most of the time",
          value: 1,
        },
        {
          label:
            "Very confident, I handle emotions independently and effectively",
          value: 2,
        },
      ],
    },
    {
      question: "How much has your overall anxiety decreased over time?",
      name: "q5",
      options: [
        {
          label: "No improvement, I still feel the same distress",
          value: -2,
        },
        {
          label: "Minimal improvement, I struggle with emotional regulation",
          value: -1,
        },
        {
          label: "Some improvement, I feel more in control of emotions",
          value: 0,
        },
        {
          label:
            "Significant improvement, I handle emotions better than before ",
          value: 1,
        },
        {
          label: "Major improvement, I feel empowered and emotionally balanced",
          value: 2,
        },
      ],
    },
  ],
  2: [
    {
      question: "How often do you engage in activities that improve your mood?",
      name: "q1",
      options: [
        { label: "Never (0 times per week)", value: -2 },
        { label: "Rarely (1-2 times per week)", value: -1 },
        { label: "Occasionally (3-4 times per week) ", value: 0 },
        { label: "Regularly (5-6 times per week)", value: 1 },
        { label: "Daily (7+ times per week)", value: 2 },
      ],
    },
    {
      question: "How well can you manage negative thoughts?",
      name: "q2",
      options: [
        { label: "Not at all, negative thoughts overwhelm me", value: -2 },
        { label: "Slightly, but I struggle most of the time", value: -1 },
        { label: "Somewhat, I can manage them sometimes", value: 0 },
        { label: "Well, I manage them in most situations", value: 1 },
        {
          label: "Very well, I manage negative thoughts confidently",
          value: 2,
        },
      ],
    },
    {
      question: "How much energy and motivation do you feel daily?",
      name: "q3",
      options: [
        { label: "None, I feel exhausted and unmotivated", value: -2 },
        {
          label: "Low, I have minimal energy and struggle to start tasks",
          value: -1,
        },
        { label: "Moderate, I can get through daily tasks", value: 0 },
        { label: "Good, I feel energetic and motivated most days", value: 1 },
        {
          label: "Very good, I feel energized and motivated every day",
          value: 2,
        },
      ],
    },
    {
      question: "How frequently do you engage in social interactions?",
      name: "q4",
      options: [
        { label: "Never, I avoid social contact", value: -2 },
        {
          label: "Rarely, only when necessary",
          value: -1,
        },
        { label: "Sometimes, in specific situations", value: 0 },
        { label: "Often, I engage with others regularly ", value: 1 },
        {
          label: "Very often, I socialize freely and confidently ",
          value: 2,
        },
      ],
    },
    {
      question:
        "How much have depressive symptoms decreased since starting therapy?",
      name: "q5",
      options: [
        { label: "No change, I feel the same ", value: -2 },
        {
          label: "Minimal change, symptoms remain strong",
          value: -1,
        },
        { label: "Some change, I feel slightly better", value: 0 },
        { label: "Significant change, I feel much better", value: 1 },
        {
          label: "Major change, I feel greatly improved",
          value: 2,
        },
      ],
    },
  ],
  3: [
    {
      question:
        "How often do you use stress management techniques (e.g., relaxation exercises, time management, self-care)?",
      name: "q1",
      options: [
        { label: "Never (0 times per week) ", value: -2 },
        {
          label: "Rarely (1-2 times per week)",
          value: -1,
        },
        { label: "Occasionally (3-4 times per week)", value: 0 },
        { label: "Regularly (5-6 times per week)", value: 1 },
        {
          label: "Daily (7+ times per week) ",
          value: 2,
        },
      ],
    },
    {
      question: "How well do you balance work and personal life?",
      name: "q2",
      options: [
        { label: "Not at all, I feel constantly unbalanced", value: -2 },
        { label: "Slightly, but it's difficult most days", value: -1 },
        { label: "Somewhat, I maintain balance sometimes", value: 0 },
        { label: "Well, I balance work and life in most situations", value: 1 },
        {
          label:
            "Very well, I maintain a healthy work-life balance confidently",
          value: 2,
        },
      ],
    },
    {
      question:
        "How effectively can you shift your mindset in stressful situations?",
      name: "q3",
      options: [
        { label: "Not at all, stress controls my thoughts", value: -2 },
        { label: "Slightly, but it's very challenging", value: -1 },
        { label: "Somewhat, I can reframe stress sometimes", value: 0 },
        {
          label: "Effectively, I manage my mindset well in most situations",
          value: 1,
        },
        {
          label: "Very effectively, I shift my mindset confidently in stress",
          value: 2,
        },
      ],
    },
    {
      question: "How often do you feel overwhelmed by stress?",
      name: "q4",
      options: [
        { label: "Always, I feel overwhelmed daily", value: -2 },
        { label: "Often, stress affects me regularly", value: -1 },
        { label: "Sometimes, I feel stressed but manage it", value: 0 },
        {
          label: "Rarely, I feel only mild stress",
          value: 1,
        },
        {
          label: "Never, I handle stress calmly and stay balanced",
          value: 2,
        },
      ],
    },
    {
      question: "How much has your ability to handle stress improved?",
      name: "q5",
      options: [
        { label: "No change, I still feel overwhelmed", value: -2 },
        { label: "Minimal change, I still struggle a lot", value: -1 },
        { label: "Some change, I handle stress slightly better", value: 0 },
        {
          label: "Significant change, I manage stress well now",
          value: 1,
        },
        {
          label: "Major change, I feel confident and resilient",
          value: 2,
        },
      ],
    },
  ],
  4: [
    {
      question: "How often do you engage in open and healthy communication?",
      name: "q1",
      options: [
        { label: "Never", value: -2 },
        { label: "Rarely (once or twice a week)", value: -1 },
        { label: "Sometimes (a few times a week)", value: 0 },
        { label: "Often (most days)", value: 1 },
        { label: "Always (daily)", value: 2 },
      ],
    },
    {
      question: "How effectively do you handle conflict without escalation?",
      name: "q2",
      options: [
        { label: "Not at all effectively", value: -2 },
        { label: "Slightly effectively", value: -1 },
        { label: "Somewhat effectively", value: 0 },
        { label: "Effectively", value: 1 },
        { label: "Very effectively", value: 2 },
      ],
    },
    {
      question: "How much trust do you feel in your relationships?",
      name: "q3",
      options: [
        { label: "No trust at all", value: -2 },
        { label: "Low trust", value: -1 },
        { label: "Moderate trust", value: 0 },
        { label: "High trust", value: 1 },
        { label: "Complete trust", value: 2 },
      ],
    },
    {
      question: "How confident are you in setting and maintaining boundaries?",
      name: "q4",
      options: [
        { label: "Not confident at all", value: -2 },
        { label: "Slightly confident", value: -1 },
        { label: "Moderately confident", value: 0 },
        { label: "Confident", value: 1 },
        { label: "Very confident", value: 2 },
      ],
    },
    {
      question: "How much have your relationships improved over time?",
      name: "q5",
      options: [
        { label: "Not at all", value: -2 },
        { label: "A little", value: -1 },
        { label: "Somewhat", value: 0 },
        { label: "Quite a bit", value: 1 },
        { label: "Significantly", value: 2 },
      ],
    },
  ],
  5: [
    {
      question:
        "How often do you allow yourself to acknowledge and process grief?",
      name: "q1",
      options: [
        { label: "Never", value: -2 },
        { label: "Rarely (once or twice a week)", value: -1 },
        { label: "Sometimes (a few times a week)", value: 0 },
        { label: "Often (most days)", value: 1 },
        { label: "Always (daily)", value: 2 },
      ],
    },
    {
      question: "How well can you manage emotions related to the loss?",
      name: "q2",
      options: [
        { label: "Not at all", value: -2 },
        { label: "Poorly", value: -1 },
        { label: "Somewhat", value: 0 },
        { label: "Well", value: 1 },
        { label: "Very well", value: 2 },
      ],
    },
    {
      question:
        "How frequently do you engage in meaningful activities that honor your loved one?",
      name: "q3",
      options: [
        { label: "Never", value: -2 },
        { label: "Rarely (once or twice a week)", value: -1 },
        { label: "Sometimes (a few times a week)", value: 0 },
        { label: "Often (most days)", value: 1 },
        { label: "Always (daily)", value: 2 },
      ],
    },
    {
      question:
        "How confident are you in navigating life changes after the loss?",
      name: "q4",
      options: [
        { label: "Not confident at all", value: -2 },
        { label: "Slightly confident", value: -1 },
        { label: "Moderately confident", value: 0 },
        { label: "Confident", value: 1 },
        { label: "Very confident", value: 2 },
      ],
    },
    {
      question: "How much has your ability to cope with grief improved?",
      name: "q5",
      options: [
        { label: "Not at all", value: -2 },
        { label: "A little", value: -1 },
        { label: "Somewhat", value: 0 },
        { label: "Quite a bit", value: 1 },
        { label: "Significantly", value: 2 },
      ],
    },
  ],
  6: [
    {
      question:
        "How effectively can you identify and challenge trauma-related thoughts?",
      name: "q1",
      options: [
        { label: "Not at all effectively", value: -2 },
        { label: "Slightly effectively", value: -1 },
        { label: "Somewhat effectively", value: 0 },
        { label: "Effectively", value: 1 },
        { label: "Very effectively", value: 2 },
      ],
    },
    {
      question:
        "How often do you use grounding techniques to manage trauma responses?",
      name: "q2",
      options: [
        { label: "Never", value: -2 },
        { label: "Rarely (once or twice a week)", value: -1 },
        { label: "Sometimes (a few times a week)", value: 0 },
        { label: "Often (most days)", value: 1 },
        { label: "Always (daily)", value: 2 },
      ],
    },
    {
      question: "How frequently do you feel safe and in control in daily life?",
      name: "q3",
      options: [
        { label: "Never", value: -2 },
        { label: "Rarely", value: -1 },
        { label: "Sometimes", value: 0 },
        { label: "Often", value: 1 },
        { label: "Always", value: 2 },
      ],
    },
    {
      question: "How well can you regulate emotional triggers?",
      name: "q4",
      options: [
        { label: "Not at all", value: -2 },
        { label: "Poorly", value: -1 },
        { label: "Somewhat", value: 0 },
        { label: "Well", value: 1 },
        { label: "Very well", value: 2 },
      ],
    },
    {
      question: "How much have your trauma symptoms decreased over time?",
      name: "q5",
      options: [
        { label: "Not at all", value: -2 },
        { label: "A little", value: -1 },
        { label: "Somewhat", value: 0 },
        { label: "Quite a bit", value: 1 },
        { label: "Significantly", value: 2 },
      ],
    },
  ],
  7: [
    {
      question:
        "How often do you reflect on and embrace your personal values and beliefs?",
      name: "q1",
      options: [
        { label: "Never", value: -2 },
        { label: "Rarely (once or twice a week)", value: -1 },
        { label: "Sometimes (a few times a week)", value: 0 },
        { label: "Often (most days)", value: 1 },
        { label: "Always (daily)", value: 2 },
      ],
    },
    {
      question: "How confident are you in expressing your authentic self?",
      name: "q2",
      options: [
        { label: "Not confident at all", value: -2 },
        { label: "Slightly confident", value: -1 },
        { label: "Moderately confident", value: 0 },
        { label: "Confident", value: 1 },
        { label: "Very confident", value: 2 },
      ],
    },
    {
      question:
        "How frequently do you make choices aligned with your identity?",
      name: "q3",
      options: [
        { label: "Never", value: -2 },
        { label: "Rarely", value: -1 },
        { label: "Sometimes", value: 0 },
        { label: "Often", value: 1 },
        { label: "Always", value: 2 },
      ],
    },
    {
      question:
        "How well do you navigate identity-related challenges (e.g., cultural, gender, personal growth)?",
      name: "q4",
      options: [
        { label: "Not at all", value: -2 },
        { label: "Poorly", value: -1 },
        { label: "Somewhat", value: 0 },
        { label: "Well", value: 1 },
        { label: "Very well", value: 2 },
      ],
    },
    {
      question: "How much has your self-awareness and acceptance improved?",
      name: "q5",
      options: [
        { label: "Not at all", value: -2 },
        { label: "A little", value: -1 },
        { label: "Somewhat", value: 0 },
        { label: "Quite a bit", value: 1 },
        { label: "Significantly", value: 2 },
      ],
    },
  ],
  8: [
    {
      question:
        "How often do you use effective communication techniques with family members?",
      name: "q1",
      options: [
        { label: "Never (0 times per week)", value: -2 },
        { label: "Rarely (1-2 times per week)", value: -1 },
        { label: "Occasionally (3-4 times per week)", value: 0 },
        { label: "Regularly (5-6 times per week)", value: 1 },
        { label: "Daily (7+ times per week)", value: 2 },
      ],
    },
    {
      question:
        "How well do you set and enforce healthy boundaries within your family?",
      name: "q2",
      options: [
        { label: "Never (0 times per week)", value: -2 },
        { label: "Rarely (1-2 times per week)", value: -1 },
        { label: "Occasionally (3-4 times per week)", value: 0 },
        { label: "Regularly (5-6 times per week)", value: 1 },
        { label: "Daily (7+ times per week)", value: 2 },
      ],
    },
    {
      question: "How confident are you in handling parenting challenges?",
      name: "q3",
      options: [
        { label: "Never (0 times per week)", value: -2 },
        { label: "Rarely (1-2 times per week)", value: -1 },
        { label: "Occasionally (3-4 times per week)", value: 0 },
        { label: "Regularly (5-6 times per week)", value: 1 },
        { label: "Daily (7+ times per week)", value: 2 },
      ],
    },
    {
      question: "How frequently do you engage in positive family interactions?",
      name: "q4",
      options: [
        { label: "Never (0 times per week)", value: -2 },
        { label: "Rarely (1-2 times per week)", value: -1 },
        { label: "Occasionally (3-4 times per week)", value: 0 },
        { label: "Regularly (5-6 times per week)", value: 1 },
        { label: "Daily (7+ times per week)", value: 2 },
      ],
    },
    {
      question: "How much have family dynamics improved?",
      name: "q5",
      options: [
        { label: "Never (0 times per week)", value: -2 },
        { label: "Rarely (1-2 times per week)", value: -1 },
        { label: "Occasionally (3-4 times per week)", value: 0 },
        { label: "Regularly (5-6 times per week)", value: 1 },
        { label: "Daily (7+ times per week)", value: 2 },
      ],
    },
  ],
  9: [
    {
      question: "How often do you engage in positive self-talk?",
      name: "q1",
      options: [
        { label: "Never (0 times per week)", value: -2 },
        { label: "Rarely (1-2 times per week)", value: -1 },
        { label: "Occasionally (3-4 times per week)", value: 0 },
        {
          label: "Regularly (5-6 times per week)",
          value: 1,
        },
        {
          label: "Daily (7+ times per week)",
          value: 2,
        },
      ],
    },
    {
      question:
        "How confident are you in setting and achieving personal goals?",
      name: "q2",
      options: [
        { label: "Not confident at all", value: -2 },
        { label: "Slightly confident, but I need help", value: -1 },
        { label: "Somewhat confident", value: 0 },
        {
          label: "RConfident, I set and achieve goals regularly",
          value: 1,
        },
        {
          label: "Very confident, I set and achieve goals easily",
          value: 2,
        },
      ],
    },
    {
      question:
        "How well do you accept compliments and acknowledge your strengths?",
      name: "q3",
      options: [
        { label: "Not at all, I reject compliments", value: -2 },
        { label: "Rarely, I struggle to accept them", value: -1 },
        { label: "Somewhat, I accept them sometimes", value: 0 },
        {
          label: "Well, I accept compliments and recognize strengths",
          value: 1,
        },
        {
          label: "Very well, I appreciate compliments and know my strengths",
          value: 2,
        },
      ],
    },
    {
      question:
        "How frequently do you engage in activities that boost self-esteem?",
      name: "q4",
      options: [
        { label: "Never", value: -2 },
        { label: "Rarely", value: -1 },
        { label: "Sometimes", value: 0 },
        {
          label: "Often",
          value: 1,
        },
        {
          label: "Very Often",
          value: 2,
        },
      ],
    },
    {
      question: "How much has your self-confidence improved?",
      name: "q5",
      options: [
        { label: "No improvement", value: -2 },
        { label: "Minimal improvement", value: -1 },
        { label: "Some improvement", value: 0 },
        {
          label: "Significant improvement",
          value: 1,
        },
        {
          label: "Major improvement",
          value: 2,
        },
      ],
    },
  ],
  10: [
    {
      question:
        "How often do you use alternative coping strategies instead of substances?",
      name: "q1",
      options: [
        { label: "Never", value: -2 },
        { label: "Rarely", value: -1 },
        { label: "Sometimes", value: 0 },
        { label: "Often", value: 1 },
        { label: "Always", value: 2 },
      ],
    },
    {
      question: "How confident are you in resisting urges or cravings?",
      name: "q2",
      options: [
        { label: "Not confident at all", value: -2 },
        { label: "Slightly confident", value: -1 },
        { label: "Somewhat confident", value: 0 },
        {
          label: "Confident",
          value: 1,
        },
        {
          label: "Very confident",
          value: 2,
        },
      ],
    },
    {
      question:
        "How frequently do you engage in structured recovery activities (e.g., support groups, therapy)?",
      name: "q3",
      options: [
        { label: "Never", value: -2 },
        { label: "Rarely", value: -1 },
        { label: "Sometimes", value: 0 },
        { label: "Often", value: 1 },
        { label: "Very often", value: 2 },
      ],
    },
    {
      question: "How well do you manage stress without substance use?",
      name: "q4",
      options: [
        { label: "Not at all", value: -2 },
        { label: "Slightly", value: -1 },
        { label: "Somewhat", value: 0 },
        { label: "Well", value: 1 },
        { label: "Very well", value: 2 },
      ],
    },
    {
      question: "How much has your substance use decreased over time?",
      name: "q5",
      options: [
        { label: "No decerease", value: -2 },
        { label: "Minimal decerease", value: -1 },
        { label: "Some decerease", value: 0 },
        { label: "Significant decerease", value: 1 },
        { label: "Major decerease", value: 2 },
      ],
    },
  ],
  11: [
    {
      question: "How often do you feel motivated and engaged in your work?",
      name: "q1",
      options: [
        { label: "Never", value: -2 },
        { label: "Rarely", value: -1 },
        { label: "Sometimes", value: 0 },
        { label: "Often", value: 1 },
        { label: "Always", value: 2 },
      ],
    },
    {
      question: "How well do you manage workplace stress and challenges?",
      name: "q2",
      options: [
        { label: "Not well at all", value: -2 },
        { label: "Slightly well", value: -1 },
        { label: "Somewhat well", value: 0 },
        { label: "Well", value: 1 },
        { label: "Very well", value: 2 },
      ],
    },
    {
      question: "How confident are you in making career-related decisions?",
      name: "q3",
      options: [
        { label: "Not confident at all", value: -2 },
        { label: "Slightly confident", value: -1 },
        { label: "Somewhat confident", value: 0 },
        { label: "Confident", value: 1 },
        { label: "Very confident", value: 2 },
      ],
    },
    {
      question:
        "How frequently do you advocate for yourself professionally (e.g., boundaries, fair workload)?",
      name: "q4",
      options: [
        { label: "Never", value: -2 },
        { label: "Rarely", value: -1 },
        { label: "Sometimes", value: 0 },
        { label: "Often", value: 1 },
        { label: "Always", value: 2 },
      ],
    },
    {
      question:
        "How much has your job satisfaction and career confidence improved?",
      name: "q5",
      options: [
        { label: "No improvement", value: -2 },
        { label: "Minimal improvement", value: -1 },
        { label: "Some improvement", value: 0 },
        {
          label: "Significant improvement",
          value: 1,
        },
        {
          label: "Major improvement",
          value: 2,
        },
      ],
    },
  ],
  12: [
    {
      question:
        "How often do you use anger management techniques (e.g., deep breathing, cognitive reframing)?",
      name: "q1",
      options: [
        { label: "Never", value: -2 },
        { label: "Rarely", value: -1 },
        { label: "Sometimes", value: 0 },
        {
          label: "Often",
          value: 1,
        },
        {
          label: "Always",
          value: 2,
        },
      ],
    },
    {
      question: "How well can you de-escalate tense situations?",
      name: "q2",
      options: [
        { label: "Not well at all", value: -2 },
        { label: "Slightly well", value: -1 },
        { label: "Somewhat well", value: 0 },
        {
          label: "Well",
          value: 1,
        },
        {
          label: "Very well",
          value: 2,
        },
      ],
    },
    {
      question:
        "How frequently do you express frustration in a controlled way?",
      name: "q3",
      options: [
        { label: "Never", value: -2 },
        { label: "Rarely", value: -1 },
        { label: "Sometimes", value: 0 },
        {
          label: "Often",
          value: 1,
        },
        {
          label: "Always",
          value: 2,
        },
      ],
    },
    {
      question:
        "How confident are you in managing triggers without aggression?",
      name: "q4",
      options: [
        { label: "Not confident at all", value: -2 },
        { label: "Slightly confident", value: -1 },
        { label: "Somewhat confident", value: 0 },
        {
          label: "Confident",
          value: 1,
        },
        {
          label: "Very confident",
          value: 2,
        },
      ],
    },
    {
      question: "How much has your ability to regulate anger improved?",
      name: "q5",
      options: [
        { label: "No improvement", value: -2 },
        { label: "Minimal improvement", value: -1 },
        { label: "Some improvement", value: 0 },
        {
          label: "Significant improvement",
          value: 1,
        },
        {
          label: "Major improvement",
          value: 2,
        },
      ],
    },
  ],
  13: [
    {
      question: "How often do you engage in mindful eating habits?",
      name: "q1",
      options: [
        { label: "Never", value: -2 },
        { label: "Rarely", value: -1 },
        { label: "Sometimes", value: 0 },
        {
          label: "Often",
          value: 1,
        },
        {
          label: "Always",
          value: 2,
        },
      ],
    },
    {
      question:
        "How well can you challenge negative thoughts about body image?",
      name: "q2",
      options: [
        { label: "Not well at all", value: -2 },
        { label: "Slightly well", value: -1 },
        { label: "Somewhat well", value: 0 },
        { label: "Well", value: 1 },
        { label: "Very well", value: 2 },
      ],
    },
    {
      question:
        "How frequently do you eat in response to hunger rather than emotions?",
      name: "q3",
      options: [
        { label: "Never", value: -2 },
        { label: "Rarely", value: -1 },
        { label: "Sometimes", value: 0 },
        {
          label: "Often",
          value: 1,
        },
        {
          label: "Always",
          value: 2,
        },
      ],
    },
    {
      question: "How confident are you in managing food-related stress?",
      name: "q4",
      options: [
        { label: "Not confident at all", value: -2 },
        { label: "Slightly confident", value: -1 },
        { label: "Somewhat confident", value: 0 },
        {
          label: "Confident",
          value: 1,
        },
        {
          label: "Very confident",
          value: 2,
        },
      ],
    },
    {
      question:
        "How much has your relationship with food and body image improved?",
      name: "q5",
      options: [
        { label: "No improvement", value: -2 },
        { label: "Minimal improvement", value: -1 },
        { label: "Some improvement", value: 0 },
        {
          label: "Significant improvement",
          value: 1,
        },
        {
          label: "Major improvement",
          value: 2,
        },
      ],
    },
  ],
  14: [
    {
      question: "How often do you engage in self-care during life transitions?",
      name: "q1",
      options: [
        { label: "Never", value: -2 },
        { label: "Rarely", value: -1 },
        { label: "Sometimes", value: 0 },
        {
          label: "Often",
          value: 1,
        },
        {
          label: "Always",
          value: 2,
        },
      ],
    },
    {
      question: "How well do you adapt to new routines and responsibilities?",
      name: "q2",
      options: [
        { label: "Not well at all", value: -2 },
        { label: "Slightly well", value: -1 },
        { label: "Somewhat well", value: 0 },
        { label: "Well", value: 1 },
        { label: "Very well", value: 2 },
      ],
    },
    {
      question: "How confident are you in facing uncertainties?",
      name: "q3",
      options: [
        { label: "Not confident at all", value: -2 },
        { label: "Slightly confident", value: -1 },
        { label: "Somewhat confident", value: 0 },
        {
          label: "Confident",
          value: 1,
        },
        {
          label: "Very confident",
          value: 2,
        },
      ],
    },
    {
      question: "How frequently do you use coping strategies for change?",
      name: "q4",
      options: [
        { label: "Never", value: -2 },
        { label: "Rarely", value: -1 },
        { label: "Sometimes", value: 0 },
        {
          label: "Often",
          value: 1,
        },
        {
          label: "Always",
          value: 2,
        },
      ],
    },
    {
      question: "How much has your adjustment to change improved?",
      name: "q5",
      options: [
        { label: "No improvement", value: -2 },
        { label: "Minimal improvement", value: -1 },
        { label: "Some improvement", value: 0 },
        {
          label: "Significant improvement",
          value: 1,
        },
        {
          label: "Major improvement",
          value: 2,
        },
      ],
    },
  ],
  15: [
    {
      question: "How often do you engage in adaptive coping strategies?",
      name: "q1",
      options: [
        { label: "Never", value: -2 },
        { label: "Rarely (once in a while)", value: -1 },
        { label: "Sometimes (a few times a month)", value: 0 },
        { label: "Often (weekly)", value: 1 },
        { label: "Always (daily)", value: 2 },
      ],
    },
    {
      question: "How well do you advocate for accessibility and support?",
      name: "q2",
      options: [
        { label: "Not at all", value: -2 },
        { label: "Poorly", value: -1 },
        { label: "Somewhat", value: 0 },
        { label: "Well", value: 1 },
        { label: "Very well", value: 2 },
      ],
    },
    {
      question: "How confident are you in managing daily activities?",
      name: "q3",
      options: [
        { label: "Not confident at all", value: -2 },
        { label: "Slightly confident", value: -1 },
        { label: "Moderately confident", value: 0 },
        { label: "Confident", value: 1 },
        { label: "Very confident", value: 2 },
      ],
    },
    {
      question:
        "How frequently do you engage in self-care and emotional regulation?",
      name: "q4",
      options: [
        { label: "Never", value: -2 },
        { label: "Rarely", value: -1 },
        { label: "Sometimes", value: 0 },
        { label: "Often", value: 1 },
        { label: "Very often", value: 2 },
      ],
    },
    {
      question: "How much has your overall well-being improved?",
      name: "q5",
      options: [
        { label: "Not at all", value: -2 },
        { label: "A little", value: -1 },
        { label: "Somewhat", value: 0 },
        { label: "Quite a bit", value: 1 },
        { label: "Significantly", value: 2 },
      ],
    },
  ],
  16: [
    {
      question:
        "How often do you engage in self-care and health management activities?",
      name: "q1",
      options: [
        { label: "Never", value: -2 },
        { label: "Rarely (once in a while)", value: -1 },
        { label: "Sometimes (a few times a month)", value: 0 },
        { label: "Often (weekly)", value: 1 },
        { label: "Always (daily)", value: 2 },
      ],
    },
    {
      question:
        "How well do you cope emotionally with health-related challenges?",
      name: "q2",
      options: [
        { label: "Not at all", value: -2 },
        { label: "Poorly", value: -1 },
        { label: "Somewhat", value: 0 },
        { label: "Well", value: 1 },
        { label: "Very well", value: 2 },
      ],
    },
    {
      question: "How confident are you in advocating for your health needs?",
      name: "q3",
      options: [
        { label: "Not confident at all", value: -2 },
        { label: "Slightly confident", value: -1 },
        { label: "Moderately confident", value: 0 },
        { label: "Confident", value: 1 },
        { label: "Very confident", value: 2 },
      ],
    },
    {
      question:
        "How frequently do you engage in supportive social interactions?",
      name: "q4",
      options: [
        { label: "Never", value: -2 },
        { label: "Rarely", value: -1 },
        { label: "Sometimes", value: 0 },
        { label: "Often", value: 1 },
        { label: "Very often", value: 2 },
      ],
    },
    {
      question:
        "How much has your ability to manage your health condition improved?",
      name: "q5",
      options: [
        { label: "Not at all", value: -2 },
        { label: "A little", value: -1 },
        { label: "Somewhat", value: 0 },
        { label: "Quite a bit", value: 1 },
        { label: "Significantly", value: 2 },
      ],
    },
  ],
};

export const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGES_BASE_URL || "https://mindapp.mindbridge.solutions:4000";

export const treatment_goals = [
  {
    label: "Coping With Disability",
    value: "Coping_With_Disability",
    goal: "Improve emotional adjustment and daily functioning with a disability",
    id: 1,
  },
  {
    label: "Chronic Illness and Health Related Concerns",
    value: "Chronic_Illness_and_Health_Related_Concerns",
    goal: "Improve emotional coping with chronic illness and maintain well-being.",
    id: 2,
  },
  {
    label: "Relationship Issues",
    value: "Relationship_Issues",
    goal: "Improve communication, trust, and emotional connection in relationships.",
    id: 3,
  },
  {
    label: "Grief and Loss",
    value: "Grief_and_Loss",
    goal: "Develop coping strategies to process grief and integrate loss into daily life.",
    id: 4,
  },
  {
    label: "Trauma and PTSD",
    value: "Trauma_and_PTSD",
    goal: "Reduce trauma-related symptoms and increase emotional regulation.",
    id: 5,
  },
  {
    label: "Identity and Self Exploration",
    value: "Identity_and_Self_Exploration",
    goal: "Develop a strong sense of self and personal identity.",
    id: 6,
  },
  {
    label: "Family and Parenting Issues",
    value: "Family_and_Parenting_Issues",
    goal: "Strengthen family relationships and develop effective parenting strategies.",
    id: 7,
  },

  {
    label: "Anxiety Management",
    value: "Anxiety_Management",
    goal: "Reduce anxiety symptoms and increase the ability to handle stressful situations.",
    id: 8,
  },
  {
    label: "Depression",
    value: "Depression",
    goal: "Improve mood, motivation, and ability to engage in daily activities.",
    id: 9,
  },
  {
    label: "Stress Management",
    value: "Stress_Management",
    goal: "Develop healthier coping mechanisms to handle stress effectively.",
    id: 10,
  },
  {
    label: "Self-Esteem and Self-Confidence Issues",
    value: "Self_Esteem_and_Self_Confidence_Issues",
    goal: "Build a more positive self-image and increase self-worth.",
    id: 11,
  },
  {
    label: "Addiction and Substance Abuse",
    value: "Addiction_and_Substance_Abuse",
    goal: "Reduce substance use and develop healthier coping mechanisms.",
    id: 12,
  },
  {
    label: "Work and Career-Related Issues",
    value: "Work_and_Career_Related_Issues",
    goal: "Increase job satisfaction, career confidence, and work-life balance.",
    id: 13,
  },
  {
    label: "Anger Management",
    value: "Anger_Management",
    goal: "Develop healthier ways to express and regulate anger.",
    id: 14,
  },
  {
    label: "Eating Disorders and Body Image Issues",
    value: "Eating_Disorders_and_Body_Image_Issues",
    goal: "Develop a healthier relationship with food and body image.",
    id: 15,
  },
  {
    label: "Life Transitions",
    value: "Life_Transitions",
    goal: "Adjust to major life changes with resilience and stability.",
    id: 16,
  },
];
