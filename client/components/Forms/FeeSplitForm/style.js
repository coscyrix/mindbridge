import styled from "styled-components";

export const FeeSplitFormWrapper = styled.div`
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