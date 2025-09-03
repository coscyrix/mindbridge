import styled from "styled-components";

export const AnxietyDisorderFormContainer = styled.div`
  padding: 20px 30px;
  h2 {
    text-align: center;
    padding-bottom: 10px;
  }
  p {
    text-align: center;
    padding-bottom: 20px;
  }

  .anxiety-content {
    &_select-fields {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      margin-bottom: 20px;
      align-items: center;
    }
    &_input-fields-container {
      display: grid;
      grid-template-columns: repeat(2, 1fr);

      input {
        border: none;
        background: transparent;
        width: 100%;
      }

      .total_score {
        text-align: center;
      }

      .score-wrapper {
        display: flex;
        align-items: center;
        gap: 5px;
        width: 20%;
      }
    }
    .primary {
      margin-top: 20px;
      margin-left: auto;
      background: var(--primary-button-color);
      color: #fff;
      min-width: 100px;
      &:hover {
        background: var(--primary-button-hover-color);
      }
    }
  }
`;
