import styled from "styled-components";

export const PHQFormContainer = styled.div`
  padding: 20px 30px;
  h1 {
    margin-top: 0px;
  }
  .phq9-form {
    margin: 0 auto;
    font-family: Arial, sans-serif;
  }

  .name-date-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    gap: 20px;
    width: 100%;
    margin-bottom: 20px;

    label {
      margin-right: 10px;
    }

    .name-date-fields {
      display: flex;
      input {
        border: none;
        background: transparent;
        font-size: 15px;
      }
    }
  }

  .questions-table {
    width: 100%;
    border-collapse: collapse;
  }

  .questions-table th,
  .questions-table td {
    border: 1px solid #ddd;
    padding: 10px;
    min-width: 100px;
  }

  .radio-option input {
    margin: 0 auto;
    display: block;
  }

  .questions-table th {
    background-color: #f4f4f4;
    font-weight: bold;
  }

  .radio-group {
    display: flex;
    gap: 20px;
  }

  .radio-group label {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .question-item {
    margin-bottom: 20px;
  }

  .questions-section,
  .difficulty-section {
    margin: 20px 0;
  }

  .submit-button {
    background-color: #007bff;
    color: #fff;
    padding: 10px 20px;
    border: none;
    cursor: pointer;
    font-size: 16px;
  }

  .submit-button:hover {
    background-color: #0056b3;
  }

  .primary {
    background: var(--primary-button-color);
    color: #fff;
    margin-left: auto;
    margin-top: 20px;
    min-width: 100px;
    &:hover {
      background: var(--primary-button-hover-color);
    }
  }
`;
