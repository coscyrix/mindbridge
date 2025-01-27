import styled from "styled-components";

export const HeaderContainer = styled.div`
  width: 100%;
  min-height: 5vh;
  position: sticky;
  background: #f9fafb;
  top: 0;
  z-index: 5;
  border-bottom: 1px solid #e1e1e1;
  padding: 20px 30px;
  display: flex;
  justify-content: end;

  @media screen and (min-width: 1024px) {
    justify-content: start;
  }

  .breadCrumbs-wrapper {
    display: none;
    @media screen and (min-width: 1024px) {
      display: flex;
    }
  }
  @media screen and (min-width: 1024px) {
    .hamburger-icon {
      display: none;
    }
  }

  .menu-burger-icon {
    display: flex;
    justify-content: end;
  }

  > div > svg {
    z-index: 15;
    position: relative;
  }
`;
