import styled from "styled-components";

const TabList = styled.div`
  display: flex;
  border-bottom: 2px solid #ccc;
`;

const TabButton = styled.button`
  flex: 1;
  padding: 10px 20px;
  cursor: pointer;
  background: ${({ isActive }) => (isActive ? "#0070f3" : "transparent")};
  color: ${({ isActive }) => (isActive ? "#fff" : "#0070f3")};
  border: none;
  border-bottom: ${({ isActive }) => (isActive ? "2px solid #0070f3" : "none")};
  transition: all 0.3s ease;

  &:hover {
    background: #e0e0e0;
  }
`;
