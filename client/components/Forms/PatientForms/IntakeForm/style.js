import styled from "styled-components";

export const IntakeFormContainer = styled.div`
  padding: 30px 40px;
  max-width: 900px;
  margin: 20px auto;
  background: #fff;
  font-family: Arial, sans-serif;

  .form-section {
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 1px solid #e0e0e0;

    &:last-of-type {
      border-bottom: none;
    }

    h3 {
      font-size: 18px;
      font-weight: 600;
      color: #333;
      margin-bottom: 20px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  }

  .form-row {
    margin-bottom: 20px;

    label {
      display: block;
      font-weight: 500;
      color: #333;
      margin-bottom: 8px;
      font-size: 14px;
    }
  }

  .checkbox-group {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin-top: 10px;

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: normal;
      cursor: pointer;
      font-size: 14px;
      color: #555;

      input[type="checkbox"],
      input[type="radio"] {
        width: 18px;
        height: 18px;
        cursor: pointer;
        accent-color: #1a73e8;
      }

      input[type="radio"] {
        margin-right: 4px;
      }
    }
  }

  .consent-container {
    margin-top: 15px;
    padding: 15px;
    background: #f8f9fa;
    border: 1px solid #e0e0e0;
    border-radius: 6px;

    .consent-checkbox-label {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      cursor: pointer;
      font-size: 14px;
      color: #333;
      line-height: 1.5;

      .consent-checkbox {
        width: 20px;
        height: 20px;
        margin-top: 2px;
        cursor: pointer;
        accent-color: #1a73e8;
      }
    }
  }

  .error-message {
    display: block;
    color: #d32f2f;
    font-size: 12px;
    margin-top: 5px;
  }

  .form-actions {
    margin-top: 30px;
    display: flex;
    justify-content: center;
    padding-top: 20px;
    border-top: 2px solid #e0e0e0;

    button.primary {
      min-width: 200px;
      padding: 12px 24px;
      font-size: 16px;
      font-weight: 500;
      background-color: var(--primary-button-color, #1a73e8);
      color: white;
      border: none;

      &:hover:not(:disabled) {
        background-color: var(--primary-button-hover-color, #1557b0);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
  }

  input[type="text"],
  input[type="email"],
  input[type="tel"],
  textarea {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    font-family: inherit;
    transition: border-color 0.2s ease;

    &:focus {
      outline: none;
      border-color: #1a73e8;
      box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.1);
    }

    &::placeholder {
      color: #999;
    }
  }

  textarea {
    resize: vertical;
    min-height: 80px;
  }

  .read-only-indicator {
    display: block;
    font-size: 12px;
    color: #666;
    font-style: italic;
    margin-top: 4px;
    margin-left: 4px;
  }

  .read-only-field {
    background-color: #f5f5f5 !important;
    cursor: not-allowed !important;
    color: #666 !important;
    border-color: #d0d0d0 !important;

    &:focus,
    &:hover {
      border-color: #d0d0d0 !important;
      box-shadow: none !important;
      outline: none !important;
    }

    &::placeholder {
      color: #999 !important;
    }
  }

  input:disabled,
  textarea:disabled {
    background-color: #f5f5f5 !important;
    cursor: not-allowed !important;
    color: #666 !important;
    border-color: #d0d0d0 !important;
    opacity: 1 !important;

    &:focus,
    &:hover {
      border-color: #d0d0d0 !important;
      box-shadow: none !important;
      outline: none !important;
    }

    &::placeholder {
      color: #999 !important;
    }
  }

  .phone-input-wrapper {
    margin-top: 8px;

    .PhoneInput {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .PhoneInput .PhoneInputInput {
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
    }

    .PhoneInput .PhoneInputInput::placeholder {
      color: #000000;
      opacity: 0.2;
    }

    .PhoneInput .PhoneInputInput:focus-visible,
    .PhoneInput .PhoneInputInput:hover {
      outline: 1px solid #1b6bc0;
      box-shadow: 0px 0px 0px 1.9px #1b6bc042 inset;
      box-shadow: 0px 0px 0px 4px #1b6bc030;
      border-color: #1b6bc0;
    }

    .PhoneInput .PhoneInputCountry {
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
    }

    .PhoneInput .PhoneInputCountry:hover {
      border-color: #1b6bc0;
    }

    .PhoneInput.read-only-phone .PhoneInputInput,
    .PhoneInput.read-only-phone .PhoneInputCountry {
      background-color: #f5f5f5 !important;
      cursor: not-allowed !important;
      color: #666 !important;
      border-color: #d0d0d0 !important;
      pointer-events: none !important;
    }

    .PhoneInput.read-only-phone .PhoneInputInput:focus,
    .PhoneInput.read-only-phone .PhoneInputInput:hover,
    .PhoneInput.read-only-phone .PhoneInputCountry:hover {
      border-color: #d0d0d0 !important;
      box-shadow: none !important;
      outline: none !important;
    }

    .PhoneInput.phone-input-error .PhoneInputInput,
    .PhoneInput.phone-input-error .PhoneInputCountry {
      border-color: #d32f2f;
    }
  }

  .signature-canvas {
    border: 1px solid #ddd;
    border-radius: 6px;
    width: 100%;
    height: 150px;
    background: #fff;
    cursor: crosshair;
  }

  .save-clear {
    background-color: #1a73e8;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: #1557b0;
    }

    &:active {
      background-color: #0f4a8a;
    }
  }

  button[type="button"]:not(.save-clear) {
    background-color: #f5f5f5;
    color: #333;
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background-color: #e0e0e0;
      border-color: #ccc;
    }

    &:active {
      background-color: #d0d0d0;
    }
  }
`;

export const LoadingContainer = styled.div`
  text-align: center;
  padding: 40px;
`;

export const OtherSymptomInput = styled.div`
  margin-left: 20px;
  max-width: 300px;
`;

export const ReadOnlyInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  background-color: #f5f5f5;
  color: #666;
  
  &:disabled {
    background-color: #f5f5f5 !important;
    cursor: not-allowed !important;
    color: #666 !important;
    border-color: #d0d0d0 !important;
  }
`;

