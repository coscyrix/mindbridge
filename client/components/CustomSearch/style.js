import styled from "styled-components";

export const CustomSearchBarContainer = styled.div`
  .search-bar {
    display: flex;
    align-items: center;
    background: #ffffff;
    border: 1px solid #e1e1e1;
    border-radius: 6px;
    padding: 9px;
    gap: 3px;
    min-width: 217px;
    box-shadow: 0px 1px 2px 0px #a4acb933;

    &:hover {
      border-color: #888;
    }

    input::placeholder {
      font-size: 13.33px;
    }

    .search-input {
      flex: 1;
      outline: none;
      border: none;
      font-size: 1rem;
      color: #333;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      cursor: text;

      &:empty:before {
        content: attr(placeholder);
        font-family: Alegreya Sans;
        font-size: 13px;
        font-weight: 500;
        line-height: 15.6px;
        letter-spacing: -0.02em;
        color: #767676;
      }
    }

    .search-button {
      background: none;
      border: none;
      color: #555;
      font-size: 1rem;
      cursor: pointer;

      &:hover {
        color: #333;
      }
    }
  }
`;
