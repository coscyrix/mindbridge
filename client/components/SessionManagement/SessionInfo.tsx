import React from "react";
import { SessionData } from "./types";
import styled from "styled-components";

const InfoCard = styled.div`
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.14);
  padding: 20px 30px;
  margin-bottom: 30px;

  @media (max-width: 768px) {
    padding: 20px 16px;
  }

  h3 {
    margin: 0 0 15px 0;
    font-size: 18px;
    font-weight: 600;
    color: #333;
  }

  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 12px;
    }

    .info-item {
      strong {
        color: #333;
        font-weight: 600;
      }
      color: #666;
    }
  }
`;

interface SessionInfoProps {
  sessionData: SessionData;
}

const capitalizeFirstLetter = (name: string | null | undefined): string => {
  if (!name) return "";
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
};

const SessionInfo: React.FC<SessionInfoProps> = ({ sessionData }) => {
  return (
    <InfoCard>
      <h3>Session Information</h3>
      <div className="info-grid">
        <div className="info-item">
          <strong>Client:</strong> {capitalizeFirstLetter(sessionData.client_first_name)}{" "}
          {capitalizeFirstLetter(sessionData.client_last_name)}
        </div>
        <div className="info-item">
          <strong>Counselor:</strong> {capitalizeFirstLetter(sessionData.counselor_first_name)}{" "}
          {capitalizeFirstLetter(sessionData.counselor_last_name)}
        </div>
        <div className="info-item">
          <strong>Service:</strong> {sessionData.service_name}
        </div>
        <div className="info-item">
          <strong>Format:</strong> {sessionData.session_format_id}
        </div>
      </div>
    </InfoCard>
  );
};

export default SessionInfo;

