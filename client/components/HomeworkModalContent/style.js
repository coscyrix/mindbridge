import styled from "styled-components";

export const HomeWorkModalWrapper = styled.div`
  width: 100%;
  box-sizing: border-box;
  
  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 20px;
    width: 100%;

    label {
      font-size: 14px;
      font-weight: 500;
      color: #000000;
      margin-bottom: 6px;
    }

    input {
      border: 1px solid #e1e1e1;
      box-sizing: border-box;
    }

    .upload-input-field {
      input {
        outline: none;
        width: 100%;
        height: 100%;
        opacity: 0;
      }
    }

    .treatment-target-label {
      font-weight: 600;
      font-size: 14px;
      color: #000000;
      margin-bottom: 8px;
      padding: 8px 12px;
      background-color: #f5f5f5;
      border-radius: 6px;
      border: 1px solid #e1e1e1;
    }
  }

  .field .upload_field {
    opacity: 0;
    height: 100%;
  }

  .field .upload-input-field {
    position: relative;
    z-index: 10;
    height: 160px;
    border: 2px dashed #e1e1e1;
    border-radius: 8px;
    div {
      height: 100%;
    }
  }

  .field .icon-input-container {
    position: relative;
    z-index: 1;
    .svg-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      p {
        margin: 0;
        text-align: center;
      }
    }
  }
  .field .icon-input-container {
    .reset-icon {
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 11;
      cursor: pointer;
    }
  }

  .show-all-toggle {
    margin-bottom: 14px;
    margin-top: 6px;
    padding: 10px 12px;
    background-color: #f8f9fa;
    border: 1px solid #e1e1e1;
    border-radius: 6px;
    transition: all 0.2s ease;
    
    &:hover {
      background-color: #f0f2f5;
      border-color: #d0d5db;
    }
    
    .toggle-label {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      font-size: 14px;
      color: #374151;
      user-select: none;
      margin: 0;
      font-weight: 400;
      
      input[type="checkbox"] {
        appearance: none;
        -webkit-appearance: none;
        width: 18px;
        height: 18px;
        border: 2px solid #d1d5db;
        border-radius: 4px;
        background-color: #ffffff;
        cursor: pointer;
        margin: 0;
        padding: 0;
        position: relative;
        transition: all 0.2s ease;
        flex-shrink: 0;
        
        &:hover {
          border-color: var(--primary-button-color, #1b6bc0);
          background-color: #f0f7ff;
        }
        
        &:checked {
          background-color: var(--primary-button-color, #1b6bc0);
          border-color: var(--primary-button-color, #1b6bc0);
        }
        
        &:checked::after {
          content: "✓";
          display: block;
          color: #ffffff;
          font-size: 12px;
          font-weight: bold;
          text-align: center;
          line-height: 14px;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        
        &:focus {
          outline: 2px solid var(--primary-button-color, #1b6bc0);
          outline-offset: 2px;
        }
        
        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background-color: #f3f4f6;
          border-color: #d1d5db;
          
          &:hover {
            border-color: #d1d5db;
            background-color: #f3f4f6;
          }
        }
      }
      
      span {
        line-height: 1.5;
        flex: 1;
      }
      
      &:has(input:disabled) {
        opacity: 0.7;
        cursor: not-allowed;
      }
    }
  }

  .homework-select-wrapper {
    margin-top: 10px;
    width: 100%;
  }

  .custom-title-wrapper {
    margin-top: 12px;
    width: 100%;
    padding-bottom: 4px;
    box-sizing: border-box;
    overflow: visible;
    
    /* Ensure CustomInputField doesn't get cut off */
    > div {
      margin-bottom: 0 !important;
      width: 100%;
    }
    
    input {
      width: 98% !important;
      max-width: 100% !important;
      box-sizing: border-box;
    }
  }

  .modal-buttons {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    margin-top: 20px;
  }
  .cancel-button,
  .save-button {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    min-width: 107px;
    width: 100%;
    text-align: center;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s ease;
  }
  .save-button {
    background: var(--primary-button-color) !important;
    color: white;
    &:hover {
      background: var(--primary-button-hover-color);
    }
  }
`;

