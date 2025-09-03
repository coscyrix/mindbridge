import styled from "styled-components";

export const CustomMultiSelectContainer = styled.div`
  width: 100%;
  margin-bottom: 16px;
  position: relative;
  // z-index: 1000;

  .select-container label {
    display: block;
    margin-bottom: 10px;
  }
  .select-container {
    width: 100%;
    position: relative;
    // z-index: 1000;
    .multi-select {
      padding-bottom: 8px;
      width: 100%;
      position: relative;
      // z-index: 1000;
      /* z-index: 9; */

      .select__control {
        padding: 3px 6px;
        border: 1px solid #e1e1e1;
        border-radius: 6px;
        width: 100%;
        border-color: ${({ error }) =>
          error && "var(--error-color)"} !important;
        box-shadow: ${({ error }) =>
          error && "0px 0px 0px 4px #fee4e2"} !important;
      }

      .select__indicator-separator {
        display: none;
      }

      .select__menu {
        z-index: 1001 !important;
      }

      .select__menu-list {
        z-index: 1001 !important;
      }
    }
  }
`;
