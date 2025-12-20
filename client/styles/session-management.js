import styled from "styled-components";

export const SessionManagementContainer = styled.div`
  padding: 20px 30px;

  @media (max-width: 768px) {
    padding: 20px 16px;
  }

  .page-header {
    margin-bottom: 30px;

    h2 {
      margin: 0;
      padding: 0;
      font-size: 24px;
      font-weight: 700;
      color: #333;
    }

    p {
      margin: 0;
      margin-top: 6px;
      color: #666;
      font-size: 14px;
    }

    .helpful-tip {
      margin-top: 12px;
      color: #5B9BD5;
      font-size: 14px;
    }
  }

  .session-info-card {
    background: #fff;
    border-radius: 6px;
    box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.14);
    padding: 20px 30px;
    margin-bottom: 30px;

    @media (max-width: 768px) {
      padding: 20px 16px;
    }

    h3 {
      margin: 0 0 15px 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 12px;
      }

      .info-item {
        strong {
          color: #333;
          font-weight: 600;
        }
        color: #666;
      }
    }
  }

  .sessions-section {
    h3 {
      margin: 0 0 20px 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }

    .no-sessions {
      color: #666;
      font-size: 14px;
      padding: 20px;
      text-align: center;
      background: #fff;
      border-radius: 6px;
      box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.14);
    }
  }
`;

export const SessionCardContainer = styled.div`
  background: #fff;
  border: 1px solid #e1e1e1;
  border-radius: 6px;
  padding: 20px;
  margin-bottom: 15px;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.14);
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.18);
  }

  .session-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;

    @media (max-width: 768px) {
      flex-direction: column;
      align-items: flex-start;
      gap: 15px;
    }

    .session-details {
      flex: 1;

      .session-title {
        font-weight: 600;
        font-size: 16px;
        margin-bottom: 8px;
        color: #333;
      }

      .session-date-time {
        color: #666;
        margin-bottom: 4px;
        font-size: 14px;
      }

      .session-meta {
        display: flex;
        gap: 15px;
        margin-top: 8px;
        font-size: 14px;
        flex-wrap: wrap;

        .meta-item {
          color: #666;
          strong {
            color: #333;
            font-weight: 500;
          }
        }
      }
    }

    .session-actions {
      display: flex;
      gap: 10px;

      @media (max-width: 768px) {
        width: 100%;
        justify-content: flex-end;
      }
    }
  }
`;

export const LoadingContainer = styled.div`
  padding: 40px;
  text-align: center;
  color: #666;
`;

export const ErrorContainer = styled.div`
  padding: 40px;
  text-align: center;

  h2 {
    margin: 0 0 10px 0;
    color: #333;
  }

  p {
    margin: 0;
    color: #666;
  }
`;

