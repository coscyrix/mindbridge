import React from 'react';
import Header from './Header';
import HeroSection from './HeroSection/HeroSection';
import FeaturesAndReportSection from './FeaturesAndReportSection';
import HelpSection from './HelpSection';
import CoreFeatures from './CoreFeatureSection/CoreFeatures';
import WorkFlowSection from './WorkflowSection/WorkFlowSection';
import TrustAndComplianceSection from './TrustAndCompliance/TrustAndComplianceSection';
import EmpoweringMentalHealth from './EmpoweringMentalHealth/EmpoweringMentalHealth';
import MindbridgeJourney from './BeginMindbridgeJourney/MindbridgeJourney';
import Footer from './Footer';
import { LandingPageWrapper } from './style';
import LandingPageLayout from './LandingPageLayout';

const LandingPage = () => {
  return (
    <LandingPageWrapper>
      <HeroSection />
      <FeaturesAndReportSection />
      <HelpSection />
      <CoreFeatures />
      <TrustAndComplianceSection />
      <EmpoweringMentalHealth />
      <WorkFlowSection />
      <MindbridgeJourney />
      </LandingPageWrapper>
  );
};

export default LandingPage; 