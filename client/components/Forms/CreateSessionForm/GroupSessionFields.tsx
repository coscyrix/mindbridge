import React from "react";
import Select from "react-select";
import styled from "styled-components";

const GroupSessionWrapper = styled.div`
  margin: 20px 0;
  padding: 20px;
  border: 1px solid var(--primary-color, #6366f1);
  border-radius: 12px;
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.03) 0%,
    rgba(59, 130, 246, 0.03) 100%
  );

  .group-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(99, 102, 241, 0.2);

    .group-icon {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #6366f1 0%, #3b82f6 100%);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 16px;
    }

    .group-title {
      font-weight: 600;
      font-size: 16px;
      color: #374151;
    }

    .group-badge {
      background: linear-gradient(135deg, #6366f1 0%, #3b82f6 100%);
      color: white;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }
  }

  .group-fields {
    display: grid;
    gap: 16px;

    .field-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .field-group {
      display: flex;
      flex-direction: column;
      gap: 6px;

      label {
        font-size: 14px;
        font-weight: 500;
        color: #374151;
      }

      input {
        padding: 10px 14px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        font-size: 14px;
        transition: border-color 0.2s, box-shadow 0.2s;

        &:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        &:disabled {
          background-color: #f3f4f6;
          cursor: not-allowed;
        }
      }

      textarea {
        padding: 10px 14px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        font-size: 14px;
        min-height: 80px;
        resize: vertical;
        font-family: inherit;
        transition: border-color 0.2s, box-shadow 0.2s;

        &:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        &:disabled {
          background-color: #f3f4f6;
          cursor: not-allowed;
        }
      }
    }

    .multi-select-wrapper {
      .participant-count {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 8px;
        font-size: 13px;
        color: #6b7280;

        .count-badge {
          background: linear-gradient(135deg, #6366f1 0%, #3b82f6 100%);
          color: white;
          padding: 2px 10px;
          border-radius: 12px;
          font-weight: 600;
        }

        .max-warning {
          color: #ef4444;
          font-weight: 500;
        }
      }
    }

    .selected-clients-preview {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 12px;

      .client-chip {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 20px;
        font-size: 13px;

        .remove-btn {
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fee2e2;
          color: #ef4444;
          border-radius: 50%;
          cursor: pointer;
          font-size: 12px;
          transition: background 0.2s;
          border: none;

          &:hover {
            background: #fecaca;
          }
        }
      }
    }
  }
`;

interface ClientOption {
  label: string;
  value: number;
  serialNumber: string;
  user_target_outcome?: string;
}

interface GroupSessionFieldsProps {
  selectedClients: ClientOption[];
  setSelectedClients: (clients: ClientOption[]) => void;
  groupName: string;
  setGroupName: (name: string) => void;
  groupDescription: string;
  setGroupDescription: (description: string) => void;
  maxParticipants: number;
  setMaxParticipants: (max: number) => void;
  availableClients: ClientOption[];
  serviceName?: string;
  disabled?: boolean;
}

const GroupSessionFields: React.FC<GroupSessionFieldsProps> = ({
  selectedClients,
  setSelectedClients,
  groupName,
  setGroupName,
  groupDescription,
  setGroupDescription,
  maxParticipants,
  setMaxParticipants,
  availableClients,
  serviceName,
  disabled = false,
}) => {
  const handleClientSelect = (selected: readonly ClientOption[] | null) => {
    const selectedArray = selected ? [...selected] : [];
    if (selectedArray.length <= maxParticipants) {
      setSelectedClients(selectedArray);
    }
  };

  const removeClient = (clientValue: number) => {
    setSelectedClients(selectedClients.filter((c) => c.value !== clientValue));
  };

  const customStyles = {
    control: (base: any, state: any) => ({
      ...base,
      minHeight: "44px",
      borderColor: state.isFocused ? "#6366f1" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 3px rgba(99, 102, 241, 0.1)" : "none",
      "&:hover": {
        borderColor: "#6366f1",
      },
    }),
    multiValue: (base: any) => ({
      ...base,
      backgroundColor: "rgba(99, 102, 241, 0.1)",
      borderRadius: "6px",
    }),
    multiValueLabel: (base: any) => ({
      ...base,
      color: "#4f46e5",
      fontWeight: 500,
    }),
    multiValueRemove: (base: any) => ({
      ...base,
      color: "#6366f1",
      "&:hover": {
        backgroundColor: "#6366f1",
        color: "white",
      },
    }),
    menuPortal: (base: any) => ({
      ...base,
      zIndex: 9999,
    }),
  };

  return (
    <GroupSessionWrapper>
      <div className="group-header">
        <span className="group-title">Group Session</span>
      </div>

      <div className="group-fields">
        <div className="field-group">
          <div className="field-group">
            <label>Group Name *</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder={serviceName || "e.g., Anxiety Support Group"}
              disabled={disabled}
              required
            />
          </div>
        </div>

        <div className="field-group">
          <label>Group Description (Optional)</label>
          <textarea
            value={groupDescription}
            onChange={(e) => setGroupDescription(e.target.value)}
            placeholder="Brief description of the group session purpose..."
            disabled={disabled}
          />
        </div>

        <div className="field-group multi-select-wrapper">
          <label>Select Participants *</label>
          <Select
            isMulti
            options={availableClients}
            value={selectedClients}
            onChange={handleClientSelect}
            placeholder="Search and select clients..."
            styles={customStyles}
            isDisabled={disabled}
            menuPortalTarget={
              typeof document !== "undefined" ? document.body : undefined
            }
            menuPosition="fixed"
            formatOptionLabel={(option: ClientOption) => (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{option.label}</span>
              </div>
            )}
          />
          <div className="participant-count">
            <span>Selected:</span>
            <span className="count-badge">{selectedClients.length}</span>
            <span>/ {maxParticipants}</span>
            {selectedClients.length >= maxParticipants && (
              <span className="max-warning">Maximum reached</span>
            )}
            {selectedClients.length > 0 && selectedClients.length < 2 && (
              <span className="max-warning">
                Minimum 2 participants required
              </span>
            )}
          </div>
        </div>
      </div>
    </GroupSessionWrapper>
  );
};

export default GroupSessionFields;
