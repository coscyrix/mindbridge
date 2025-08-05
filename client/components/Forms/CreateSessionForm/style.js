import styled from "styled-components";

export const HomeworkButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end; /* or center, or flex-start */
  align-items: center;
  margin-bottom: 20px;

  button {
    padding: 10px 16px;
    font-size: 14px;
    font-weight: 500;
    gap: 8px;
    display: flex;
    align-items: center;
  }
`;

export const CreateSessionFormWrapper = styled.div`
  height: 100%;

  .custom-error-message {
    color: #f04438;
    margin: 8px 0 16px;
  }

  form {
    height: 100%;

    > div {
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
  }

  .buttons {
    display: flex;
    justify-content: space-between;
    border-top: 1px solid #e1e1e1;
    padding: 14px 20px;
    gap: 100px;

    .update-button {
      width: 100%;
      padding: 10px;
      font-size: 1rem;
      color: white;
      background: var(--primary-button-color);
      border: none;
      border-radius: 5px;
      cursor: pointer;

      &:hover {
        background: var(--primary-button-hover-color);
      }
    }

    .create-button {
      width: 100%;
      padding: 10px;
      font-size: 1rem;
      color: white;
      background: var(--primary-button-color);
      border: none;
      border-radius: 5px;
      cursor: pointer;

      &:hover {
        background: var(--primary-button-hover-color);
      }
    }

    .discard_button {
      width: 100%;
      padding: 10px;
      font-size: 1rem;
      color: black;
      border: 1px solid #e1e1e1 !important;
      box-shadow: -2px 0px 20px 0px #a4acb940;
      background: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      &:hover {
        background: none;
      }
    }
  }

  .user-info-selects {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 20px;
    p {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .heading-container {
      display: flex;
      align-items: baseline;
      gap: 50px;
      .session-details {
        display: flex;
        column-gap: 40px;
        row-gap: 10px;
      }
    }

    .discharge-delete-button {
      color: #FFFFFF;
      padding: 10px;
      border: none;
      box-shadow: none;
      font-size: 15px;
      &:hover {
        color: #ff9;
      }
      &_disabled {
        opacity: 0.5;
        color: #FFFFFF;
        padding: 10px;
        border: none;
        box-shadow: none;
        cursor: auto;
        font-size: 15px;
        &:hover {
          color: #FF9;
        }
      }
    }

    .date-time-wrapper {
      display: flex;
      gap: 8px;

      > div {
        width: 100%;
      }
    }

    input {
      border: 1px solid #e1e1e1;

      &:active {
        border: 1px solid #e1e1e1;
      }
    }

    .custom-select {
      width: 100%;
      &:focus-visible,
      &:hover {
        border-radius: 6px;
        outline: 1px solid #1b6bc0;
        box-shadow: 0px 0px 0px 1.9px #1b6bc042 inset;
        box-shadow: 0px 0px 0px 4px #1b6bc030;
      }
    }

    .selects-container {
      display: flex;
      gap: 12px;
    }

    .custom-error-massage {
      color: #f04438;
      margin: 8px 0 16px;
    }

    .select-wrapper {
      width: 100%;
      label {
        svg {
          color: #2196f3;
        }
      }
    }

    .custom-select__selected {
      width: 100%;
      border: 1px solid #e1e1e1;
      box-shadow: 0px 1px 2px 0px #a4acb933;
      border-radius: 6px;
      padding: 9px 12px;
    }

    .show-button {
      background: #00c317;
      color: white;
      &:hover {
        background: #009914;
      }
    }

    .no-show-button {
      background: var(--error-color);
      color: #fff;
      &:hover {
        background: var(--error-hover-color);
      }
    }

    .generate-session-button {
      color: #0000ff;
      cursor: pointer;
      background: transparent;
      border: none;
      max-width: max-content;
      padding: 0px;
      text-align: left;
      p {
        margin: 0;
      }
    }
    .disabled {
      color: #000;
      opacity: 0.5;
      cursor: auto;
    }

    .form_fields_wrapper {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .rdt_TableBody {
      padding-bottom: 0px !important;
      .action-buttons-container {
        button {
          padding-top: 2.25px;
          padding-bottom: 2.25px;
        }
      }
      .edit-button {
        padding-top: 2.25px;
        padding-bottom: 2.25px;
        display: inline;
      }
    }
  }
  .submit-button {
    display: flex;
    justify-content: space-between;
    padding-bottom: 20px;
    button {
      max-width: 200px;
    }
    .create-button {
      max-width: 100%;
    }
  }
`;

export const DataTimeModalWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  .custom-select {
    width: 100% !important;
    &:focus-visible,
    &:hover {
      border-radius: 6px;
      outline: 1px solid #1b6bc0;
      box-shadow: 0px 0px 0px 1.9px #1b6bc042 inset;
      box-shadow: 0px 0px 0px 4px #1b6bc030;
    }
  }

  .selects-container {
    display: flex;
    gap: 12px;
  }

  .custom-error-massage {
    color: #f04438;
    margin: 8px 0 16px;
  }

  .select-wrapper {
    width: 100%;
  }

  .custom-select__selected {
    width: 100% !important;
    border: 1px solid #e1e1e1;
    box-shadow: 0px 1px 2px 0px #a4acb933;
    border-radius: 6px;
    padding: 9px 12px !important;
  }

  input {
    border: 1px solid #e1e1e1;
    outline: none;
    width: 100%;
    height: 45px;
    border-radius: 10px;
    background: #ffffff;
    color: #000000;
    padding: 11px 16px;
    font-size: 14px;
    font-weight: 400;
    line-height: 24px;
    margin: 0px;

    &::placeholder {
      color: #000000;
      opacity: 0.2;
    }

    &:focus-visible,
    &:hover {
      outline: 1px solid #1b6bc0;
      box-shadow: 0px 0px 0px 1.9px #1b6bc042 inset;
      box-shadow: 0px 0px 0px 4px #1b6bc030;
    }
  }

  button {
    border: 1px solid #e1e1e1;
    padding: 10px 14px;
    border-radius: 6px;
    cursor: pointer;
  }

  .buttonWrapper {
    display: flex;
    justify-content: space-between;
    .submit-button {
      cursor: pointer;
      color: White;
      background: var(--primary-button-color);
    }
  }
`;
