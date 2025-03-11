import styled from "styled-components";

export const DashboardContainer = styled.div`
  padding: 20px 30px;
  display: grid;
  grid-template-columns: 50% 50%;
  flex-direction: column;
  gap: 20px;
  @media (max-width: 567px) {
    grid-template-columns: 100%;
  }
  @media (max-width: 567px) {
    padding: 10px 16px;
  }
`;

export const DashboardTableContainer = styled.div`
  padding: 20px 30px;
  display: flex;
  flex-direction: column;
  gap: 20px;

  .dashboardTableContainer {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .dashboardTableContainer .rdt_Table .rdt_TableHead {
    background: #f9fafb;
  }

  @media (max-width: 567px) {
    padding: 0 16px 20px 16px;
  }
`;
