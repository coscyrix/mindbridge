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
`;
