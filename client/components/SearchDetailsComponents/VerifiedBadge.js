import React from "react";
import styled from "styled-components";

const VerifiedBadge = ({ type = "verified" }) => {
  return (
    <BadgeWrapper type={type}>
      <span className="icon">✓</span>
      <span className="text">{type === "verified" && "Verified"}</span>
    </BadgeWrapper>
  );
};

const BadgeWrapper = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  background: ${(props) => (props.type === "verified" ? "#e8f5e9" : "#e3f2fd")};
  color: ${(props) => (props.type === "verified" ? "#2e7d32" : "#1565c0")};

  .icon {
    font-size: 14px;
  }

  .text {
    font-weight: 500;
  }
`;

export default VerifiedBadge;
