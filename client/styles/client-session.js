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

export const AbsenceModalWrapper = styled.div`
  padding: 0;
  width: 100%;

  .modal-content {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .date-field {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 24px;

    label {
      font-size: 14px;
      font-weight: 500;
      color: #000000;
      margin-bottom: 0;
    }

    .date-picker-wrapper {
      width: 100%;
      
      .react-datepicker-wrapper {
        width: 100%;
        
        input {
          width: 100%;
          height: 44px;
          padding: 11px 16px;
          border: 1px solid #e1e1e1;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 400;
          color: #000000;
          background: #ffffff;
          box-shadow: 0px 1px 2px 0px #a4acb933;
          transition: all 0.2s ease;
          outline: none;
          box-sizing: border-box;

          &::placeholder {
            color: #000000;
            opacity: 0.3;
          }

          &:focus,
          &:hover {
            border-color: #1b6bc0;
            box-shadow: 0px 0px 0px 1.9px #1b6bc042 inset,
                        0px 0px 0px 4px #1b6bc030;
            outline: none;
          }

          &:disabled {
            background-color: #f5f5f5;
            cursor: not-allowed;
            opacity: 0.6;
          }
        }
      }
    }
  }

  .date-range-info {
    margin-top: -8px;
    margin-bottom: 8px;
    padding: 10px 12px;
    background-color: #f8f9fa;
    border: 1px solid #e1e1e1;
    border-radius: 6px;
    font-size: 12px;
    color: #6b7280;
    
    &.date-range-warning {
      background-color: #fff3cd;
      border-color: #ffc107;
      color: #856404;
    }
    
    .info-text {
      display: flex;
      align-items: center;
      gap: 6px;
      margin: 0;
    }
  }

  .button-group {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 8px;
    padding-top: 20px;
    border-top: 1px solid #e1e1e1;

    @media screen and (max-width: 480px) {
      flex-direction: column-reverse;
      
      button {
        width: 100%;
      }
    }
  }

  .cancel-button {
    padding: 10px 20px;
    border: 1px solid #e1e1e1;
    border-radius: 6px;
    background: #ffffff;
    color: #374151;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 107px;
    box-shadow: 0px 1px 2px 0px #a4acb933;

    &:hover {
      background: #f9fafb;
      border-color: #d1d5db;
    }

    &:active {
      transform: scale(0.98);
    }
  }

  .submit-button {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    background: var(--primary-button-color, #1b6bc0);
    color: #ffffff;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 107px;
    box-shadow: 0px 1px 2px 0px #a4acb933;

    &:hover {
      background: var(--primary-button-hover-color, #155a9e);
      box-shadow: 0px 2px 4px 0px #a4acb966;
    }

    &:active {
      transform: scale(0.98);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      background: #9ca3af;
    }
  }
`;
