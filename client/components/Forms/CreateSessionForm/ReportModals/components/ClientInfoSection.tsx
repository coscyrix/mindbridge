import React from "react";

interface ClientInfoField {
  label: string;
  value: string | number | null | undefined;
}

interface ClientInfoSectionProps {
  title?: string;
  fields: ClientInfoField[];
}

/**
 * ClientInfoSection - Shared component for displaying client information
 * Used across all report modals to show client details consistently
 */
const ClientInfoSection: React.FC<ClientInfoSectionProps> = ({
  title = "CLIENT INFORMATION",
  fields,
}) => {
  return (
    <div className="client-information">
      <h3 className="client-info-title">{title}</h3>
      {fields.map((field, index) => (
        <div key={index} className="client-info-field">
          <strong>{field.label}:</strong> {field.value ?? "N/A"}
        </div>
      ))}
    </div>
  );
};

export default ClientInfoSection;

