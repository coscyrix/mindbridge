import styled from "styled-components";

export const SmartTabWrapper = styled.div`
  .tab {
    display: flex;

    .active {
      background: var(--active-tab-background);
      color: #fff;
    }
    button {
      background: #fff;
      color: var(--inactive-tab-color);
      border: 1px solid #e1e1e1;
      padding: 12px;
      min-width: 85px;
      cursor: pointer;

      &:first-child {
        border-top-left-radius: 6px;
        border-bottom-left-radius: 6px;
        border-right: 0px;
      }

      &:last-child {
        border-top-right-radius: 6px;
        border-bottom-right-radius: 6px;
      }
    }
  }
`;
