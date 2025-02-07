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
  MailIcon,
  MenuIcon,
  PdfIcon,
  PrintIcon,
  ServiceIcon,
  SessionIcon,
  UsersIcon,
} from "../public/assets/icons";
import CustomButton from "../components/CustomButton";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import Dropdown from "../components/Dropdown";
import moment from "moment";
import { TooltipButton, TooltipContainer } from "../components/Tooltip";

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

function exportToPDF(columns, data, tableCaption) {
  const doc = new jsPDF();
  const headings = columns
    .filter((column) => column.name)
    .map((column) => column.name);
  const rows = data.map((item) => Object.values(item));

  doc.text(tableCaption, 20, 10);
  doc.autoTable({
    head: [headings],
    body: rows,
  });

  doc.save(`${tableCaption}.pdf`);
}

function exportToExcel(columns, data, tableCaption) {
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

  XLSX.utils.book_append_sheet(workbook, worksheet, tableCaption);

  XLSX.writeFile(workbook, `${tableCaption}.xlsx`);
}

export const SIDEBAR_HEADINGS = [
  {
    id: 1,
    icon: <DashboardIcon />,
    url: "/dashboard",
    title: "Dashboard",
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
];

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
        // ignoreRowClick: true,
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
      selectorId: "serialNumber",
      ...(showCell && {
        cell: (row, handleClick) => (
          <div
            style={{ color: "var(--link-color)", cursor: "pointer" }}
            onClick={() =>
              {
              handleClick(row.req_id)}
            }
          >
            {row?.client_clam_num || "N/A"}
          </div>
        ),
      }),
    },
    {
      name: "Session Date",
      selector: (row) => row.req_dte,
      sortable: true,
      format: (row) =>
        moment(row.req_dte, "dddd, MMMM D, YYYY").format("D MMMM YY"),
      selectorId: "req_dte",
    },
    {
      name: "Session Time",
      selector: (row) => row.req_time || "NA",
      sortable: true,
      format: (row) =>
        moment.utc(row.req_time, "HH:mm:ss.SSSZ").format("h:mm A"),
      selectorId: "req_time",
    },

    {
      name: "",
      cell: (row, index) => (
        <Dropdown
          ref={dropdownRef}
          row={row}
          index={index}
          handleCellClick={handleCellClick}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
        />
      ),
      width: "50px",
      allowOverflow: true,
      button: true,
    },
  ];
};
export const SESSION_TABLE_COLUMNS = (args) => {
  const {
    // handleNoteOpen,
    // handleSendMail,
    handleCellClick,
    handleEdit,
    handleDelete,
    dropdownRef,
  } = args || {};
  return [
    {
      name: "Date",
      selector: (row) => row.intake_date,
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
      selector: (row) => row.scheduled_time,
      sortable: true,
      selectorId: "scheduled_time",
    },
    {
      name: "Online/In Person",
      selector: (row) => row.session_format,
      sortable: true,
      selectorId: "session_format",
    },
    // {
    //   name: "Notes",
    //   selector: (row) => row.notes,
    //   sortable: true,
    //   cell: (row) =>
    //     !row.notes ? (
    //       <CustomButton
    //         icon={<AddIcon />}
    //         customClass="add-notes"
    //         title="Add Notes"
    //         onClick={() => handleNoteOpen(row, "add")}
    //       />
    //     ) : (
    //       <span
    //         onClick={() => handleNoteOpen(row, "edit")}
    //         style={{
    //           display: "flex",
    //           alignItems: "center",
    //           cursor: "pointer",
    //           gap: "4px",
    //           maxWidth: "150px",
    //         }}
    //       >
    //         <span
    //           style={{
    //             overflow: "hidden",
    //             textOverflow: "ellipsis",
    //             whiteSpace: "nowrap",
    //             flex: 1,
    //           }}
    //         >
    //           {row.notes}
    //         </span>
    //         <EditIcon />
    //       </span>
    //     ),
    //   selectorId: "notes",
    // },
    // {
    //   name: "Email Send Notification",
    //   selector: (row) => row.emailSendNotification,
    //   sortable: true,
    //   cell: (row) => (
    //     <CustomButton
    //       icon={<MailIcon />}
    //       customClass="send-mail"
    //       title="Send Email"
    //       onClick={() => handleSendMail(row)}
    //     />
    //   ),
    //   selectorId: "emailSendNotification",
    // },
    {
      name: "",
      cell: (row) => (
        <Dropdown
          ref={dropdownRef} // Pass the ref to the Dropdown component
          row={row}
          handleCellClick={handleCellClick}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
        />
      ),
      width: "50px",
      allowOverflow: true,
      ignoreRowClick: true,
      button: true,
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
    // {
    //   name: "Attached Forms",
    //   cell: (row) => {
    //     console.log(row, "row");
    //     const attachedFormIds = Array.isArray(row?.forms_array)
    //       ? row?.forms_array
    //       : [];
    //     const attachedFormCodes = attachedFormIds
    //       .map((id) => {
    //         const form = forms.find((form) => form.form_id === Number(id));
    //         return form?.form_cde || null;
    //       })
    //       .filter((code) => code)
    //       .join(", ");

    //     return (
    //       <span style={{ textAlign: "center" }}>
    //         {attachedFormCodes || "--"}
    //       </span>
    //     );
    //   },
    // },
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
    // {
    //   name: "Email Send Notification",
    //   selector: (row) => row.emailSendNotification,
    //   sortable: true,
    //   cell: (row) => (
    //     <CustomButton
    //       icon={<MailIcon />}
    //       customClass="send-mail"
    //       title="Send Email"
    //       onClick={() => handleSendMail(row)}
    //     />
    //   ),
    //   selectorId: "emailSendNotification",
    // },
    // {
    //   name: "",
    //   minWidth: "220px",
    //   cell: (row, rowIndex) => {
    //     const scheduledTime = moment.utc(
    //       `${row.intake_date} ${row.scheduled_time}`,
    //       "YYYY-MM-DD HH:mm:ssZ"
    //     );
    //     const sessionStatus = row?.session_status.toLowerCase();
    //     const showNoShowButtonDisplay =
    //       initialData &&
    //       scheduledTime.isAfter(currentTime) &&
    //       sessionStatus != "show" &&
    //       sessionStatus != "no-show";
    //     return (
    //       <div style={{ cursor: "pointer" }}>
    //         {showNoShowButtonDisplay && (
    //           <div
    //             className="action-buttons-container"
    //             style={{ display: "flex" }}
    //           >
    //             <CustomButton
    //               type="button"
    //               title="Show"
    //               customClass="show-button"
    //               onClick={() => {
    //                 setActiveRow(row);
    //                 setShowStatusConfirmationModal(true);
    //               }}
    //             />
    //             <CustomButton
    //               type="button"
    //               title="No Show"
    //               customClass="no-show-button"
    //               onClick={() => handleNoShowStatus(row)}
    //             />
    //             <CustomButton
    //               type="button"
    //               title="Edit"
    //               customClass="edit-button"
    //               onClick={() => {
    //                 setEditSessionModal(true);
    //                 setActiveRow({ ...row, rowIndex });
    //                 const tempData = initialData
    //                   ? scheduledSession
    //                   : sessionTableData?.filter((data) => {
    //                       return data?.is_additional === 0;
    //                     });

    //                 if (rowIndex < tempData.length - 1) {
    //                   let minDate = new Date(row.intake_date);
    //                   let maxDate = new Date(
    //                     tempData[rowIndex + 1].intake_date
    //                   );
    //                   setSessionRange((prev) => ({
    //                     ...prev,
    //                     min: formatDate(minDate),
    //                     max: formatDate(maxDate),
    //                   }));
    //                 } else {
    //                   setSessionRange((prev) => ({
    //                     min: false,
    //                     max: false,
    //                   }));
    //                 }
    //               }}
    //             />
    //           </div>
    //         )}
    //         {!initialData && (
    //           <CustomButton
    //             type="button"
    //             title="Edit"
    //             customClass="edit-button"
    //             onClick={() => {
    //               setEditSessionModal(true);
    //               setActiveRow({
    //                 ...row,
    //                 rowIndex,
    //                 sessionFormType: initialData
    //                   ? "UpdateSessionForm"
    //                   : "CreateSessionForm",
    //               });
    //               const tempData = initialData
    //                 ? scheduledSession
    //                 : sessionTableData?.filter((data) => {
    //                     return data?.is_additional === 0;
    //                   });

    //               if (rowIndex < tempData.length - 1) {
    //                 let minDate = new Date(row.intake_date);
    //                 let maxDate = new Date(tempData[rowIndex + 1].intake_date);
    //                 maxDate.setDate(maxDate.getDate() - 1);
    //                 setSessionRange((prev) => ({
    //                   ...prev,
    //                   min: formatDate(minDate),
    //                   max: formatDate(maxDate),
    //                 }));
    //               }
    //             }}
    //           />
    //         )}
    //       </div>
    //     );
    //   },
    // },
  ];
};

// export const SESSION_LIST_DATA = (
//   handleNoteOpen,
//   handleSendMail,
//   handleCellClick,
//   handleEdit,
//   handleDelete,
//   dropdownRef
// ) => ({
//   today: {
//     columns: [
//       {
//         name: "Date",
//         selector: (row) => row.date,
//         sortable: true,
//         selectorId: "date",
//       },
//       {
//         name: "Serial Number",
//         selector: (row) => row.serialNumber,
//         sortable: true,
//         selectorId: "serialNumber",
//       },
//       {
//         name: "Client Name",
//         selector: (row) => row.clientName,
//         sortable: true,
//         selectorId: "clientName",
//       },
//       {
//         name: "Service Type",
//         selector: (row) => row.serviceType,
//         sortable: true,
//         selectorId: "serviceType",
//       },
//       {
//         name: "Start Time",
//         selector: (row) => row.startTime,
//         sortable: true,
//         selectorId: "startTime",
//       },
//       {
//         name: "Online/In Person",
//         selector: (row) => row.onlineInPerson,
//         sortable: true,
//         selectorId: "onlineInPerson",
//       },
//       {
//         name: "Notes",
//         selector: (row) => row.notes,
//         sortable: true,
//         cell: (row) =>
//           !row.notes ? (
//             <CustomButton
//               icon={<AddIcon />}
//               customClass="add-notes"
//               title="Add Notes"
//               onClick={() => handleNoteOpen(row)}
//             />
//           ) : (
//             <span
//               onClick={() => handleNoteOpen(row)}
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 cursor: "pointer",
//                 gap: "4px",
//               }}
//             >
//               {row.notes}
//               <EditIcon />
//             </span>
//           ),
//         selectorId: "notes",
//       },
//       {
//         name: "Email Send Notification",
//         selector: (row) => row.emailSendNotification,
//         sortable: true,
//         cell: (row) => (
//           <CustomButton
//             icon={<MailIcon />}
//             customClass="send-mail"
//             title="Send Email"
//             onClick={() => handleSendMail(row)}
//           />
//         ),
//         selectorId: "emailSendNotification",
//       },
//       {
//         name: "",
//         cell: (row) => (
//           <Dropdown
//             ref={dropdownRef} // Pass the ref to the Dropdown component
//             row={row}
//             handleCellClick={handleCellClick}
//             handleEdit={handleEdit}
//             handleDelete={handleDelete}
//           />
//         ),
//         width: "50px",
//         allowOverflow: true,
//         ignoreRowClick: true,
//         button: true,
//       },
//     ],

//     data: [
//       {
//         id: 1,
//         date: 2024 - 11 - 21,
//         serialNumber: "857565757",
//         clientName: "New Client",
//         serviceType: "RTW_TR",
//         startTime: "14:00:00",
//         onlineInPerson: "OFFLINE",
//         notes: "",
//         emailSendNotification: "",
//       },
//     ],
//   },
//   tomorrow: {
//     columns: [
//       {
//         name: "Date",
//         selector: (row) => row.date,
//         sortable: true,
//         selectorId: "date",
//       },
//       {
//         name: "Serial Number",
//         selector: (row) => row.serialNumber,
//         sortable: true,
//         selectorId: "serialNumber",
//       },
//       {
//         name: "Client Name",
//         selector: (row) => row.clientName,
//         sortable: true,
//         selectorId: "clientName",
//       },
//       {
//         name: "Service Type",
//         selector: (row) => row.serviceType,
//         sortable: true,
//         selectorId: "serviceType",
//       },
//       {
//         name: "Start Time",
//         selector: (row) => row.startTime,
//         sortable: true,
//         selectorId: "startTime",
//       },
//       {
//         name: "Online/In Person",
//         selector: (row) => row.onlineInPerson,
//         sortable: true,
//         selectorId: "onlineInPerson",
//       },
//       {
//         name: "Notes",
//         selector: (row) => row.notes,
//         sortable: true,
//         cell: (row) =>
//           !row.notes ? (
//             <CustomButton
//               icon={<AddIcon />}
//               customClass="add-notes"
//               title="Add Notes"
//               onClick={() => handleNoteOpen(row)}
//             />
//           ) : (
//             row.notes
//           ),
//         selectorId: "notes",
//       },
//       {
//         name: "Email Send Notification",
//         selector: (row) => row.emailSendNotification,
//         sortable: true,
//         cell: (row) => (
//           <CustomButton
//             icon={<MailIcon />}
//             customClass="send-mail"
//             title="Send Email"
//             onClick={() => handleSendMail(row)}
//           />
//         ),
//         selectorId: "emailSendNotification",
//       },
//       {
//         name: "",
//         cell: (row) => (
//           <Dropdown
//             ref={dropdownRef} // Pass the ref to the Dropdown component
//             row={row}
//             handleCellClick={handleCellClick}
//             handleEdit={handleEdit}
//             handleDelete={handleDelete}
//           />
//         ),
//         width: "50px",
//         allowOverflow: true,
//         ignoreRowClick: true,
//         button: true,
//       },
//     ],

//     data: [
//       {
//         id: 1,
//         date: 2024 - 11 - 21,
//         serialNumber: "857565757",
//         clientName: "New Client",
//         serviceType: "RTW_TR",
//         startTime: "14:00:00",
//         onlineInPerson: "OFFLINE",
//         notes: "",
//       },
//       {
//         id: 2,
//         date: 2024 - 11 - 21,
//         serialNumber: "857565757",
//         clientName: "New Client",
//         serviceType: "RTW_TR",
//         startTime: "14:00:00",
//         onlineInPerson: "OFFLINE",
//         notes: "",
//       },
//     ],
//   },
// });

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
    selector: (row) => Number(row.total_invoice).toFixed(2),
    sortable: true,
    selectorId: "total_invoice",
  },
  {
    name: "Tax",
    selector: (row) => Number(row.gst).toFixed(2),
    sortable: true,
    selectorId: "gst",
  },
  {
    name: "Total Invoice + Tax",
    selector: (row) => Number(row.total_invoice) + Number(row.gst),
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
      <Dropdown
        ref={dropdownRef} // Pass the ref to the Dropdown component
        row={row}
        handleCellClick={handleCellClick}
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
  dropdownRef
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
    name: "Session Amount",
    selector: (row) => `$${row.session_price}`,
  },
  {
    name: "GST",
    selector: (row) => `${row.session_gst}%`,
  },
  {
    name: "T. Amount",
    selector: (row) => `$${row.session_counselor_amt + row.session_price}`,
  },
  {
    name: "Amount to Associate",
    selector: (row) => `$${row.session_counselor_amt}`,
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
            width: "56px",
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
  {
    name: "",
    cell: (row, index) => (
      <Dropdown
        ref={dropdownRef}
        row={row}
        index={index}
        handleCellClick={handleCellClick}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
      />
    ),
    width: "50px",
    allowOverflow: true,
    button: true,
  },
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
        onClick: () => exportToPDF(columns, data, tableCaption), // Pass `data` here
      },
      {
        name: "Download Excel",
        icon: <ExcelIcon />,
        onClick: () => exportToExcel(columns, data, tableCaption), // Pass `data` here
      },
      {
        name: "Download CSV",
        icon: <CsvIcon />,
        onClick: () => exportToCSV(columns, data, tableCaption), // Pass `data` here
      },
    ],
  },
];

export const REPORTS_TABLE_DATA = {
  columns: [
    {
      name: "Client Name",
      selector: (row) => row.clientName,
      sortable: true,
      selectorId: "clientName",
    },
    {
      name: "Report Name",
      selector: (row) => row.reportName,
      sortable: true,
      selectorId: "reportName",
    },
    {
      name: "Report Status",
      selector: (row) => row.reportStatus,
      sortable: true,
      selectorId: "reportStatus",
    },
    {
      name: "Due Date",
      selector: (row) => row.dueDate,
      sortable: true,
      format: (row) => new Date(row.dueDate).toLocaleDateString("en-US"), // Format date
      selectorId: "dueDate",
    },
  ],
  data: [
    {
      id: 1,
      clientName: "Client A",
      reportName: "Quarterly Report Q1",
      reportStatus: "Completed",
      dueDate: "2024-12-15",
    },
    {
      id: 2,
      clientName: "Client B",
      reportName: "Annual Report 2024",
      reportStatus: "Pending",
      dueDate: "2024-12-20",
    },
    {
      id: 3,
      clientName: "Client C",
      reportName: "Sales Report Q4",
      reportStatus: "In Progress",
      dueDate: "2024-12-10",
    },
    {
      id: 4,
      clientName: "Client D",
      reportName: "Financial Statement Q3",
      reportStatus: "Completed",
      dueDate: "2024-12-05",
    },
  ],
};

export const ASSESSMENT_DATA = {
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
      selectorId: "serialNumber",
    },
    {
      name: "Report Type",
      selector: (row) => row.reportType,
      sortable: true,
      selectorId: "reportType",
    },
  ],
  data: [
    {
      id: 1,
      clientName: "Client A",
      serialNumber: "SN12345",
      reportType: "Monthly",
    },
    {
      id: 2,
      clientName: "Client B",
      serialNumber: "SN67890",
      reportType: "Quarterly",
    },
    {
      id: 3,
      clientName: "Client C",
      serialNumber: "SN11223",
      reportType: "Annual",
    },
    {
      id: 4,
      clientName: "Client D",
      serialNumber: "SN44556",
      reportType: "Monthly",
    },
  ],
};

export const CLIENT_MANAGEMENT_DATA = (
  handleCellClick,
  handleEdit,
  handleDelete,
  handleEditSessionInfo,
  dropdownRef
) => {
  return [
    {
      name: "ID",
      selector: (row) => row.user_profile_id,
      sortable: true,
      selectorId: "user_profile_id",
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
    {
      name: "",
      cell: (row) => (
        <Dropdown
          ref={dropdownRef}
          row={row}
          handleCellClick={handleCellClick}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
        />
      ),
      width: "50px",
      allowOverflow: true,
      button: true,
    },
  ];
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
      text: "I showed interest in my spouse or partner’s activities.",
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
      text: "I was interested in my children’s activities.",
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
      text: "I had trouble being supportive of my classmates’ achievements.",
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
      text: "I had trouble managing my medical care (for example, medications, doctors’ appointments, physical therapy, etc).",
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
      when: (row) => row.has_schedule,
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
