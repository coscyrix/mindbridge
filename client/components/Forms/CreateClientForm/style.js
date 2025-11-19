"use client";

import styled from "styled-components";

export const CreateClientWrapper = styled.div`
  height: 100%;
  padding: 20px 30px 0 30px;
  label {
    display: block;
    margin: 0rem 0 0.5rem;
    font-weight: bold;
  }
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

  .fields-wrapper-name {
    display: flex;
    gap: 20px;
    div {
      width: 100%;
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

  .custom-error-massage {
    color: var(--error-color);
    margin: 8px 0 16px;
  }

  .multi-select {
    padding-bottom: 10px;

    .select__control {
      padding: 3px 6px;
      border: 1px solid #e1e1e1;
      border-radius: 6px;
    }

    .select__indicator-separator {
      display: none;
    }
  }

  .select-field-wrapper {
    margin-bottom: 32px;
  }

  .custom-select {
    width: 100% !important;

    .custom-select__selected {
      padding: 11px 16px;
      border: 1px solid #e1e1e1 !important;
      border-radius: 6px;

      .custom-select__heading {
        color: #000000;
      }

      .custom-select__arrow {
        color: black !important;
      }
    }
  }

  .phone-input-wrapper {
    margin-bottom: 16px;

    label {
      display: block;
      margin: 0rem 0 0.5rem;
      font-weight: bold;
    }

    .PhoneInput {
      margin-top: 10px;
      width: 100%;
      display: flex;
      align-items: center;
      gap: 8px;

      .PhoneInputInput {
        flex: 1;
        height: 45px;
        border: 1px solid #e7e7e9;
        background: #ffffff;
        color: #000000;
        padding: 11px 16px;
        font-size: 14px;
        font-weight: 400;
        line-height: 24px;
        border-radius: 6px;
        font-family: inherit;
        transition: all 0.2s ease;

        &::placeholder {
          color: #000000;
          opacity: 0.2;
        }

        &:focus-visible,
        &:hover {
          outline: 1px solid #1b6bc0;
          box-shadow: 0px 0px 0px 1.9px #1b6bc042 inset;
          box-shadow: 0px 0px 0px 4px #1b6bc030;
          border-color: #1b6bc0;
        }
      }

      .PhoneInputCountry {
        margin-right: 0;
        padding: 0 8px;
        border: 1px solid #e7e7e9;
        border-radius: 6px;
        background: #ffffff;
        height: 45px;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 60px;
        transition: all 0.2s ease;
        cursor: pointer;

        &:hover {
          border-color: #1b6bc0;
        }

        .PhoneInputCountryIcon {
          width: 24px;
          height: 18px;
          box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
          border-radius: 2px;
        }

        .PhoneInputCountrySelect {
          margin-left: 4px;
          padding: 0;
          border: none;
          background: transparent;
          font-size: 14px;
          color: #000000;
          cursor: pointer;
        }

        .PhoneInputCountrySelectArrow {
          opacity: 0.5;
          width: 8px;
          height: 8px;
          margin-left: 4px;
          border-style: solid;
          border-width: 0 1px 1px 0;
          transform: rotate(45deg);
          border-color: #000000;
        }
      }

      &.phone-input-error {
        .PhoneInputInput,
        .PhoneInputCountry {
          border-color: var(--error-color);
          outline: 1px solid var(--error-color);
          box-shadow: 0px 1px 2px 0px #a4acb924;
          box-shadow: 0px 0px 0px 4px #fee4e2;
        }
      }
    }
  }
`;
