import styled from "styled-components";

export const FeeSplitManagementWrapper = styled.div`
  padding: 2rem;
  background-color: #f9f9fb;
  min-height: 100vh;

  .consent-box {
    max-width: 600px;
    margin: 0 auto;
    padding: 2rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  }

  .description-text {
    font-size: 0.95rem;
    color: #555;
    margin-bottom: 1.5rem;
    line-height: 1.6;
  }

  .toggle-section {
    display: flex;
    justify-content: flex-start;
    margin-bottom: 1.5rem;
  }

  .form-wrapper {
    margin-top: 1rem;
  }

  .form-row {
    margin-bottom: 0.5rem;
    display: flex;
    flex-direction: column;
  }

  .ip-field {
    width: 100%;
  }

  .button-blue {
    width: 100%;
    padding: 0.75rem;
    font-weight: bold;
    font-size: 1rem;
    background: #3973b7;
    color: #fff;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    transition: 0.3s ease;
    margin-top: 16px;

    &:hover {
      background-color: #115293;
    }
  }

  @media (max-width: 600px) {
    .consent-box {
      padding: 1.5rem;
    }

    .form-row {
      margin-bottom: 1rem;
    }
  }
  .note {
    color: #747474;
  }
`;
