import styled from "styled-components";

export const NotesModalContentContainer = styled.div`
  .notes-textarea {
    width: 100%;
    resize: none;
    padding: 10px;
    margin-bottom: 20px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  .modal-buttons {
    display: flex;
    justify-content: space-between;
  }
  .cancel-button,
  .save-button {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
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
