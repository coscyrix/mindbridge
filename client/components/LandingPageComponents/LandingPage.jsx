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

const LandingPage = () => {
  return (
    <LandingPageWrapper>
      <Header />
      <HeroSection />
      <FeaturesAndReportSection />
      <HelpSection />
      <CoreFeatures />
      <TrustAndComplianceSection />
      <EmpoweringMentalHealth />
      <WorkFlowSection />
      <MindbridgeJourney />
      <Footer />
    </LandingPageWrapper>
  );
};

export default LandingPage; 