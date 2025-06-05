import React from 'react';
import { TrustAndComplianceSectionWrapper } from '../style';
import { CheckIcon } from '../assets/icons';

const TrustAndComplianceSection = () => {
  return (
    <TrustAndComplianceSectionWrapper>
      <div className="text-content-wrapper">
        <h2 className="trust-section-heading">
          Security & Compliance
          <br />You Can Trust
        </h2>
        <ul className="features-list">
          <li className="feature-item"><CheckIcon/>Encrypted at rest and in transit (TLS 1.2+, AES-256)</li>
          <li className="feature-item"><CheckIcon/>Role-based access, audit logs, and consent tracking</li>
          <li className="feature-item"><CheckIcon/>Hosted on compliant cloud infrastructure (e.g., AWS)</li>
        </ul>
      </div>
    </TrustAndComplianceSectionWrapper>
  );
};

export default TrustAndComplianceSection;
