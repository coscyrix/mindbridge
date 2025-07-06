import styled from "styled-components";

export const CardWrapper = styled.div`
  background: #ffffff;
  border: 1px solid #2e2e2e33;
  border-radius: 12px;
  margin-bottom: 20px;
  transition: transform 0.2s ease-in-out;
  box-shadow: 0px 6px 8px 0px #0000000a;
  .card-header {
    display: flex;
    gap: 20px;
    overflow: hidden;
    border-radius: 12px;

    .counselor-image {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      overflow: hidden;

      .image-placeholder {
        width: 100%;
        height: 100%;
        background-color: #3973b7;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        font-weight: 600;
      }
    }

    .counselor-info {
      flex: 1;
      padding: 20px 0px;

      .counselor-name {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: #2e2e2e;
        margin-bottom: 4px;
        text-transform: capitalize;
      }

      .counselor-speciality {
        margin: 0;
        font-size: 0.875rem;
        color: #666;
        margin-bottom: 8px;
      }

      .rating-container {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 6px;

        .stars {
          display: flex;
          gap: 2px;

          svg {
            width: 16px;
            height: 16px;
            color: #ddd;

            &.filled {
              color: #ffc107;
            }
          }
        }

        .reviews {
          font-size: 0.875rem;
          color: #666;
        }
      }

      .info-row {
        display: flex;
        margin-bottom: 12px;
        gap: 8px;

        .value {
          font-size: 0.875rem;
          color: #2e2e2e;
          margin: 0px;
        }

        .services-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;

          .service-tag {
            background-color: #f0f7ff;
            color: #3973b7;
            padding: 4px 12px;
            border-radius: 16px;
            font-size: 0.75rem;
          }
        }
      }
    }
  }

  .card-body {
    border-top: 1px solid #2e2e2e1a;
    margin-top: 14px;

    .services-list {
      padding-top: 15px;
      justify-content: space-between;
      align-items: start;
      gap: 5px;
    }
    .servicesDetails {
      h6 {
        margin: 0px;
        font-size: 14px;
        font-weight: 600;
        color: #2e2e2e;
        padding-bottom: 6px;
      }
      p {
        font-size: 12px;
        font-weight: 500;
        color: #767676;
        margin: 0px;
      }
      div {
        display: flex;
        gap: 4px;
      }
    }
    .availabilityWrapper {
      min-width: 100px;
      h6 {
        margin: 0px;
        font-size: 14px;
        font-weight: 600;
        color: #2e2e2e;
        padding-bottom: 6px;
      }
      p,
      span {
        background-color: #3973b72e;
        border-radius: 20px;
        font-size: 10px;
        font-weight: 600;
        color: #3973b7;
        margin: 0px;
        display: flex;
        justify-content: center;
        padding: 2px 7px;
      }
      div {
        display: flex;
        gap: 4px;
        align-items: center;
        flex-wrap: wrap;
      }
    }
  }
  .card-footer {
    padding: 40px;
    background-color: #f8f6f0;
    display: flex;
    flex-direction: column;
    width: 25%;
    max-width: 400px;
    border-radius: 12px;
    align-items: flex-end;
    gap: 16px;
    word-wrap: break-word; 
    overflow-wrap: break-word;
  }

  .cardImageFooter {
    width: 40px;
    margin-bottom: 8px;
  }

  .availability {
    width: 100%;
    text-align: right;
  }

  .availability .label {
    font-size: 12px;
    font-weight: 600;
    color: #767676;
    margin: 0 0 4px;
    text-transform: uppercase;
  }

  .availability .time p {
    font-size: 14px;
    font-weight: 500;
    color: #2a5dab;
    margin: 0;
    line-height: 1.5;
  }

  .book-button {
    padding: 10px 20px;
    background-color: #3973b7;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    width: 100%;
    transition: all 0.3s ease;
    box-shadow: 0 2px 6px rgba(57, 115, 183, 0.4);
  }

  .book-button:hover {
    background-color: #2c5c94;
  }

  @media (max-width: 768px) {
    .card-footer {
      width: 100%;
      padding: 12px;
      align-items: stretch;
    }

    .book-button {
      width: 100%;
    }
  }
`;
