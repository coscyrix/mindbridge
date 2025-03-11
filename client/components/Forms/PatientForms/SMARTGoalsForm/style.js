import styled from "styled-components";

export const SMARTGoalsContainer = styled.div`
  padding: 20px 30px;
  h1 {
    margin: 0px;
  }
  p {
    font-size: 14px;
  }

  .smart-goals {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0px 50px;
    @media only screen and (max-width: 768px) {
      grid-template-columns: repeat(2, 1fr);
      gap: 0px 20px;
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
    margin-top: 20px;
    margin-left: auto;
    &:hover {
      background: var(--primary-button-hover-color);
    }
  }
`;
