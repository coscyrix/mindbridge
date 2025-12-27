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
import { useMutationData } from "../utils/hooks/useMutationData";
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

  // Get counselor_profile_id from first appointment (all appointments are for the same counselor)
  const counselorProfileId = appointments?.[0]?.counselor_profile_id;

  // Mutation for sending intake form
  const { mutate: sendIntakeForm, isPending: isSendingIntakeForm } =
    useMutationData(
      ["send-intake-form"],
      async (payload: {
        appointment_id: number;
        counselor_profile_id: number;
      }) => {
        const response = await CommonServices.sendIntakeForm(payload);
        if (response.status !== 200 && response.status !== 201) {
          throw new Error(
            response.data?.message || "Failed to send intake form"
          );
        }
        return response;
      },
      QUERY_KEYS.APPOINTMENTS(userObj?.user_profile_id)[0] // Invalidate appointments query after success
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
    {
      name: "Action",
      cell: (row: any) => {
        const handleSendIntakeForm = () => {
          const profileId = row.counselor_profile_id || counselorProfileId;

          if (!profileId) {
            toast.error(
              "Counselor profile ID not found. Please refresh the page."
            );
            return;
          }

          if (!row.id) {
            toast.error("Appointment ID not found");
            return;
          }

          sendIntakeForm({
            appointment_id: row.id,
            counselor_profile_id: profileId,
          });
        };

        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSendIntakeForm();
            }}
            disabled={isSendingIntakeForm}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              border: "1px solid #1a73e8",
              background: "#fff",
              color: "#1a73e8",
              cursor: isSendingIntakeForm ? "not-allowed" : "pointer",
              fontSize: "14px",
              fontWeight: 500,
              transition: "all 0.2s ease",
              opacity: isSendingIntakeForm ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isSendingIntakeForm) {
                const target = e.target as HTMLButtonElement;
                target.style.background = "#1a73e8";
                target.style.color = "#fff";
              }
            }}
            onMouseLeave={(e) => {
              if (!isSendingIntakeForm) {
                const target = e.target as HTMLButtonElement;
                target.style.background = "#fff";
                target.style.color = "#1a73e8";
              }
            }}
          >
            {isSendingIntakeForm ? "Sending..." : "Send Intake Form"}
          </button>
        );
      },
      width: "180px",
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
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
          row.customer_email
            ?.toLowerCase()
            .includes(filterText.toLowerCase()) ||
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
