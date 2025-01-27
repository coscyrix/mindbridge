import styled from "styled-components";

export const ServicesContainer = styled.div`
  padding: 20px 30px;
  padding-top: 0px;

  @media screen and (max-width: 768px) {
    padding: 0px 16px;
  }

  .mobile-button-group {
    gap: 4px;
    .search-bar {
      min-width: unset;
    }
  }
  .create-session-layout {
    transition: transform 0.3s ease-in-out;
    background: red;
    transform: translateX(100%);

    &.open {
      transform: translateX(0);
    }
  }
`;

export const ServiceHeadingContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
