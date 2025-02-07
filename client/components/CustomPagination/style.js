import styled from "styled-components";

export const PaginationContainer = styled.div`
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    list-style: none;
    padding: 0;
    li {
      background: transparent;
      border: none;
      border-radius: 6px;
      width: 32px;
      height: 32px;
      padding: 10.5px 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }

    .previous {
      width: unset !important;
      height: unset !important;
      margin-right: auto;
      svg {
        transform: rotate(180deg);
      }
    }
    .next {
      width: unset !important;
      height: unset !important;
      margin-left: auto;
    }

    .active {
      padding: 10.5px 12px;
      border-radius: 6px;
      border: 1px solid #e1e1e1;
      box-shadow: 0px 1px 2px 0px #a4acb933;
      background: var(--secondary-button-color);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2.5px;
      width: max-content;
      position: relative;
      cursor: pointer;
    }
  }
`;
