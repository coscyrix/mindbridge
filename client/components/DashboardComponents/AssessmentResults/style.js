import styled from "styled-components";

export const AssessmentResultsContainer = styled.div`
  .content {
    height: 300px;
    overflow: auto;
    padding: 0px;

    .tab-and-heading-container {
      position: unset;
      padding: unset;
      background: unset;
      margin-bottom: 15px;
      .heading-container {
        display: block;
        .heading {
          display: none;
        }
      }
    }

    .pagination-controls {
      display: none;
    }
  }
`;
