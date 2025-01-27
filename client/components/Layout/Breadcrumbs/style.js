import styled from "styled-components";

export const BreadCrumbsWrapper = styled.div`
  ul {
    list-style: none;
    display: flex;
    align-items: center;
    gap: 4px;
    margin: 0;
    padding: 0;
  }

  li {
    display: flex;
    align-items: center;
  }

  li + li::before {
    padding: 8px;
    color: black;
  }
  li a {
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    display: flex;
    align-items: center;
  }

  li a:hover {
    color: #000;
    text-decoration: underline;
  }
`;
