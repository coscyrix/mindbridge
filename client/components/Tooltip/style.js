import styled from "styled-components";

export const TooltipButtonWrapper = styled.div`
  width: 100%;
  cursor: pointer;
  .option-wrapper {
    display: flex;
    gap: 4px;
    border-radius: 6px;
    padding: 2px 4px;

    span {
      display: flex;
      align-items: center;
    }

    &:hover {
      background-color: #f5f5f5;
    }
  }
`;

export const TooltipWrapper = styled.div`
  position: absolute;
  min-width: 100px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  right: 0;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  z-index: 99999 !important;
  border: 1px solid #e1e1e1;
  box-shadow: -2px 0px 20px 0px #a4acb940;
  padding: 4px;
`;
