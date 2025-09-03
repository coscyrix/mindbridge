import styled from "styled-components";

export const CardWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  background: #ffffff;
  border: 1px solid #e1e1e1;
  border-radius: 16px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  gap: 20px;
  // padding: 20px;
  margin-bottom: 20px;
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: translateY(-2px);
  }

  .card-left {
    flex: 0 0 220px;
    display: flex;
    align-items: center;
    justify-content: center;

    .counselor-photo {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 12px;
    }
  }

  .card-center {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 20px;

    .rating-row {
      display: flex;
      align-items: center;
      gap: 10px;

      .stars {
        display: flex;
        gap: 2px;
        svg {
          width: 18px;
          height: 100%;
          color: #ddd;
          &.filled {
            color: #ffc107;
          }
        }
      }

      .reviews {
        font-size: 0.9rem;
        color: #555;
      }
    }

    .counselor-name {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0;
      color: #2e2e2e;
    }

    .counselor-speciality {
      font-size: 0.95rem;
      color: #777;
      margin-bottom: 8px;
    }

    .info-row {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.9rem;
      color: #333;
    }

    .servicesDetails {
      margin-top: 12px;
      h6 {
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 6px;
      }
      span {
        font-size: 13px;
        color: #3973b7;
        font-weight: 500;
      }
    }

    .availabilityWrapper {
      margin-top: 12px;
      h6 {
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 6px;
      }
      div {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      span {
        background: #eaf3ff;
        color: #3973b7;
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
      }
    }
  }

  .card-right {
    flex: 0 0 240px;
    background: #f8f6f0;
    border-radius: 12px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    align-items: flex-end;
    justify-content: space-between;

    .cardImageFooter {
      width: 40px;
    }

    .availability {
      width: 100%;
      text-align: right;
      .label {
        font-size: 12px;
        font-weight: 600;
        color: #777;
        margin-bottom: 4px;
        text-transform: uppercase;
      }
      .time p {
        font-size: 13px;
        font-weight: 500;
        color: #2a5dab;
        margin: 0;
      }
    }

    .book-button {
      padding: 10px 20px;
      background: #3973b7;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: 0.3s ease;
      width: 100%;
    }
    .book-button:hover {
      background: #2c5c94;
    }
  }

  /* Responsive Design */
  @media (max-width: 1024px) {
    flex-direction: column;
    .card-left {
      flex: unset;
      .counselor-photo {
        height: 100%;
      }
    }
    .card-right {
      width: 100%;
      align-items: stretch;
      text-align: left;
    }
  }

  @media (max-width: 600px) {
    padding: 15px;
    gap: 15px;

    .card-left .counselor-photo {
      height: 100%;
    }

    .card-center .counselor-name {
      font-size: 1.1rem;
    }

    .card-right {
      padding: 15px;
    }
  }
`;
