import styled from "styled-components";

export const CustomInputContainer = styled.div`
  margin-bottom: 16px;
  .textbox {
    position: relative;
  }
  .textbox input {
    padding-left: 73px;
  }
  .https {
    position: absolute;
    top: 0px;
    left: 17px;
    color: #767676;
  }

  input {
    width: 100%;
    height: 45px;
    border: 1px solid #e7e7e9;
    background: #ffffff;
    color: #000000;
    padding: 11px 16px;
    font-size: 14px;
    font-weight: 400;
    line-height: 24px;
    margin-top: 10px;
    border-radius: 6px;
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
    margin-left: 16px;
  }

  p {
    margin-top: 0.5rem;
  }

  .input-field-container {
    position: relative;
  }

  .input-icon {
    position: absolute;
    top: 33%;
    right: 5%;
  }

  .disabled {
    pointer-events: none;
    opacity: 0.7 !important;
  }
`;
