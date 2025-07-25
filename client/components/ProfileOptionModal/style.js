import styled from "styled-components";

export const OptionsContainer = styled.div`
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 218px;
  z-index: 1000;
`;

export const OptionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  &:hover {
    color: #0070f3;
  }
`;
