import styled from "styled-components";

export const InvoiceContainer = styled.div`
  padding: 20px 30px;
  padding-top: 0px;

  @media screen and (max-width: 768px) {
    padding: 20px 16px;
    padding-top: 0px;
  }
  .custom-search-container {
    margin-top: 17px;
  }
  .date-fields {
    width: 100%;
    border: 1px solid #ddd;
    border-radius: 10px;
    background: #ffffff;
    color: #000000;
    padding: 9px 16px;
    font-size: 14px;
    font-weight: 400;
    line-height: 18px;
    margin: 0px;

    &::placeholder {
      color: #000000;
      opacity: 0.2;
    }

    &:focus-visible,
    &:hover {
      outline: 1px solid #1b6bc0;
      box-shadow: 0px 0px 0px 1.9px #1b6bc042 inset;
      box-shadow: 0px 0px 0px 4px #1b6bc030;
    }
  }

  .top-section-wrapper {
    padding-top: 20px;
    // position: sticky;
    top: 60px;
    z-index: 5;
    background: var(--background-color);
    @media screen and (max-width: 768px) {
      top: 64px;
    }
    h1 {
      margin: 0px;
    }
    .modal-buttons {
      display: flex;
      justify-content: space-between;
    }
    .cancel-button,
    .save-button {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      min-width: 107px;
      width: 100%;
      text-align: center;
    }
    .save-button {
      background: var(--primary-button-color) !important;
      color: white;
      &:hover {
        background: var(--primary-button-hover-color);
      }
    }
    .tab-and-search-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-bottom: 10px;
      .tab-container {
        display: flex;
        gap: 8px;
      }
      .search-container {
        display: flex;
        gap: 8px;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 10px;
        @media screen and (max-width: 768px) {
          flex-direction: column;
        }
        .search-and-select {
          display: flex;
          gap: 8px;
          align-items: end;
          .custom-search-container {
            @media screen and (max-width: 768px) {
              display: flex;
              order: 2;
            }
          }

          .custom-select-container {
            display: flex;
            gap: 8px;
            align-items: start;
            .custom-select {
              width: max-content;
              margin-bottom: 0px;
              &__selected {
                border: 1px solid #e1e1e1;
                padding: 9px 12px;
                border-radius: 8px;
                box-shadow: 0px 1px 2px 0px #a4acb933;
              }
            }
            .select-container .multi-select {
              padding-bottom: 0px;
              .select__control {
                padding: 1px 6px;
              }
            }
          }
        }
        .downloads-container {
          display: flex;
          gap: 8px;
          .download-content {
            .dropdown_list-container {
              left: 0;
            }
          }
          .columns-content {
            .dropdown_list-container {
              right: 0;
            }
          }
        }
      }
    }
  }

  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    list-style: none;
    padding: 0;
    li {
      background: transparent;
      border: none;
      border-radius: 6px;
      width: 32px;
      height: 32px;
      padding: 10.5px 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }

    .previous {
      width: unset !important;
      height: unset !important;
      margin-right: auto;
      svg {
        transform: rotate(180deg);
      }
    }
    .next {
      width: unset !important;
      height: unset !important;
      margin-left: auto;
    }

    .active {
      padding: 10.5px 12px;
      border-radius: 6px;
      border: 1px solid #e1e1e1;
      box-shadow: 0px 1px 2px 0px #a4acb933;
      background: var(--secondary-button-color);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2.5px;
      width: max-content;
      position: relative;
      cursor: pointer;
    }
  }
`;

export const ModalButtons = styled.div`
  display: flex;
  justify-content: end;
  gap: 10px;
  margin-top: 35px;

  .cancel-button,
  .save-button {
    padding: 10px 20px;
    border: 1px solid #e1e1e1;
    border-radius: 4px;
    cursor: pointer;
    min-width: 107px;
    width: 100%;
    text-align: center;
  }
  .save-button {
    background: var(--primary-button-color) !important;
    color: white;
    &:hover {
      background: var(--primary-button-hover-color);
    }
  }
`;

export const InvoiceTabWrapper = styled.div`
  .tab-container {
    display: flex;
    gap: 8px;
  }
`;
