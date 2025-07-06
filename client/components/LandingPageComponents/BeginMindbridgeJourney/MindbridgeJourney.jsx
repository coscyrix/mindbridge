import React from "react";

import { MindbridgeJourneyWrapper } from "../style";
import {
  AnalyticsIcon,
  HomeworkIcon,
  LoginIcon,
  SessionTrackingIcon,
} from "../assets/icons";
import CustomButton from "../../CustomButton";
import journeyMainImage from "../assets/images/mindbridge-journey-main-image.jpeg";

const MindbridgeJourney = () => {
  // import { useRouter } from "next/router";
  
  const steps = [
    {
      icon: <LoginIcon />,
      title: "STEP 1",
      description: "Create Your Account",
    },
    {
      icon: <HomeworkIcon />,
      title: "STEP 2",
      description: "Add your clients or import data",
    },
    {
      icon: <SessionTrackingIcon />,
      title: "STEP 3",
      description: "Start logging sessions and sending assessments",
    },
    {
      icon: <AnalyticsIcon />,
      title: "STEP 4",
      description: "Monitor progress and metrics via the dashboard",
    },
  ];

  return (
    <MindbridgeJourneyWrapper>
      <div className="top-content-container">
        <div
          className="text-content-container"
          style={{
            width: "50%",
            display: "flex",
            flexDirection: "column",
            // alignItems: "center",
            justifyContent: "center",
          }}
        >
          <h2 className="mindbridge-heading">
            Start Using MindBridge In
            <br />
            Four Easy Steps
          </h2>
          <p className="mindbridge-description">
            Streamline your practice with a quick setup — from onboarding
            clients
            <br />
            to tracking progress effortlessly.
          </p>
          <CustomButton
          // onClick={handlege}
            title="Get started -pay only when you earn"
            customClass="get-started-button"
          />
        </div>
        <div className="image-container">
          <img
            src={journeyMainImage.src}
            alt="journey-image"
            className="image-placeholder"
          />
        </div>
      </div>

      {/* Steps section */}
      <div className="steps-container">
        {steps.map((step, index) => (
          <div key={index} className="step-item">
            <div className="step-icon-container">{step.icon}</div>
            <h5 className="step-title">{step.title}</h5>
            <p className="step-description">{step.description}</p>
          </div>
        ))}
      </div>
    </MindbridgeJourneyWrapper>
  );
};

export default MindbridgeJourney;
