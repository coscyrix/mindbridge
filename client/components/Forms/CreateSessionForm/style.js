import styled from "styled-components";

export const HomeworkButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
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

export const AssessmentButtonWrapper = styled(HomeworkButtonWrapper)``;

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
      padding-top: 20px;
      .session-details {
        display: flex;
        column-gap: 40px;
        row-gap: 10px;
        flex-wrap: wrap;
        
        label {
          white-space: nowrap;
          
          strong {
            white-space: nowrap;
          }
          
          span {
            white-space: nowrap;
          }
        }
      }
    }

    .discharge-delete-button {
      color: #ffffff;
      padding: 10px;
      border: none;
      box-shadow: none;
      font-size: 15px;
      &:hover {
        color: #ff9;
      }
      &_disabled {
        opacity: 0.5;
        color: #ffffff;
        padding: 10px;
        border: none;
        box-shadow: none;
        cursor: auto;
        font-size: 15px;
        &:hover {
          color: #ff9;
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

    .limit-sessions-wrapper {
      display: flex;
      flex-direction: column;
      gap: 12px;
      border-radius: 8px;

      .toggle-section {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0;
        
        .toggle-label {
          font-size: 14px;
          font-weight: 500;
          color: #333;
          margin: 0;
          transition: color 0.2s ease;

          &.disabled {
            color: #999;
            opacity: 0.6;
          }
        }
      }

      .session-number-dropdown {
        margin-top: 0;
        animation: fadeIn 0.2s ease-in;
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
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
      display: flex;
      flex-direction: column;
      gap: 10px;
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

export const AssessmentModalWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  .select-wrapper {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 20px;

    label {
      font-size: 14px;
      font-weight: 500;
      color: #000000;
    }
  }

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

  .custom-select__selected {
    width: 100% !important;
    border: 1px solid #e1e1e1;
    box-shadow: 0px 1px 2px 0px #a4acb933;
    border-radius: 6px;
    padding: 9px 12px !important;
  }

  .button-group {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    margin-top: 20px;
  }

  .save-button {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    min-width: 107px;
    width: 100%;
    max-width: max-content;
    text-align: center;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s ease;
    background: var(--primary-button-color) !important;
    color: white;
    &:hover {
      background: var(--primary-button-hover-color);
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

export const ProgressReportModalWrapper = styled.div`
  padding: 20px;
  font-family: Arial, sans-serif;

  .header-section {
    margin-bottom: 30px;
  }

  .header-field {
    margin-bottom: 10px;
  }

  .client-information {
    margin-bottom: 30px;
    border-top: 2px solid #000;
    padding-top: 20px;
  }

  .client-info-title {
    margin-bottom: 15px;
    text-transform: uppercase;
  }

  .client-info-field {
    margin-bottom: 8px;
  }

  .form-section {
    margin-bottom: 30px;
  }

  .section-title {
    margin-bottom: 10px;
  }

  textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
    font-family: Arial, sans-serif;
    resize: vertical;
    box-sizing: border-box;

    &.session-summary,
    &.progress-summary {
      min-height: 120px;
    }

    &.risk-screening-note {
      min-height: 80px;
    }

    &.therapist-notes {
      min-height: 60px;
    }
  }

  .risk-screening {
    margin-bottom: 30px;
  }

  .checkbox-group {
    margin-bottom: 10px;
    display: flex;
    flex-wrap: wrap;
    gap: 20px;

    label {
      display: flex;
      align-items: center;
      cursor: pointer;

      input[type="checkbox"] {
        margin-right: 5px;
        cursor: pointer;
      }
    }
  }

  .assessment-item {
    margin-bottom: 15px;
  }

  .assessment-header {
    margin-bottom: 5px;
  }

  .assessment-notes-label {
    margin-bottom: 5px;
  }

  .frequency-section {
    margin-bottom: 30px;
  }

  .frequency-checkbox-group {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;

    label {
      display: flex;
      align-items: center;
      cursor: pointer;

      input[type="checkbox"] {
        margin-right: 5px;
        cursor: pointer;
      }
    }
  }

  .frequency-note {
    margin-top: 5px;
    font-size: 12px;
    font-style: italic;
  }

  .therapist-signoff {
    border-top: 2px solid #000;
    padding-top: 20px;
    margin-top: 30px;
  }

  .signoff-title {
    margin-bottom: 10px;
  }

  .signoff-text {
    font-size: 14px;
  }

  .loading-container {
    padding: 60px 40px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 300px;

    .loading-text {
      margin-top: 20px;
      color: #666;
      font-size: 14px;
    }
  }
`;

export const DischargeReportModalWrapper = styled(ProgressReportModalWrapper)`
  // Inherits all styles from ProgressReportModalWrapper
  // Can add discharge-specific styles here if needed
`;
