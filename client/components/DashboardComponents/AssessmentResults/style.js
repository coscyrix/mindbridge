import styled from "styled-components";

export const AssessmentResultsContainer = styled.div`
  .content {
    height: 300px;
    padding: 0px;

    .tab-and-heading-container {
      position: unset;
      padding: unset;
      background: unset;
      margin-bottom: 15px;
      .heading-container {
        display: block;
        .heading {
          display: none;
        }
      }
    }

    .pagination {
      display: none;
    }
  }
`;

export const SmartGoalDataContainer = styled.div`
  padding: 30px 40px;
  max-width: 1200px;
  margin: 0 auto;
  background: #ffffff;

  .smart-goal-form {
    width: 100%;
  }

  .section-title {
    color: #0066cc;
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 15px 0;
    padding-bottom: 8px;
    border-bottom: 2px solid #e3f2fd;
    letter-spacing: -0.3px;
  }

  .form-section {
    margin: 35px 0;
    padding: 25px 0;
    border-bottom: 1px dashed #d0d7de;

    &:last-of-type {
      border-bottom: none;
    }

    &.system-output {
      background: #f0f7ff;
      padding: 25px;
      border-radius: 8px;
      border: 1px solid #b3d9ff;
      margin-top: 40px;
    }
  }

  .goal-source-options,
  .measurement-methods,
  .clinician-actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 10px;
  }

  .checkbox-option {
    display: flex;
    align-items: center;
    gap: 10px;

    input[type="radio"],
    input[type="checkbox"] {
      width: 18px;
      height: 18px;
      cursor: pointer;
      accent-color: #0066cc;
      margin: 0;

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    label {
      font-size: 15px;
      color: #2c3e50;
      cursor: pointer;
      user-select: none;
      font-weight: 400;
    }
  }

  .library-goal-selected {
    margin-top: 15px;
    padding: 12px 16px;
    background: #e3f2fd;
    border-radius: 6px;
    border-left: 4px solid #0066cc;
    font-size: 14px;
    color: #2c3e50;

    strong {
      color: #0066cc;
      font-weight: 600;
    }
  }

  .smart-goal-draft {
    margin-top: 15px;

    .draft-textarea,
    textarea {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e9ecef;
      border-radius: 8px;
      font-size: 15px;
      font-family: inherit;
      line-height: 1.6;
      color: #495057;
      background: #f8f9fa;
      resize: vertical;
      min-height: 80px;
      box-sizing: border-box;
    }
  }

  .editable-fields-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-top: 15px;
  }

  .field-item {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .field-name {
      font-size: 15px;
      color: #2c3e50;
      font-weight: 500;
    }

    .field-status {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      margin-left: 8px;

      &.editable {
        background: #d4edda;
        color: #155724;
      }

      &.locked {
        background: #f8d7da;
        color: #721c24;
      }
    }

    input,
    textarea {
      margin-top: 8px;
    }
  }

  .action-description {
    margin-top: 15px;
    padding: 12px 16px;
    background: #fff3cd;
    border-left: 4px solid #ffc107;
    border-radius: 4px;
    font-size: 14px;
    color: #856404;
    line-height: 1.6;
    font-style: italic;
  }

  .system-output-content {
    margin-top: 15px;

    .output-textarea,
    textarea {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #b3d9ff;
      border-radius: 8px;
      font-size: 15px;
      font-family: inherit;
      line-height: 1.6;
      color: #2c3e50;
      background: #ffffff;
      resize: vertical;
      min-height: 80px;
      font-weight: 500;
      box-sizing: border-box;
    }
  }

  .SmartGoalClientTable {
    overflow: auto;
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }

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

  @media only screen and (max-width: 768px) {
    padding: 20px;

    .section-title {
      font-size: 18px;
    }

    .form-section {
      margin: 25px 0;
      padding: 20px 0;
    }
  }
`;
