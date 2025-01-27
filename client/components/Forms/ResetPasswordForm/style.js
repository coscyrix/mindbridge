import styled from "styled-components";

export const ResetFormWrapper = styled.div`
  width: 50%;
  input {
    border: 1px solid #e1e1e1;
  }

  button {
    background-color: #4a00e0;
    color: white;
    border: 1px solid #ccc;
    border-radius: 8px;
    z-index: 10;
    width: 50%;
    min-width: max-content;
    border: 1px solid #e1e1e1;
    box-shadow: -2px 0px 20px 0px #a4acb940;
    padding: 5px 12px;
    height: 38px;

    &:hover {
      background: #3a00b5;
    }
  }
`;
