import styled from "styled-components";

export const ConsentFormContainer = styled.div`
  padding: 20px 30px;
  max-width: 800px;
  margin: 20px auto;
  background: #fff;
  input {
    border: none;
    background: transparent;
    width: 100%;
    max-width: 300px;
    font-size: 15px;
  }
  .editableTextEditorSubmit {
    background: var(--primary-button-color);
    margin-top: 60px;
    margin-bottom: 30px;
    color: white;
  }
  .content {
    text-align: left;
    h3 {
      text-align: center;
    }
  }

  .primary {
    background: var(--primary-button-color);
    color: #fff;
    &:hover {
      background: var(--primary-button-hover-color);
    }
  }
  .client-details-container {
    padding: 10px;
    background: var(--background-color);
    border-radius: 8px;
    h4 {
      margin: 0px;
    }
    .signature-container {
      margin-top: 20px;
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 10px;

      label {
        display: inline-flex;
        font-weight: 500;
        width: 200px;
      }

      .client-details-field {
        display: flex;
        width: 100%;
        align-items: center;
        div {
          width: 300px;
          margin: 0px;
        }
      }

      img {
        display: block;
        border: 1px solid #ddd;
        max-width: 300px;
        border-radius: 8px;
      }

      .client-info {
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
      }
    }

    .signature-canvas {
      border: 1px solid #ccc;
      border-radius: 5px;
      width: 300px;
      height: 40px;
      background: #fff;
    }

    button {
      margin-right: 10px;
      padding: 5px 10px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 3px;
      cursor: pointer;
    }

    button:hover {
      background-color: #0056b3;
    }

    small {
      display: block;
      margin-top: 5px;
    }

    input {
      padding: 5px;
      // width: 100%;
      max-width: 300px;
    }
  }
  .acknowledgement-container {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-top: 16px;
    padding: 10px 14px;
    background: #fafafa;
    border: 1px solid #ddd;
    border-radius: 6px;
    cursor: pointer;
    transition: border-color 0.2s ease;
  }

  .acknowledgement-container:hover {
    border-color: #bbb;
  }
  .acknowledgement-checkbox {
    appearance: none;
    width: 20px;
    height: 20px;
    border: 2px solid #999;
    border-radius: 4px;
    background: white;
    cursor: pointer;
    position: relative;
    transition: all 0.2s ease;
  }
  .acknowledgement-checkbox:checked {
    background: #1976d2;
    border-color: #1976d2;
  }

  .acknowledgement-checkbox:checked::after {
    content: "✓";
    position: absolute;
    color: white;
    font-size: 14px;
    font-weight: bold;
    top: 1px;
    left: 4px;
  }
  .acknowledgement-label {
    font-size: 14px;
    color: #333;
    line-height: 1.4;
  }
  .acknowledgement-error {
    font-size: 12px;
    color: #d32f2f;
    margin-top: 6px;
  }
`;
