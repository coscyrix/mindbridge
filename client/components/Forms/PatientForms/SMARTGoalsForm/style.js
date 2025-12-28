import styled from "styled-components";

export const SMARTGoalsContainer = styled.div`
  padding: 30px 40px;
  max-width: 1200px;
  margin: 0 auto;
  background: #ffffff;
  
  h1 {
    margin: 0 0 10px 0;
    font-size: 28px;
    font-weight: 700;
    color: #1a1a1a;
    letter-spacing: -0.5px;
  }

  h3 {
    font-size: 20px;
    font-weight: 600;
    color: #2c3e50;
    margin: 25px 0 15px 0;
    letter-spacing: -0.3px;
  }

  p {
    font-size: 14px;
    line-height: 1.6;
    color: #555;
  }

  form {
    margin-top: 20px;
  }

  .smart-goals {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px 40px;
    margin-bottom: 30px;
    padding: 25px;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e9ecef;
    
    @media only screen and (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 15px;
      padding: 20px;
    }

    > div {
      display: flex;
      align-items: center;
      gap: 15px;
      
      label {
        font-weight: 500;
        color: #495057;
        min-width: 140px;
        font-size: 14px;
      }
      
      input {
        flex: 1;
        padding: 8px 12px;
        font-size: 14px;
        color: #495057;
        transition: all 0.2s ease;
        
        &:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      }
    }
  }

  .client-info {
    &_input-question {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .SmartGoalClientTable {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;

    th,
    td {
      border: 1px solid #ccc;
      padding: 10px;
      text-align: center;
    }

    th {
      font-size: 14px;
      background-color: #f9f9f9;
      min-width: 100px;
    }

    input[type="radio"] {
      cursor: pointer;
    }
  }
  
  .alignLeft {
    text-align: left !important;
    width: 800px;
  }
  
  .select-container {
    .multi-select {
      z-index: unset !important;
      padding-bottom: 0 !important;
    }
  }

  .primary {
    background: var(--primary-button-color);
    color: #fff;
    margin-top: 40px;
    margin-left: auto;
    padding: 12px 32px;
    font-size: 16px;
    font-weight: 600;
    border-radius: 6px;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    
    &:hover {
      background: var(--primary-button-hover-color);
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }
    
    &:active {
      transform: translateY(0);
    }
  }

  .section-title {
    color: #0066cc;
    font-size: 20px;
    font-weight: 600;
    margin: 40px 0 12px 0;
    padding-bottom: 8px;
    border-bottom: 2px solid #e3f2fd;
    letter-spacing: -0.3px;
  }

  .section-instruction {
    color: #495057;
    font-size: 15px;
    margin-bottom: 20px;
    line-height: 1.6;
    font-weight: 400;
  }

  .goal-theme-section,
  .description-section,
  .timeframe-section {
    margin: 35px 0;
    padding: 25px 0;
    border-bottom: 1px dashed #d0d7de;
    transition: all 0.3s ease;
    
    &:last-of-type {
      border-bottom: none;
    }
  }

  .goal-theme-options,
  .timeframe-options {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-top: 5px;
  }

  .goal-theme-option,
  .timeframe-option {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 6px;
    transition: all 0.2s ease;
    cursor: pointer;
    border: 2px solid transparent;
    
    &:hover {
      background: #f8f9fa;
      border-color: #e9ecef;
    }
  }

  .goal-theme-option input:checked + .goal-theme-label,
  .timeframe-option input:checked + .timeframe-label {
    color: #0066cc;
    font-weight: 500;
  }

  /* Modern browsers with :has() support */
  @supports selector(:has(*)) {
    .goal-theme-option:has(input:checked),
    .timeframe-option:has(input:checked) {
      background: #e3f2fd;
      border-color: #0066cc;
    }
  }

  .goal-theme-radio,
  .timeframe-radio {
    width: 20px;
    height: 20px;
    min-width: 20px;
    cursor: pointer;
    accent-color: #0066cc;
    margin-top: 2px;
    transition: all 0.2s ease;
    
    &:hover {
      transform: scale(1.1);
    }
    
    &:checked {
      transform: scale(1.05);
    }
  }

  .goal-theme-label,
  .timeframe-label {
    font-size: 15px;
    color: #2c3e50;
    cursor: pointer;
    user-select: none;
    line-height: 1.5;
    font-weight: 400;
    flex: 1;
    transition: color 0.2s ease;
    
    &:hover {
      color: #0066cc;
    }
  }

  .description-section {
    background: #f0f7ff;
    padding: 20px 24px;
    border-radius: 8px;
    border: 1px solid #b3d9ff;
    margin-top: 25px;
    animation: fadeIn 0.3s ease-in;
    
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-5px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  }

  .description-text {
    font-style: italic;
    color: #495057;
    font-size: 15px;
    margin: 0;
    line-height: 1.7;
    padding-left: 4px;
  }

  .goal-theme-other-input {
    margin-left: 32px;
    margin-top: 20px;
    margin-bottom: 10px;
    width: 100%;
    max-width: 700px;
    animation: slideDown 0.3s ease-out;
    padding: 0;
    
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Style the CustomTextArea wrapper */
    > div {
      width: 100%;
      
      .content {
        width: 100%;
        gap: 10px;
        
        label {
          font-size: 14px;
          font-weight: 500;
          color: #495057;
          margin-bottom: 4px;
        }
        
        textarea {
          width: 100% !important;
          padding: 14px 16px;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          font-size: 15px;
          font-family: inherit;
          line-height: 1.7;
          color: #2c3e50;
          background: #ffffff;
          transition: all 0.2s ease;
          resize: vertical;
          min-height: 120px;
          box-sizing: border-box;
          
          &::placeholder {
            color: #adb5bd;
            font-style: italic;
            opacity: 0.8;
          }
          
          &:focus {
            outline: none;
            border-color: #0066cc;
            box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
            background: #ffffff;
          }
          
          &:hover:not(:focus) {
            border-color: #ced4da;
            background: #fafbfc;
          }
        }
      }
    }
  }

  @media only screen and (max-width: 768px) {
    padding: 20px;
    
    h1 {
      font-size: 24px;
    }
    
    .section-title {
      font-size: 18px;
    }
    
    .smart-goals {
      grid-template-columns: 1fr;
      
      > div {
        flex-direction: column;
        align-items: flex-start;
        
        label {
          min-width: auto;
          width: 100%;
        }
        
        input {
          width: 100%;
        }
      }
    }
    
    .goal-theme-other-input {
      margin-left: 0;
      max-width: 100%;
      
      > div .content textarea {
        min-height: 100px;
        padding: 12px 14px;
        font-size: 14px;
      }
    }
  }
`;
