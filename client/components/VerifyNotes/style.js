import styled from "styled-components";

export const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  input {
    width: 100%;
    min-width: 450px;
    height: 45px;
    border: 1px solid #ddd;
    border-radius: 10px;
    background: #ffffff;
    color: #000000;
    padding: 11px 16px;
    font-size: 14px;
    font-weight: 400;
    line-height: 24px;
    margin: 0px;
  }

  .verify-mobile-button {
    width: 100%;
    display: flex;
    background: var(--primary-button-color);
    border-radius: 8px;
    color: #ffffff;

    &:hover {
      background: var(--primary-button-hover-color);
    }
  }
`;
