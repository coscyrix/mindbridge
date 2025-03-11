"use client";
import styled from "styled-components";

export const ClientManagementContainer = styled.div`
  padding: 20px 30px;
  padding-top: 0px;
  @media (max-width: 768px) {
    padding: 20px 16px;
    padding-top: 0px;
  }
  .content
    .tab-and-heading-container
    .heading-container
    .heading
    .heading-wrapper {
    display: ${(props) => props.role === 4 && "none"} !important;
  }

  .content .tab-and-heading-container {
    top: ${(props) => props.role === 4 && "128px"};
  }
  .client-session-heading {
    position: sticky;
    top: 60px;
    background: var(--background-color);
    padding-top: 20px;
    z-index: 5;
    @media screen and (max-width: 768px) {
      top: 64px;
    }
    h2 {
      margin: 0px;
    }
    p {
      margin: 0px;
    }
    .heading-wrapper {
      display: flex;
      justify-content: space-between;
      @media screen and (max-width: 640px) {
        align-items: center;
        margin-bottom: 10px;
      }
    }
  }
  .content {
    .tab-and-heading-container .heading-container .mobile-button-group {
      @media screen and (max-width: 640px) {
        gap: 4px;
      }
    }
    .search {
      .search-bar {
        @media screen and (max-width: 640px) {
          min-width: unset;
        }
      }
    }
  }
`;
