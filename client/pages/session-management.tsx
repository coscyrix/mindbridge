import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { api } from "../utils/auth";
import { toast } from "react-toastify";
import ApiConfig from "../config/apiConfig";
import ConfirmationModal from "../components/ConfirmationModal";
import moment from "moment";
import SessionCard from "../components/SessionManagement/SessionCard";
import SessionInfo from "../components/SessionManagement/SessionInfo";
import RescheduleModal from "../components/SessionManagement/RescheduleModal";
import { Session, SessionData } from "../components/SessionManagement/types";
import {
  SessionManagementContainer,
  SessionCardContainer,
  LoadingContainer,
  ErrorContainer,
} from "../styles/session-management";
import { formatDateTime } from "../utils/helper";

function SessionManagement() {
  const router = useRouter();
  const { hash } = router.query;
  const [loading, setLoading] = useState<boolean>(false);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [rescheduleModalOpen, setRescheduleModalOpen] =
    useState<boolean>(false);
  const [cancelModalOpen, setCancelModalOpen] = useState<boolean>(false);
  const [newDate, setNewDate] = useState<Date | null>(null);
  const [newTime, setNewTime] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<{
    minDate: Date | null;
    maxDate: Date | null;
  }>({ minDate: null, maxDate: null });

  useEffect(() => {
    if (hash) {
      fetchSessionByHash();
    }
  }, [hash]);

  // Debug log to check what sessions are being received
  useEffect(() => {
    if (sessionData?.session_obj) {
      console.log("All sessions received:", sessionData.session_obj);
      const upcoming = sessionData.session_obj.filter((session) => {
        if (session.is_report) return false;
        const status = String(session.session_status || "").toUpperCase();
        if (status !== "SCHEDULED") return false;
        if (session.intake_date) {
          const sessionDate = moment(session.intake_date).startOf("day");
          const today = moment().startOf("day");
          return sessionDate.isSameOrAfter(today);
        }
        return true;
      });
      console.log("Upcoming sessions filtered:", upcoming);
    }
  }, [sessionData]);

  const fetchSessionByHash = async () => {
    if (!hash || typeof hash !== "string") return;

    setLoading(true);
    try {
      const response = await api.get(
        `${ApiConfig.sessionManagement.getByHash}?hash=${encodeURIComponent(
          hash
        )}`
      );

      if (
        response.status === 200 &&
        response.data.rec &&
        response.data.rec.length > 0
      ) {
        setSessionData(response.data.rec[0] as SessionData);
      } else {
        toast.error("Session not found or invalid link", {
          position: "top-right",
        });
      }
    } catch (error: any) {
      console.error("Error fetching session:", error);
      toast.error(
        error?.response?.data?.message || "Error fetching session details",
        {
          position: "top-right",
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = (session: Session) => {
    setSelectedSession(session);
    setCancelModalOpen(true);
  };

  const handleReschedule = (session: Session) => {
    setSelectedSession(session);
    setNewDate(null);
    setNewTime(null);

    // Calculate date range based on previous and next sessions
    if (sessionData?.session_obj) {
      // Get all scheduled sessions (excluding reports and non-scheduled)
      const scheduledSessions = sessionData.session_obj
        .filter((s) => {
          if (s.is_report) return false;
          const status = String(s.session_status || "").toUpperCase();
          return status === "SCHEDULED";
        })
        .filter((s) => s.session_id !== session.session_id) // Exclude current session
        .filter((s) => s.intake_date && s.scheduled_time) // Only sessions with date and time
        .sort((a, b) => {
          // Sort by date and time
          const dateA = moment(
            `${a.intake_date} ${a.scheduled_time.split(".")[0].split("Z")[0]}`
          );
          const dateB = moment(
            `${b.intake_date} ${b.scheduled_time.split(".")[0].split("Z")[0]}`
          );
          return dateA.diff(dateB);
        });

      // Find previous and next sessions
      const currentDateTime = moment(
        `${session.intake_date} ${
          session.scheduled_time.split(".")[0].split("Z")[0]
        }`
      );

      const previousSession = scheduledSessions
        .filter((s) => {
          const sessionDateTime = moment(
            `${s.intake_date} ${s.scheduled_time.split(".")[0].split("Z")[0]}`
          );
          return sessionDateTime.isBefore(currentDateTime);
        })
        .pop(); // Get the last one (closest before current)

      const nextSession = scheduledSessions
        .filter((s) => {
          const sessionDateTime = moment(
            `${s.intake_date} ${s.scheduled_time.split(".")[0].split("Z")[0]}`
          );
          return sessionDateTime.isAfter(currentDateTime);
        })
        .shift(); // Get the first one (closest after current)

      // Calculate minDate: day after previous session, or today (whichever is later)
      let minDate = moment().startOf("day").toDate();
      if (previousSession) {
        const previousDate = moment(previousSession.intake_date)
          .startOf("day")
          .add(1, "day");
        const today = moment().startOf("day");
        minDate = previousDate.isAfter(today)
          ? previousDate.toDate()
          : today.toDate();
      }

      // Calculate maxDate: day before next session
      let maxDate: Date | null = null;
      if (nextSession) {
        maxDate = moment(nextSession.intake_date)
          .startOf("day")
          .subtract(1, "day")
          .toDate();
      }

      setDateRange({ minDate, maxDate });
    } else {
      // If no session data, default to today as minDate
      setDateRange({
        minDate: moment().startOf("day").toDate(),
        maxDate: null,
      });
    }

    setRescheduleModalOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!selectedSession || !hash || typeof hash !== "string") return;

    setSubmitting(true);
    try {
      const response = await api.put(
        `${ApiConfig.sessionManagement.cancelSession}`,
        {
          session_id: selectedSession.session_id,
          hash: hash,
        }
      );

      if (response.status === 200) {
        toast.success("Session cancelled successfully", {
          position: "top-right",
        });
        setCancelModalOpen(false);
        fetchSessionByHash();
      }
    } catch (error: any) {
      console.error("Error cancelling session:", error);
      toast.error(
        error?.response?.data?.message || "Error cancelling session",
        {
          position: "top-right",
        }
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleRescheduleConfirm = async () => {
    if (
      !selectedSession ||
      !newDate ||
      !newTime ||
      !hash ||
      typeof hash !== "string"
    ) {
      toast.error("Please select both date and time", {
        position: "top-right",
      });
      return;
    }

    // Validate against previous and next scheduled sessions
    if (sessionData?.session_obj) {
      // Get all scheduled sessions (excluding reports and non-scheduled)
      const scheduledSessions = sessionData.session_obj
        .filter((session) => {
          if (session.is_report) return false;
          const status = String(session.session_status || "").toUpperCase();
          return status === "SCHEDULED";
        })
        .filter((session) => session.session_id !== selectedSession.session_id) // Exclude current session
        .filter((session) => session.intake_date && session.scheduled_time) // Only sessions with date and time
        .sort((a, b) => {
          // Sort by date and time
          const dateA = moment(
            `${a.intake_date} ${a.scheduled_time.split(".")[0].split("Z")[0]}`
          );
          const dateB = moment(
            `${b.intake_date} ${b.scheduled_time.split(".")[0].split("Z")[0]}`
          );
          return dateA.diff(dateB);
        });

      // Find previous and next sessions
      const currentDateTime = moment(
        `${selectedSession.intake_date} ${
          selectedSession.scheduled_time.split(".")[0].split("Z")[0]
        }`
      );

      const previousSession = scheduledSessions
        .filter((session) => {
          const sessionDateTime = moment(
            `${session.intake_date} ${
              session.scheduled_time.split(".")[0].split("Z")[0]
            }`
          );
          return sessionDateTime.isBefore(currentDateTime);
        })
        .pop(); // Get the last one (closest before current)

      const nextSession = scheduledSessions
        .filter((session) => {
          const sessionDateTime = moment(
            `${session.intake_date} ${
              session.scheduled_time.split(".")[0].split("Z")[0]
            }`
          );
          return sessionDateTime.isAfter(currentDateTime);
        })
        .shift(); // Get the first one (closest after current)

      // Validate new date/time
      const newDateTime = moment(
        `${moment(newDate).format("YYYY-MM-DD")} ${moment(
          newTime,
          "HH:mm"
        ).format("HH:mm:ss")}`
      );

      if (previousSession) {
        const previousDateTime = moment(
          `${previousSession.intake_date} ${
            previousSession.scheduled_time.split(".")[0].split("Z")[0]
          }`
        );

        if (newDateTime.isSameOrBefore(previousDateTime)) {
          toast.error(
            `The new date and time cannot be the same as or before the previous session scheduled for ${formatDateTime(
              previousSession.intake_date,
              previousSession.scheduled_time
            )}`,
            {
              position: "top-right",
            }
          );
          setSubmitting(false);
          return;
        }
      }

      if (nextSession) {
        const nextDateTime = moment(
          `${nextSession.intake_date} ${
            nextSession.scheduled_time.split(".")[0].split("Z")[0]
          }`
        );

        if (newDateTime.isSameOrAfter(nextDateTime)) {
          toast.error(
            `The new date and time cannot be the same as or after the next session scheduled for ${formatDateTime(
              nextSession.intake_date,
              nextSession.scheduled_time
            )}`,
            {
              position: "top-right",
            }
          );
          setSubmitting(false);
          return;
        }
      }
    }

    setSubmitting(true);
    try {
      const formattedDate = moment(newDate).format("YYYY-MM-DD");
      const formattedTime = moment(newTime, "HH:mm").format("HH:mm:ss");

      const response = await api.put(
        `${ApiConfig.sessionManagement.rescheduleSession}`,
        {
          session_id: selectedSession.session_id,
          hash: hash,
          new_date: formattedDate,
          new_time: formattedTime,
        }
      );

      if (response.status === 200) {
        toast.success("Session rescheduled successfully", {
          position: "top-right",
        });
        setRescheduleModalOpen(false);
        setNewDate(null);
        setNewTime(null);
        fetchSessionByHash();
      }
    } catch (error: any) {
      console.error("Error rescheduling session:", error);
      toast.error(
        error?.response?.data?.message || "Error rescheduling session",
        {
          position: "top-right",
        }
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Filter upcoming sessions: SCHEDULED status and not a report session
  const upcomingSessions =
    sessionData?.session_obj?.filter((session) => {
      // Exclude report sessions (is_report is boolean)
      if (session.is_report) return false;

      // Check if status is SCHEDULED
      const status = String(session.session_status || "").toUpperCase();
      if (status !== "SCHEDULED") return false;

      // Check if session date is today or in the future
      if (session.intake_date) {
        const sessionDate = moment(session.intake_date).startOf("day");
        const today = moment().startOf("day");
        return sessionDate.isSameOrAfter(today);
      }

      return true;
    }) || [];

  if (loading) {
    return (
      <LoadingContainer>
        <h2>Loading session details...</h2>
      </LoadingContainer>
    );
  }

  if (!sessionData) {
    return (
      <ErrorContainer>
        <h2>Session not found</h2>
        <p>The session link is invalid or has expired.</p>
      </ErrorContainer>
    );
  }

  return (
    <SessionManagementContainer>
      <div className="page-header">
        <h2>Session Management</h2>
        <p>
          Manage your therapy sessions. You can cancel or reschedule upcoming
          sessions.
        </p>
        <p className="helpful-tip">
          Helpful tip: Save this page to your favourites so you can easily
          manage your sessions anytime
        </p>
      </div>

      <SessionInfo sessionData={sessionData} />

      <div className="sessions-section">
        <h3>Upcoming Sessions</h3>
        {upcomingSessions.length === 0 ? (
          <div className="no-sessions">No upcoming sessions to manage.</div>
        ) : (
          <div>
            {upcomingSessions.map((session) => (
              <SessionCard
                key={session.session_id}
                session={session}
                onReschedule={handleReschedule}
                onCancel={handleCancel}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        content={`Are you sure you want to cancel the session scheduled for ${
          selectedSession
            ? formatDateTime(
                selectedSession.intake_date,
                selectedSession.scheduled_time
              )
            : ""
        }?`}
        affirmativeAction="Yes, Cancel"
        discardAction="No, Keep It"
        handleAffirmativeAction={handleCancelConfirm}
        loading={submitting}
      />

      <RescheduleModal
        isOpen={rescheduleModalOpen}
        onClose={() => setRescheduleModalOpen(false)}
        session={selectedSession}
        newDate={newDate}
        newTime={newTime}
        onDateChange={setNewDate}
        onTimeChange={setNewTime}
        onSubmit={handleRescheduleConfirm}
        submitting={submitting}
        minDate={dateRange.minDate}
        maxDate={dateRange.maxDate}
      />
    </SessionManagementContainer>
  );
}

export default SessionManagement;
