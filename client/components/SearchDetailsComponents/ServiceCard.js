import React from "react";
import styled from "styled-components";

const ServiceCard = ({ service }) => {
  return (
    <CardWrapper>
      <div className="service-icon">
        <img src="/assets/images/hospitalImage.png" alt="Hospital" />
      </div>
      <div className="service-content">
        <h3>{service.name}</h3>
        <div className="service-details">
          <div className="detail-row">
            <span className="label">Service Category</span>
            <span className="value">{service.category}</span>
          </div>
          <div className="detail-row">
            <span className="label">Service Type</span>
            <span className="value">{service.type}</span>
          </div>
          <div className="detail-row">
            <span className="label">Service Code(USD)</span>
            <span className="value">{service.code}</span>
          </div>
          <div className="detail-row price">
            <span className="label">Zimbabwe Dollar (ZIG)</span>
            <span className="value">{service.price}</span>
          </div>
        </div>
      </div>
    </CardWrapper>
  );
};

const CardWrapper = styled.div`
  background: white;
  border: 1px solid #2e2e2e33;
  border-radius: 12px;
  padding: 16px;
  transition: all 0.3s ease;
  box-shadow: 0px 6px 8px 0px #0000000a;
  width: 100%;

  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  .service-icon {
    width: 48px;
    height: 48px;
    margin-bottom: 16px;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  .service-content {
    h3 {
      margin: 0 0 16px 0;
      font-size: 18px;
      color: #333;
    }

    .service-details {
      .detail-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;

        &:last-child {
          border-bottom: none;
        }

        &.price {
          margin-top: 8px;
          padding-top: 12px;

          .value {
            color: #1a73e8;
            font-weight: 600;
            font-size: 16px;
          }
        }

        .label {
          color: #666;
          font-size: 14px;
        }

        .value {
          color: #333;
          font-weight: 500;
        }
      }
    }
  }
`;

export default ServiceCard;
