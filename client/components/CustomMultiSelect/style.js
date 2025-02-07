import styled from "styled-components";

export const CustomMultiSelectContainer = styled.div`
  width: 100%;
  .select-container {
    width: 100%;
    .multi-select {
      padding-bottom: 10px;
      width: 100%;
      z-index: 9; // to show first value in case of Table Header

      .select__control {
        padding: 3px 6px;
        border: 1px solid #e1e1e1;
        border-radius: 6px;
        width: 100%;
      }

      .select__indicator-separator {
        display: none;
      }
    }
  }
`;
