import React from 'react';
import { EmpoweringSectionWrapper } from '../style';
import CustomButton from '../../CustomButton';
import { IndividualTherapistIcon, GroupPracticeIcon, ClinicHospitalIcon } from '../assets/icons';

const EmpoweringSection = () => {
  return (
    <EmpoweringSectionWrapper>
      <div className="text-content-container">
        <h2 className="empowering-heading">
          Empowering Mental Health Providers
        </h2>
        <p className="empowering-description">
          MindBridge offers a robust suite of tools designed to streamline your practice, enhance client engagement, and improve treatment outcomes.
        </p>
        <CustomButton customClass="get-started-button" title="Get Started Free →"/>
      </div>
      <div className="provider-types-grid">
        <div className="provider-type-item">
          <div className="provider-type-icon"><IndividualTherapistIcon/></div>
          <div className="provider-type-text">
            <h4 className="provider-type-title">Individual Therapists</h4>
            <p className="provider-type-description">Manage your solo practice with intuitive tools for scheduling, notes, and billing.</p>
          </div>
        </div>
        <div className="provider-type-item">
          <div className="provider-type-icon"><GroupPracticeIcon/></div>
          <div className="provider-type-text">
            <h4 className="provider-type-title">Group Practices</h4>
            <p className="provider-type-description">Collaborate seamlessly with shared client records and integrated communication tools.</p>
          </div>
        </div>
        <div className="provider-type-item">
          <div className="provider-type-icon"><ClinicHospitalIcon/></div>
          <div className="provider-type-text">
            <h4 className="provider-type-title">Clinics & Hospitals</h4>
            <p className="provider-type-description">Securely manage large client bases with advanced compliance and reporting features.</p>
          </div>
        </div>
      </div>
    </EmpoweringSectionWrapper>
  );
};

export default EmpoweringSection; 