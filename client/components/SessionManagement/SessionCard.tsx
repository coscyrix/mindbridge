import React from "react";
import CustomButton from "../CustomButton";
import moment from "moment";
import { Session } from "./types";
import { SessionCardContainer } from "../../styles/session-management";
import { convertUTCToLocalTime } from "../../utils/helper";

interface SessionCardProps {
  session: Session;
  onReschedule: (session: Session) => void;
  onCancel: (session: Session) => void;
}

const formatDateTime = (date: string, time: string): string => {
  if (!date) return "N/A";

  // scheduled_time always comes as "12:30:00.000Z" (UTC with milliseconds)
  const dateTimeString = time ? `${date}T${time}` : `${date}T00:00:00Z`;

  // Convert UTC to local timezone (browser's timezone)
  const { date: localDate, time: localTime } =
    convertUTCToLocalTime(dateTimeString);

  // Format date using moment for consistent formatting
  const dateStr = localDate
    ? moment(localDate, "DD MMM YYYY").format("MMMM DD, YYYY")
    : moment(date).format("MMMM DD, YYYY");

  return `${dateStr}${localTime ? ` at ${localTime}` : ""}`;
};

const SessionCard: React.FC<SessionCardProps> = ({
  session,
  onReschedule,
  onCancel,
}) => {
  return (
    <SessionCardContainer>
      <div className="session-content">
        <div className="session-details">
          <div className="session-title">
            {session.session_code} Session
            {session.session_number && ` #${session.session_number}`}
          </div>
          <div className="session-date-time">
            {formatDateTime(session.intake_date, session.scheduled_time)}
          </div>
          <div className="session-meta">
            <div className="meta-item">
              <strong>Format:</strong> {session.session_format}
            </div>
          </div>
        </div>
        <div className="session-actions">
          <CustomButton
            title="Reschedule"
            onClick={() => onReschedule(session)}
            customClass="reschedule-button"
            icon={null}
          />
          <CustomButton
            title="Cancel"
            onClick={() => onCancel(session)}
            customClass="cancel-button"
            style={{ backgroundColor: "#DC2626", color: "#FFFFFF" }}
            icon={null}
          />
        </div>
      </div>
    </SessionCardContainer>
  );
};

export default SessionCard;
