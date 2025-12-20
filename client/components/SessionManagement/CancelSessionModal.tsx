import React, { useState, useEffect } from "react";
import CustomModal from "../CustomModal";
import CustomButton from "../CustomButton";
import CustomTextArea from "../CustomTextArea";
import { Session } from "./types";
import { formatDateTime } from "@/utils/helper";
import Spinner from "../common/Spinner";

interface CancelSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: Session | null;
  onSubmit: (reason: string) => void;
  submitting: boolean;
}

const CancelSessionModal: React.FC<CancelSessionModalProps> = ({
  isOpen,
  onClose,
  session,
  onSubmit,
  submitting,
}) => {
  const [reason, setReason] = useState("");

  // Reset reason when modal closes or session changes
  useEffect(() => {
    if (!isOpen) {
      setReason("");
    }
  }, [isOpen]);

  const handleSubmit = () => {
    onSubmit(reason);
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onRequestClose={handleClose}
      title="Cancel Session"
      icon={null}
      customStyles={{ maxWidth: "500px" }}
    >
      <div style={{ padding: "20px" }}>
        <div style={{ marginBottom: "20px" }}>
          <strong>Session to Cancel:</strong>{" "}
          {session
            ? formatDateTime(session.intake_date, session.scheduled_time)
            : ""}
        </div>

        <div style={{ marginBottom: "20px" }}>
          <p style={{ marginBottom: "10px", color: "#666" }}>
            Are you sure you want to cancel this session? Please provide a reason
            for cancellation.
          </p>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <CustomTextArea
            label="Cancellation Reason:"
            name="reason"
            onChange={(e) => setReason(e.target.value)}
            value={reason}
            rows={4}
            placeholder="Please provide a reason for cancelling this session..."
          />
        </div>

        <div
          style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}
        >
          <CustomButton
            title="Keep Session"
            onClick={handleClose}
            customClass="cancel-button"
            style={{ color: "#333" }}
            icon={null}
            disabled={submitting}
          />
          <CustomButton
            title={
              submitting ? (
                <Spinner width="20px" height="20px" />
              ) : (
                "Yes, Cancel Session"
              )
            }
            onClick={handleSubmit}
            customClass="submit-button"
            disabled={!reason.trim() || submitting}
            icon={null}
            style={{
              backgroundColor: submitting
                ? "#ccc"
                : "var(--primary-button-color)",
              color: "#fff",
              padding: submitting ? "5.75px 12px" : "10.5px 12px",
            }}
          />
        </div>
      </div>
    </CustomModal>
  );
};

export default CancelSessionModal;

