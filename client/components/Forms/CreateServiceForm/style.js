import styled from "styled-components";

export const CreateServiceFormWrapper = styled.div`
  height: 100%;
  overflow: scroll;
  padding: 20px;
  .labelText {
    font-size: 1.8rem;
    margin-bottom: 2.5rem;
    margin-top: 0px;
  }
  form {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
  }
  label {
    display: block;
    margin: 0rem 0 0.5rem;
    font-weight: bold;
  }

  .form-fields {
    .field {
      width: 100%;
      margin: 8px;
    }
  }

  .fields {
    display: flex;
    gap: 20px;

    > div {
      width: 100%;

      input {
        border: 1px solid #ddd;
      }
    }
  }

  button {
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

  .radio-button-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 20px;
    height: 50%;
    .radio-cell {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 4px;
    }
    .radio-cell label,
    input {
      margin: 0;
    }
  }

  .position-container {
    display: flex;
    gap: 20px;

    .select-container {
      .multi-select {
        .select__control {
          width: 100%;
        }
      }
    }
  }

  .remove-field-button {
    display: flex;
    align-items: center;
    margin-top: 15px;
    color: rgba(0, 0, 0, 0.5);
  }

  .add-more-button {
    margin-bottom: 10px;
    margin-left: auto;
    width: max-content;
    cursor: pointer;
    color: var(--primary-button-color);
    &:hover {
      color: var(--primary-button-hover-color);
    }
  }

  .svc-formula {
    border: 1px solid #ddd;
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
