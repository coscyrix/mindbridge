import styled from "styled-components";

export const CreateSessionLayoutWrapper = styled.div`
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: 10;
  top: 0;
  right: 0;
  background: #fff;
  transform: translateX(100%);
  transition: transform 300ms ease-in-out;
  z-index: 99;

 

  .heading {
    position: absolute;
    top: 20px;
    right: 20px;
    color: var(--error-color);
    &:hover {
      color: var(--error-hover-color);
    }
    .close_button {
      cursor: pointer;
    }
  }

  &.layout_open {
    transform: translateX(0%);
  }
`;

export const CreateSession = styled.div`
  div {
    @media (min-width: 1024px) {
      display: block;
      z-index: 6;
    }
  }
`;
