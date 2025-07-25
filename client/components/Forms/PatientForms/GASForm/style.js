import styled from "styled-components";

export const GasFormWrapper = styled.div`
  background: #f8f8f8;
  padding: 0px 80px 80px 80px;

  .main-bg {
    background: white;
    margin: 100px auto;
    padding: 20px 50px;
    border-radius: 15px;
    max-width: 1000px;
  }
  .error-text {
    color: red;
    size: 10px;
  }
  .Image-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    flex-direction: column;

    h2,
    div {
      text-align: center;
      margin: 0;
      padding: 16px;
    }
  }

  .Heading-description {
    background: #d3e7ff;
    border-radius: 8px;
    padding: 30px 120px;
    text-align: center;
  }

  .select-options {
    margin-top: 32px;
  }

  .score-box {
    padding: 12px;
    border-radius: 6px;
    background-color: #ffffff;
    display: flex;
    justify-content: flex-end;
  }

  .score-content {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-direction: row-reverse;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .score-circle {
    width: 60px;
    height: 60px;
    flex-shrink: 0;
  }

  .score-text {
    display: flex;
    flex-direction: column;
    min-width: 150px;
  }

  .score-label {
    font-size: 16px;
    font-weight: bold;
  }

  .attempt-count {
    font-size: 14px;
    color: #666;
    margin-top: 4px;
  }

  .questions-wrapper {
    margin-top: 24px;
  }

  .question-block {
    margin-bottom: 20px;
  }

  .question-label {
    display: block;
    margin-bottom: 8px;
    font-weight: bold;
  }

  .option-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .option-label {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .button-group {
    margin-top: 40px;
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 20px;
    padding: 0 20px;
  }
  @media (max-width: 768px) {
    padding: 0px 24px 60px 24px;

    .main-bg {
      margin: 40px auto;
      padding: 20px;
    }

    .Heading-description {
      padding: 20px;
    }

    .score-content {
      flex-direction: row-reverse;
    }

    .score-circle {
      width: 50px;
      height: 50px;
    }

    .score-text {
      text-align: right;
    }

    .button-group {
      padding: 0;
    }
  }
  @media (max-width: 480px) {
    .Heading-description h2 {
      font-size: 18px;
    }

    .Heading-description div {
      font-size: 14px;
    }

    .score-circle {
      width: 45px;
      height: 45px;
    }

    .score-label {
      font-size: 14px;
    }

    .attempt-count {
      font-size: 12px;
    }

    .question-label {
      font-size: 14px;
    }

    .option-label {
      font-size: 14px;
    }
  }
`;
