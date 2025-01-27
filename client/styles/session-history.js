import styled from "styled-components";

export const SessionHistoryContainer = styled.div`
  padding: 20px 30px;
  padding-top:0px;
  @media screen and (max-width:768px){
    padding:20px 16px;
    padding-top:0px;
  }

  .header-wrapper {
    display: flex;
    flex-direction: column;
    gap: 6px;
    position:sticky;
    top:60px;
    padding-top:20px;
    z-index: 5;
    background:var(--background-color);
    @media screen and (max-width:768px){
      top:64px;
    }
  }

  .dropdown_list-container {
    right: 30px;
  }

  .header-wrapper h2 {
    margin: 0;
  }

  .header-wrapper p {
    margin: 0;
  }
  .content {
    padding: 0px !important;
    .tab-and-heading-container{
      top:134px !important;
      @media screen and (max-width:768px){
        top:138px !important;
      }
      .heading-container {
        align-items: start !important;
        margin-bottom: 15px;
        @media screen and (max-width: 1100px) {
          flex-direction: row !important;
          justify-content: space-between;
        }
  
        @media screen and (max-width: 768px) {
          flex-direction: column !important;
        }
        .button-group {
          @media screen and (max-width: 1100px) {
            width: unset !important;
          }
          @media screen and (max-width: 768px) {
            display: none;
          }
        }
  
        .mobile-button-group {
          @media screen and (max-width: 768px) {
            display: flex;
          }
          .dropdowns-container{
            display: flex;
            gap:4px;
          }
          }
        }
    }
      .heading-wrapper {
        display: none !important;
      }
      .user-info-selects {
        display: flex;
        gap: 8px;

        .custom-select {
          width: max-content;
          &__selected {
            border: 1px solid #e1e1e1;
            box-shadow: 0px 1px 2px 0px #a4acb933;
            border-radius: 8px;
            padding: 9px 12px;
          }
        }

        .custom-search-wrapper {
          @media screen and (max-width: 768px) {
            display: none;
          }
        }
      }

      .mobile-button-group {
        gap: 8px;
        .search {
          .search-bar {
            min-width: unset;
          }
        }
      }
      .button-group {
        .search {
          display: none;
        }
      }

      .session-histor-table {
        margin-top: 40px;
      }

      .search-button-wrapper button {
        cursor: pointer;
      }
    }
  }
`;

export const Overlay = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
`;
