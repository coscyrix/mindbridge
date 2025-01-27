import styled from "styled-components";

export const PCL5FormContainer = styled.div`
  padding: 20px 30px;
  h1 {
    margin: 0px;
  }
  p {
    font-size: 14px;
  }

  .questions-table {
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

    td:first-child {
      text-align: left;
    }

    input[type="radio"] {
      cursor: pointer;
    }
  }

  .primary {
    background: var(--primary-button-color);
    color: #fff;
    margin-top: 20px;
    margin-left: auto;
    min-width: 100px;
    &:hover {
      background: var(--primary-button-hover-color);
    }
  }
`;
