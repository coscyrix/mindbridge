import React, { useEffect, useState } from "react";
import { SessionHistoryContainer } from "../styles/session-history";
import { useRouter } from "next/router";
import CustomSearch from "../components/CustomSearch";
import CustomClientDetails from "../components/CustomClientDetails";
import CommonServices from "../services/CommonServices";
import { useReferenceContext } from "../context/ReferenceContext";
import { toast } from "react-toastify";
import CustomLoader from "../components/Loader/CustomLoader";
import moment from "moment";
import { useQueryData } from "../utils/hooks/useQueryData";
import { QUERY_KEYS } from "../utils/constants";

function Appointments() {
  const [appointmentsToDisplay, setAppointmentsToDisplay] = useState([]);
  const [filterText, setFilterText] = useState("");
  const { userObj } = useReferenceContext();

  // Fetch appointments using React Query (same key as Sidebar for cache sharing)
  const {
    data: appointments,
    isPending: loading,
    error,
  } = useQueryData(
    QUERY_KEYS.APPOINTMENTS(userObj?.user_profile_id),
    async () => {
      const response = await CommonServices.getMyAppointments(1000);
      if (response.status === 200) {
        return response.data?.data || response.data || [];
      }
      return [];
    },
    userObj?.role_id === 2 && !!userObj?.user_profile_id // Only fetch for counselors
  );

  // Define table columns
  const appointmentColumns = [
    {
      name: "Client Name",
      selector: (row) => row.customer_name || "N/A",
      sortable: true,
      wrap: true,
    },
    {
      name: "Client Email",
      selector: (row) => row.customer_email || "N/A",
      sortable: true,
      wrap: true,
    },
    {
      name: "Service",
      selector: (row) => row.service || "N/A",
      sortable: true,
      wrap: true,
    },
    {
      name: "Appointment Date",
      selector: (row) => {
        if (row.appointment_date) {
          return moment(row.appointment_date).format("MMM DD, YYYY");
        }
        return "N/A";
      },
      sortable: true,
      wrap: true,
    },
    {
      name: "Sent At",
      selector: (row) => {
        if (row.sent_at) {
          return moment(row.sent_at).format("MMM DD, YYYY HH:mm");
        }
        return "N/A";
      },
      sortable: true,
      wrap: true,
    },
  ];

  // Update displayed appointments when data or filter changes
  useEffect(() => {
    let filteredData = appointments || [];

    if (filterText) {
      filteredData = filteredData?.filter((row) => {
        return (
          row.customer_name?.toLowerCase().includes(filterText.toLowerCase()) ||
          row.customer_email?.toLowerCase().includes(filterText.toLowerCase()) ||
          row.service?.toLowerCase().includes(filterText.toLowerCase())
        );
      });
    }

    setAppointmentsToDisplay(filteredData);
  }, [filterText, appointments]);

  // Show error toast if query fails
  useEffect(() => {
    if (error) {
      toast.error(
        error?.response?.data?.message || "Error fetching appointments",
        {
          position: "top-right",
        }
      );
    }
  }, [error]);

  if (!userObj || userObj.role_id !== 2) {
    return (
      <div style={{ padding: "20px" }}>
        <p>Access denied. This page is only available for counselors.</p>
      </div>
    );
  }

  return (
    <SessionHistoryContainer>
      <div className="header-wrapper">
        <h2>Appointments</h2>
        <p>
          View all appointment requests sent to you. This includes client
          information, requested services, and appointment dates.
        </p>
      </div>
      {loading ? (
        <CustomLoader style={{ top: "40vh", left: "50vw" }} />
      ) : (
        <CustomClientDetails
          tableData={{
            columns: appointmentColumns,
            data: appointmentsToDisplay,
          }}
          selectableRows={false}
          loading={loading}
          tableCaption="Appointment Requests"
        >
          <div className="user-info-selects">
            <div className="custom-search-wrapper">
              <CustomSearch
                onFilter={(e) => setFilterText(e.target.value)}
                filterText={filterText}
                placeholder="Search by client name, email, or service..."
              />
            </div>
          </div>
        </CustomClientDetails>
      )}
    </SessionHistoryContainer>
  );
}

export default Appointments;

