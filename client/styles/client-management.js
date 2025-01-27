"use client";
import styled from "styled-components";

export const ClientManagementContainer = styled.div`
  padding: 20px 30px;
  padding-top: 0px;
  @media (max-width: 768px) {
    padding: 20px 16px;
    padding-top: 0px;
  }
  .children-wrapper {
    display: none;
  }
  .content .tab-and-heading-container .heading-container .mobile-button-group {
    @media screen and (max-width: 640px) {
      gap: 4px;
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
