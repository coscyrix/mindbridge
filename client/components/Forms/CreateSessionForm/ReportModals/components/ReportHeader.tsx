import React from "react";

interface ReportHeaderProps {
  practiceName: string;
  therapistName: string;
  therapistDesignation?: string;
  reportDate: string;
  treatmentBlockName?: string;
  reportTitle?: string;
}

/**
 * ReportHeader - Shared header component for report modals
 * Displays practice name, therapist info, report date, and treatment block
 */
const ReportHeader: React.FC<ReportHeaderProps> = ({
  practiceName,
  therapistName,
  therapistDesignation = "Therapist",
  reportDate,
  treatmentBlockName,
  reportTitle,
}) => {
  return (
    <div className="header-section">
      <div className="header-field">
        <strong>Name of Practice:</strong> {practiceName || "N/A"}
      </div>
      <div className="header-field">
        <strong>Therapist Name:</strong> {therapistName || "N/A"}{" "}
        <strong>Designation:</strong> {therapistDesignation}
      </div>
      <div className="header-field">
        <strong>Date of {reportTitle || "Report"}:</strong> {reportDate || "N/A"}
      </div>
      {treatmentBlockName && (
        <div className="header-field">
          <strong>Treatment Block:</strong> {treatmentBlockName}
        </div>
      )}
    </div>
  );
};

export default ReportHeader;

