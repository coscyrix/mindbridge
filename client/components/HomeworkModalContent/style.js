import styled from "styled-components";

export const HomeWorkModalWrapper = styled.div`
  .field {
    input {
      border: 1px solid #e1e1e1;
    }
    .upload-input-field {
      input {
        outline: none;
        width: 100%;
        height: 100%;
        opacity: 0;
      }
    }
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .field .upload_field {
    opacity: 0;
    height: 100%;
  }

  .field .upload-input-field {
    position: relative;
    z-index: 10;
    height: 160px;
    border: 2px dashed #e1e1e1;
    border-radius: 8px;
    div {
      height: 100%;
    }
  }

  .field .icon-input-container {
    position: relative;
    z-index: 1;
    .svg-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      p {
        margin: 0;
        text-align: center;
      }
    }
  }
  .field .icon-input-container {
    .reset-icon {
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 11;
    }
  }
  .modal-buttons {
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
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
