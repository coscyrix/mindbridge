import styled from "styled-components";

export const CustomCardContainer = styled.div`
  width: 100%;
  border-radius: 6px;
  color: #333333;
  background: #fff;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.14);
  padding: 0 30px 20px;

  .heading {
    background: white;
    padding-top: 20px;
    border-bottom: 1px solid #e1e1e1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    margin-bottom: 20px;
  }

  .select-container {
    .multi-select {
      .select__control {
        border: none;
        border-radius: 0px;
        border-bottom: 1px solid #e1e1e1;
        box-shadow: none;
        &--menu-is-open {
          border-bottom: 1px solid #000;
        }
      }
    }
  }
  @media (max-width: 767px) {
    padding: 0px 16px;
  }
`;
