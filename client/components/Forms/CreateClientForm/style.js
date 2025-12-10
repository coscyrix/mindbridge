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
`;
