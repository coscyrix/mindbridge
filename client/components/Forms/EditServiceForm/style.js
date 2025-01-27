import styled from "styled-components";

export const EditServiceFormWrapper = styled.div`
  .labelText {
    font-size: 1.8rem;
    margin-bottom: 2.5rem;
    margin-top: 0px;
  }

  label {
    display: block;
    margin: 0rem 0 0.5rem;
    font-weight: bold;
  }

  button {
    width: 100%;
    padding: 10px;
    font-size: 1rem;
    color: white;
    background: #4a00e0;
    border: none;
    border-radius: 5px;
    cursor: pointer;

    &:hover {
      background: #3a00b5;
    }
  }
`;
