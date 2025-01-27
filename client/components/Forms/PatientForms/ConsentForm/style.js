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
      width: 100%;
      max-width: 300px;
    }
  }
`;
