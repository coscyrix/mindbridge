import React from "react";

interface TherapistSignOffProps {
  therapistName: string;
  therapistDesignation?: string;
  reportDate: string;
}

/**
 * TherapistSignOff - Shared component for therapist sign-off section
 * Displays electronic approval information
 */
const TherapistSignOff: React.FC<TherapistSignOffProps> = ({
  therapistName,
  therapistDesignation = "Therapist",
  reportDate,
}) => {
  return (
    <div className="therapist-signoff">
      <h3 className="signoff-title">THERAPIST SIGN-OFF</h3>
      <div className="signoff-text">
        Electronically approved by <strong>{therapistName || "N/A"}</strong>,{" "}
        <strong>{therapistDesignation}</strong> on{" "}
        <strong>{reportDate || "N/A"}</strong> via MindBridge.
      </div>
    </div>
  );
};

export default TherapistSignOff;

