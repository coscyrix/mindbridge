import styled from "styled-components";

export const CustomMultiSelectContainer = styled.div`
  width: 100%;
  margin-bottom:16px;
  .select-container {
    width: 100%;
    .multi-select {
      padding-bottom: 8px;
      width: 100%;
      /* z-index: 9; */

      .select__control {
        padding: 3px 6px;
        border: 1px solid #e1e1e1;
        border-radius: 6px;
        width: 100%;
        border-color: ${({error}) => error && 'var(--error-color)'} !important;
        box-shadow: ${({error}) => error && '0px 0px 0px 4px #fee4e2'} !important;
      }

      .select__indicator-separator {
        display: none;
      }
    }
  }
`;
