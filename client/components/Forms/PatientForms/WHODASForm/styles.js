import styled from "styled-components";

export const WHODasFormContainer = styled.div`
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
  .alignLeft {
    text-align: left !important;
    width: 800px;
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
export const RadioWrapper = styled.div`
  display: inline-block;
  position: relative;

  input[type="radio"] {
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid ${(props) => (props.hasError ? "red" : "black")};
    background-color: ${(props) => (props.checked ? "blue" : "transparent")};
    transition: border-color 0.3s ease, background-color 0.3s ease;
  }

  input[type="radio"]:checked {
    background-color: blue; // Color for the checked state
  }
`;
