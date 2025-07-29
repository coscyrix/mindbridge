import styled from "styled-components";

export const ConsentManagementWrapper = styled.div`
  .consent-box {
    padding: 36px;
    border: 1px solid #ddd;
    border-radius: 8px;
  }

  .form-wrapper {
    margin-top: 24px;
  }

  .consent-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .button-blue {
    color: #fff;
    background: #3973b7;
  }
  .timestamp-field,
  .ip-field {
    min-width: 250px;
  }

  .consent-text-select,
  .category-select {
    min-width: 300px;
  }

  .error {
    border-color: red;
  }
  .time-ip-parent {
    display: grid;
    grid-template-columns: repeat(2, 2fr);
    gap: 16px;
    margin-top: 16px;
    @media (max-width: 650px) {
      grid-template-columns: repeat(1, 1fr);
    }
  }
  .disclaimer input {
    margin-right: 10px;
  }
  .error-text {
    color: var(--error-color);
    font-size:14px;
  }
  .form-row {
    display: flex;
    flex-direction: column;
  }
`;
