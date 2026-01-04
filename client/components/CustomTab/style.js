import styled from "styled-components";

export const CustomTabContainer = styled.div`
  width: 100%;
  padding: 11px;
  border: 1px solid #e1e1e1;
  border-radius: 6px;
  background: white;
  flex: 1;
  min-width: 0;


  &.no-shrink-tab {
    min-width: 310px;
    flex-shrink: 0;
  }

  .heading {
    font-size: 12px;
    font-weight: normal;
    color: #767676;
    margin: 0;
  }
  .value {
    font-size: 16px;
    font-weight: 500;
    margin: 0;
  }
`;
