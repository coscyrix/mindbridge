import React from "react";
import CustomModal from "../CustomModal";
import CustomButton from "../CustomButton";
import CustomDatePicker from "../DatePicker";
import { Session } from "./types";
import { formatDateTime } from "@/utils/helper";

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: Session | null;
  newDate: Date | null;
  newTime: string | null;
  onDateChange: (date: Date | null) => void;
  onTimeChange: (time: string) => void;
  onSubmit: () => void;
  submitting: boolean;
  minDate?: Date | null;
  maxDate?: Date | null;
}

const RescheduleModal: React.FC<RescheduleModalProps> = ({
  isOpen,
  onClose,
  session,
  newDate,
  newTime,
  onDateChange,
  onTimeChange,
  onSubmit,
  submitting,
  minDate,
  maxDate,
}) => {
  return (
    <CustomModal
      isOpen={isOpen}
      onRequestClose={onClose}
      title="Reschedule Session"
      icon={null}
      customStyles={{ maxWidth: "500px" }}
    >
      <div style={{ padding: "20px" }}>
        <div style={{ marginBottom: "20px" }}>
          <strong>Current Session:</strong>{" "}
          {session
            ? formatDateTime(session.intake_date, session.scheduled_time)
            : ""}
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
              color: "#333",
              fontSize: "14px",
            }}
          >
            New Date
          </label>
          <div style={{ width: "100%" }}>
            <CustomDatePicker
              selected={newDate}
              onChange={onDateChange}
              minDate={minDate || new Date()}
              maxDate={maxDate || undefined}
              dateFormat="yyyy-MM-dd"
              placeholderText="Select new date"
              isClearable
              className="styled-input"
            />
          </div>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
              color: "#333",
              fontSize: "14px",
            }}
          >
            New Time
          </label>
          <input
            type="time"
            value={newTime || ""}
            onChange={(e) => onTimeChange(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "16px",
            }}
          />
        </div>

        <div
          style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}
        >
          <CustomButton
            title="Cancel"
            onClick={onClose}
            customClass="cancel-button"
            style={{ color: "#333" }}
            icon={null}
          />
          <CustomButton
            title="Reschedule"
            onClick={onSubmit}
            customClass="submit-button"
            disabled={!newDate || !newTime || submitting}
            icon={null}
          />
        </div>
      </div>
    </CustomModal>
  );
};

export default RescheduleModal;
