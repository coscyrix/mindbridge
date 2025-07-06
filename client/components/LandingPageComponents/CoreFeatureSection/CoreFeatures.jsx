import React from "react";
import CoreFeatureCard from "./CoreFeatureCard";
import { CoreFeaturesSectionWrapper } from "../style";
import {
  AnalyticsIcon,
  CheckMessageIcon,
  GoalsIcon,
  HomeworkIcon,
  LandingClientMangementIcon,
  SessionTrackingIcon,
} from "../assets/icons";
import ButtonRow from "../../CustomButton/CustomButtonRow";
import { useRouter } from "next/router";
import ApiConfig from "../../../config/apiConfig";
const CoreFeatures = () => {
  const coreFeaturesData = [
    {
      iconPlaceholder: <CheckMessageIcon />,
      title: "Messaging & E-Consents",
      description: "Confidential, legally compliant communications",
    },
    {
      iconPlaceholder: <AnalyticsIcon />,
      title: "Analytics Dashboard",
      description: "Clear and simple visualization of Assessment results",
    },
    {
      iconPlaceholder: <HomeworkIcon />,
      title: "Homework Assignments",
      description: "Track homework sent and manage assignments with ease",
    },
    {
      iconPlaceholder: <SessionTrackingIcon />,
      title: "Session Tracking",
      description: "Log formats, notes, session times, and progress",
    },
    {
      iconPlaceholder: <GoalsIcon />,
      title: "Goals & Assessments",
      description: "PHQ-9, GAD-7, IPF, GAS, WHODAS, PCL-5",
    },
    {
      iconPlaceholder: <LandingClientMangementIcon />,
      title: "Client Management",
      description: "Intuitive dashboards and secure client records",
    },
  ];
  const router = useRouter();
  const handleGetStarted = (e) => {
    router.push(ApiConfig.getstartedsubmittion.getstarted);
  };

  return (
    <CoreFeaturesSectionWrapper>
      <div className="text-content-container">
        <h2 className="core-features-heading">
          Explore The Core
          <br />
          Features Of MindBridge
        </h2>
        <p className="core-features-description">
          Discover the powerful, secure, and intuitive tools designed to
          simplify mental health care management.
        </p>
        <ButtonRow handleGetStarted={handleGetStarted} marginBottom="0px" />
      </div>
      <div className="cards-grid-container">
        {coreFeaturesData.map((feature, index) => (
          <CoreFeatureCard
            key={index}
            iconPlaceholder={feature.iconPlaceholder}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>
    </CoreFeaturesSectionWrapper>
  );
};

export default CoreFeatures;
