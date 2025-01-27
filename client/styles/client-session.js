import styled from "styled-components";

export const ClientSessionContainer = styled.div`
  .content-container {
    padding: 20px 30px;

    .heading-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .search-container {
        .add-button {
          display: none;
        }

        .add-button .column-visibility-dropdown button span {
          display: block;

          @media screen and (max-width: 828px) {
            display: none;
          }
        }

        @media screen and (max-width: 1268px) {
          .add-button {
            display: flex;
            gap: 4px;

            .add-view-notes {
              background: #2b5efc;
              color: white;
            }
          }
        }
      }
      @media screen and (max-width: 1268px) {
        flex-direction: column;
        align-items: self-start;
        margin-bottom: 10px;
        .search-container {
          width: 100%;
          .search-bar {
            min-width: 140px;
          }
          display: flex;
          justify-content: space-between;
        }
      }

      @media screen and (max-width: 576px) {
        .search-bar {
          width: 140px;
          min-width: unset;
          input {
            width: 100%;
          }
        }
      }
      .search-bar {
        min-width: 300px;
      }
    }
  }

  .mobile-button-group {
    display: none;
    @media screen and (max-width: 1268px) {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
    }

    .button-group-left {
      width: 100%;
      justify-content: space-between;
    }

    .action-dropdown {
      display: flex;
      gap: 4px;
      .more-option-button {
        display: none;
        .dropdown_list-container {
          right: 4px;
        }
        @media screen and (max-width: 828px) {
          display: block;
        }
      }

      .medium-screen-button {
        display: none;

        @media screen and (min-width: 828px) and (max-width: 1268px) {
          display: flex;
          gap: 4px;
          .column-visibility-button {
            display: none;
          }
        }

        @media screen and (max-width: 828px) {
          display: none;
        }

        @media screen and (min-width: 1268px) {
          display: none;
        }
      }
    }

    .column-visibility-dropdown {
      position: relative;
    }
  }

  .button-group {
    display: flex;
    justify-content: space-between;
    margin-bottom: 30px;
    @media screen and (max-width: 1268px) {
      display: none;
    }
    &-left,
    &-right {
      display: flex;
      gap: 8px;
    }

    &-left {
      .tab {
        display: flex;

        .active {
          background: var(--active-tab-background);
          color: #fff;
        }
        button {
          background: #fff;
          color: var(--inactive-tab-color);
          border: 1px solid #e1e1e1;
          padding: 10.5px 12px;
          min-width: 85px;

          &:first-child {
            border-top-left-radius: 6px;
            border-bottom-left-radius: 6px;
            border-right: 0px;
          }

          &:last-child {
            border-top-right-radius: 6px;
            border-bottom-right-radius: 6px;
          }
        }
      }
    }

    &-right {
      .add-view-notes {
        background: var(--primary-button-color);
        color: #fff;
        &:hover {
          background: var(--primary-button-hover-color);
        }
      }
    }
  }

  .content {
    padding: 0px !important;

    .heading-container {
      display: none !important;
    }
  }
`;

export const ClientSessionWrapper = styled.div`
  padding: 20px 30px;
  padding-top: 0px;
  @media (max-width: 768px) {
    padding: 20px 16px;
    padding-top: 0px;
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

  .tab-and-heading-container {
    top: 128px !important;
    @media screen and (max-width: 768px) {
      top: 132px !important;
    }
  }

  .tab-container {
    display: flex;
    justify-content: space-between;
    align-items: stretch;
    margin-bottom: 20px;
    gap: 5px;
    @media screen and (max-width: 640px) {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .create-client-mobile-button {
    @media screen and (max-width: 640px) {
      display: none !important;
    }
  }

  .session-create-mobile-button {
    display: none;
    @media screen and (max-width: 640px) {
      display: flex;
      background: var(--primary-button-color);
      border-radius: 8px;
      color: #ffffff;

      &:hover {
        background: var(--primary-button-hover-color);
      }
    }
  }

  .heading-container {
    .heading {
      margin: 0;
    }
    .sub-heading {
      margin: 0;
      @media screen and (max-width: 640px) {
        text-align: center;
      }
    }
  }

  .custom-client-children {
    display: flex;
    width: 100%;
    justify-content: space-between;
  }

  @media only screen and (max-width: 1100px) {
    .heading-container {
      flex-direction: column-reverse !important;
      align-items: flex-start;
      gap: 10px;
    }
  }
`;
