import styled from "styled-components";

export const SearchListingWrapper = styled.div`
  min-height: 100vh;
  /* background-color: #f8f9fa; */

  @media (max-width: 768px) {
    padding: 20px 16px;
  }

  .search-section {
    display: flex;
    justify-content: center;
    width: 100%;
    border-bottom: 1px solid #2e2e2e1a;
    padding-bottom: 18px;
    padding-top: 18px;
    margin-bottom: 34px;

    .search-container {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;

      .search-input-wrapper {
        position: relative;
        flex: 0 0 350px;

        input {
          width: 100%;
          padding: 0px 0px 0px 16px;
          height: 50px;
          border: 1px solid #2e2e2e33;
          border-radius: 8px;
          font-size: 0.875rem;
          outline: none;

          &:focus {
            border-color: #3973b7;
          }
        }

        .search-icon-button {
          position: absolute;
          right: 0px;
          top: 50%;
          height: 50px;
          padding: 0px 15px;
          border-top-right-radius: 8px;
          border-bottom-right-radius: 8px;
          transform: translateY(-50%);
          background: #2e2e2e;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;

          svg {
            width: 20px;
            height: 20px;
            color: #666;
          }
        }
      }

      .filters-wrapper {
        flex: 1;
        display: flex;
        gap: 16px;
        align-items: center;
        flex-wrap: wrap;

        .filter-item {
          border: 1px solid #2e2e2e33;
          position: relative;
          display: flex;
          align-items: center;
          gap: 8px;
          background: white;
          padding: 12px 12px;
          border-radius: 8px;
          min-width: 180px;

          svg,
          img {
            width: 20px;
            height: 20px;
            color: #3973b7;
          }

          select {
            width: 100%;
            border: none;
            background: none;
            font-size: 0.875rem;
            color: #2e2e2e;
            cursor: pointer;
            outline: none;
            padding-right: 24px;
            appearance: none;
            background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
            background-repeat: no-repeat;
            background-position: right 0px center;
            background-size: 16px;
          }
        }

        .searchButtonHeader {
          display: flex;
          justify-content: center;
          gap: 10px;
          align-items: center;
          background-color: #2e2e2e;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          padding: 10px 16px;

          .search-button {
            background-color: #2e2e2e;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.875rem;
            font-weight: 500;
            white-space: nowrap;
          }
        }
      }
    }
  }

  .results-section {
    display: flex;
    gap: 24px;
    background-color: #f8f8f8;
    padding: 0px 60px;

    .filters-section {
      width: 25%;
      min-width: 280px;
      background: white;
      border-radius: 12px;
      padding: 24px;
      height: fit-content;

      h3 {
        font-size: 1.125rem;
        font-weight: 600;
        color: #2e2e2e;
        margin: 0 0 16px 0;
      }

      .search-by-name {
        margin-bottom: 32px;

        .search-input-wrapper {
          display: flex;
          gap: 8px;

          input {
            flex: 1;
            padding: 8px 12px;
            border: 1px solid #2e2e2e33;
            border-radius: 4px;
            font-size: 0.875rem;

            &:focus {
              outline: none;
              border-color: #3973b7;
            }
          }

          button {
            padding: 8px 16px;
            background: #3973b7;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.875rem;

            &:hover {
              background: #2c5c94;
            }
          }
        }
      }

      .price-range {
        margin-bottom: 32px;

        .wrapperRange {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .price-display {
          color: #3973b7;
          font-weight: 500;
          margin-bottom: 16px;
        }

        .price-inputs {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;

          .input-group {
            flex: 1;

            label {
              display: block;
              font-size: 0.875rem;
              color: #666;
              margin-bottom: 4px;
            }

            .price-input {
              display: flex;
              align-items: center;
              border: 1px solid #2e2e2e33;
              border-radius: 4px;
              padding: 4px 8px;

              span {
                color: #666;
                margin-right: 4px;
              }

              input {
                width: 100%;
                border: none;
                outline: none;
                font-size: 0.875rem;
              }
            }
          }

          .separator {
            color: #666;
          }
        }

        .price-slider {
          position: relative;
          height: 4px;
          background: #e0e0e0;
          border-radius: 2px;
          margin: 20px 0;

          input[type="range"] {
            position: absolute;
            width: 100%;
            height: 4px;
            background: none;
            pointer-events: none;
            -webkit-appearance: none;

            &::-webkit-slider-thumb {
              -webkit-appearance: none;
              width: 16px;
              height: 16px;
              border-radius: 50%;
              background: #3973b7;
              cursor: pointer;
              pointer-events: auto;
              margin-top: -6px;
            }
          }
        }
      }

      .categories {
        .categories-list {
          display: flex;
          flex-direction: column;
          gap: 12px;

          .category-checkbox {
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;

            input[type="checkbox"] {
              width: 16px;
              height: 16px;
              border: 1px solid #2e2e2e33;
              border-radius: 3px;
              cursor: pointer;
            }

            span {
              font-size: 0.875rem;
              color: #2e2e2e;
            }
          }
        }
      }
    }

    .wrapperCardShow {
      width: 75%;
    }
  }

  @media (max-width: 768px) {
    .search-section {
      .search-container {
        flex-direction: column;

        .search-input-wrapper {
          flex: none;
          width: 100%;
        }

        .filters-wrapper {
          flex-direction: column;

          .filter-item {
            width: 100%;
          }

          .search-button {
            width: 100%;
          }
        }
      }
    }

    .results-section {
      flex-direction: column;

      .filters-section,
      .wrapperCardShow {
        width: 100%;
      }
    }
  }
`;
