import styled from "styled-components";

export const ClientSessionDetailPageContainer = styled.div`
  padding: 20px 20px;
`;

export const ClientSessionDetailHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: end;

  @media screen and (max-width: 1100px) {
    align-items: start;
  }

  .create-client-session-button {
    background: var(--primary-button-color);
    color: #ffffff;
    &:hover {
      background: var(--primary-button-hover-color);
    }
  }
  .col-action-buttons {
    display: flex;
    gap: 10px;
    justify-content: flex-start;
    align-items: center;
  }
`;

export const ClientSessionDetailPageTableWrapper = styled.div`
  .tab-container {
    display: flex;
    gap: 8px;
    margin: 20px 0;
  }

  .client-detail-table {
    .col-action-buttons {
      display: flex;
      gap: 8px;
    }
    .col-action-buttons button {
      width: 80px;
      padding: 4px;
    }

    .col-action-buttons .discharge-button {
      color: white;
      background-color: #f44336;
    }

    .col-action-buttons .detail-button {
      color: #fff;
      background-color: #9c27b0;
    }

    .rdt_Table .rdt_TableBody .rdt_TableRow {
      &:hover {
        background-color: white;
        cursor: pointer;
      }
    }
  }
`;

export const ClientSessionListWrapper = styled.div`

.heading-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom:30px;

    @media (min-width: 1024px) {
      display: flex;
      .button-group{
        display:flex;
        gap:8px;

        .large-screen-buttons{
          display:flex;
          gap:8px;
        }
        .small-screen-buttons{
          display:none;
        }
      }
    }

    
    .tab{
      display:flex;

      .active{
        background:var(--active-tab-background);
        color:#fff;
      }
      button{
        background:#fff;
        height:33px;
        color:var(--inactive-tab-color);
        border:1px solid #e1e1e1;
        padding:7px 10.5px;
        min-width:85px;

        &:first-child{
          border-top-left-radius:6px;
          border-bottom-left-radius:6px;
          border-right:0px;
        }

        &:last-child{
          border-top-right-radius:6px;
          border-bottom-right-radius:6px;
        }
      }}
`;
