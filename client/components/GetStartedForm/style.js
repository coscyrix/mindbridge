import styled from "styled-components";

const GetStartedFormWrapper = styled.div`
  // padding: 2.5rem 3rem;
  background: white;
  border-radius: 12px;
  max-width: 1000px;
  width: 100%;

  .onboarding-form {
    position: relative;
    margin-top: 54px;
  }
  label {
    color: #767676;
  }
  input {
    margin-top: 10px;
  }

  .disclaimer input {
    margin-right: 10px;
  }

  .modal-close-btn {
    position: absolute;
    top: 16px;
    right: 24px;
    background: none;
    border: none;
    font-size: 26px;
    font-weight: bold;
    color: #555;
    cursor: pointer;
    z-index: 100;
  }

  .form-header {
    margin-bottom: 2rem;
  }

  .arrow-parent {
    margin-bottom: 3.5rem;

    h1 {
      font-weight: 600;
      font-style: normal;
      font-size: 1.7rem;
      line-height: 100%;
      letter-spacing: 0%;
      text-align: center;
      font-family: Playfair Display;
    }
  }

  .steps-parent {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 3rem;
    margin-left: 60px;
    margin-right: 40px;
  }

  .progress-background {
    position: absolute;
    top: 18px;
    left: 0;
    right: 0;
    height: 4px;
    background-color: #e0e0e0;
    border-radius: 2px;
    z-index: 1;
  }

  .progress-filled {
    height: 4px;
    background-color: #3973b7;
    width: 0;
    border-radius: 2px;
    transition: width 0.3s ease;
    z-index: 2;
  }

  .step-main {
    position: relative;
    z-index: 3;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 4%;
    text-align: center;
    background-color: white;
  }

  .step-count {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: #e0e0e0;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    margin-bottom: 0.5rem;
    z-index: 3;
    font-size: 16px;
  }

  .step-main.active .step-count,
  .step-main.completed .step-count {
    background-color: #3973b7;
  }

  .step-label {
    font-weight: 600;
    font-size: 14px;
    width: 141px;
    text-align: center;
    color: #000;
  }

  .onboarding-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    column-gap: 1.5rem;
    margin-bottom: 1.2rem;

    h2 {
      grid-column: 1 / -1;
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: #333;
    }

    p {
      grid-column: 1 / -1;
      font-size: 0.9rem;
      margin-top: 0.5rem;
    }
  }

  .form-navigation {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1rem;
    @media screen and (max-width: 475px) {
      flex-direction: column;
      align-items: center;
    }
  }

  .disclaimer {
    // margin-top: 1.5rem;
    font-size: 0.75rem;
    display: block;
    color: #666;

    // text-align: center;
  }
  disclamer-parent {
    margin-top: 15px;
  }
  .button {
    width: 122px;
    height: 44px;
  }
  .button-blue {
    color: #fff;
    background: #3973b7;
  }

  @media screen and (max-width: 600px) {
    .arrow-parent {
      flex-direction: column;
      align-items: flex-start;

      h1 {
        font-size: 1.2rem;
      }
    }
    .step-label {
      width: 80px;
      font-size: 12px;
    }
    .steps-parent {
      margin-left: 20px;
      margin-right: 10px;
      // flex-direction: column;

      .step-progress {
        // display: none;
      }

      .step-main {
        // margin-bottom: 1rem;
        // width: 100%;
      }
    }

    .onboarding-section {
      grid-template-columns: 1fr;
    }

    .form-navigation {
      justify-content: space-between;
    }
  }
  .country-phoneno {
    position: relative;
  }
  .countryOption {
    border: none;
    position: absolute;
    top: 45px;
    z-index: 10;
    left: 8px;
  }
  .phone-number-input {
    padding-left: 65px;
  }
  .address-main {
    display: flex;
    flex-direction: column;
  }
  .address-textarea {
    margin-top: 10px;
    margin-left: 3px;
    border: 1px solid #e7e7e9;
    border-radius: 7px;
    padding-left: 10px;
    padding-top: 10px;
  }
  .error-text {
    color: var(--error-color);
  }
  .address-textarea.error-border {
    border-color: red;
  }
  .feature-container {
    position: relative;
    margin-bottom: 50px;
  }
  .feature-container p {
    position: absolute;
    left: 3px;
    top: 67px;
  }
  .feature-select {
    border: 1px solid red;
    border-radius: 6px;
  }
`;

export default GetStartedFormWrapper;
