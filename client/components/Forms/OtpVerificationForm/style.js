import styled from "styled-components";

export const OtpVerificationFormContainer = styled.div`
  margin-bottom: 16px;
  width: 80%;
  max-width: 400px;
  h2 {
    font-size: 1.8rem;
    margin-bottom: 2.5rem;
    margin-top: 0px;
  }
  label {
    display: block;
    margin: 0rem 0 0.5rem;
    margin-bottom: 8px;
    font-weight: bold;
  }
  input {
    width: 100%;
    height: 45px;
    border: 1px solid #ddd;
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

  .error-input {
    outline: 1px solid var(--error-color);
    box-shadow: 0px 1px 2px 0px #a4acb924;
    box-shadow: 0px 0px 0px 4px #fee4e2;
  }

  .error-text {
    color: var(--error-color);
  }
  .helper-text {
    color: rgba(0, 0, 0, 0.4);
  }

  p {
    margin: 0;
  }

  .input-field-container {
    position: relative;
    margin-bottom: 16px;
  }

  .input-icon {
    position: absolute;
    top: 33%;
    right: 5%;
  }

  .disabled {
    pointer-events: none;
    opacity: 0.5 !important;
  }
  button {
    width: 100%;
    padding: 10px;
    font-size: 1rem;
    color: white;
    background: #4a00e0;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
`;
