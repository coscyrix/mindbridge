import styled from "styled-components";

export const ConfirmationModalWrapper = styled.div`
  .modal-buttons {
    // border-top: 1px solid #e1e1e1;
    margin-top: 20px;
    padding-top: 10px;
    display: flex;
    justify-content: space-evenly;
  }
  .save-button {
    padding: 14px 75px;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    // min-width: 107px;
    width: 100%;
    text-align: center;
  }
  .cancel-button {
    border: 1px solid #e1e1e1;
    background-color: white;
    color: black;
    padding: 14px 75px;
    border-radius: 10px;
    cursor: pointer;
    min-width: 107px;
    width: 100%;
    text-align: center;
  }
  .save-button {
    background: var(--primary-button-color) !important;
    color: white;
    &:hover {
      background: var(--primary-button-hover-color);
    }
  }
`;
