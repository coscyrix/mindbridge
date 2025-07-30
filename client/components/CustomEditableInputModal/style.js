import styled from "styled-components";

export const CustomEditableInputModalWrapper = styled.div`
  // padding: 20px;
  // margin: 20px;
  .service-row {
    display: grid;
    grid-template-columns: 2fr 2fr 2fr;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;

    @media (max-width: 768px) {
      grid-template-columns: 1fr 1fr 1fr;

      gap: 0.5rem;
    }
  }

  .field-group {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  label {
    font-weight: 500;
    font-size: 0.95rem;
    color: #333;
    white-space: nowrap;
  }
  .scroll-wrapper {
    max-height: 300px;
    overflow-y: auto;
    padding-right: 8px;
  }

  .input {
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 1rem;
    width: 100%;
    box-sizing: border-box;
  }
  .delete-btn-container {
    display: flex;
    align-items: center;
    // justify-content: center;
    @media (max-width: 768px) {
      justify-content: center;
    }
  }
  .button {
    padding: 0.5rem 1rem;
    border-radius: 6px;
    border: none;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 25px;
    width: 50px;
    height: 40px;
    @media (max-width: 768px) {
      width: 100px;
      //   margin-top: 0px;
    }
  }

  // .delete {
  //   background-color: var(--error-color, #f44336);
  //   color: white;
  // }

  // .delete:hover {
  //   background-color: #d32f2f;
  // }

  .restore {
    background-color: #4caf50;
    color: white;
    margin-top: 1rem;
    width: 73%;
    @media (max-width: 768px) {
      width: 100%;
    }
  }

  .restore:hover {
    background-color: #388e3c;
  }

  .restore-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
    max-width: 600px;
    width: 100%;
  }
  .restore-label {
    font-weight: 500;
    font-size: 0.95rem;
    color: #333;
    margin-right: 0.5rem;
    white-space: nowrap;
  }
  .restore-select {
    width: 100%;
    max-width: 300px;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 1rem;
    box-sizing: border-box;
    outline: none;
    transition: border 0.2s;
  }
  .restore-select:focus {
    border: 1.5px solid #1976d2;
  }
  .restore-btn {
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 0.5rem 2rem;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    height: 42px;
    box-shadow: 0 2px 8px rgba(76, 175, 80, 0.08);
    transition: background 0.2s, box-shadow 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .restore-btn:hover {
    background-color: #388e3c;
    box-shadow: 0 4px 16px rgba(56, 142, 60, 0.12);
  }
`;
