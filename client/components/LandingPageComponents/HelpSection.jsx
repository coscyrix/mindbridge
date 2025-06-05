import React from "react";
import { HelpSectionWrapper } from "./style";
import CustomButton from "../CustomButton";

const HelpSection = () => {
  return (
    <HelpSectionWrapper>
      <h2 className="help-heading">Find The Help You Need Today</h2>
      <p className="help-description">
        Pick a topic below that you&apos;d like to explore:
      </p>
      <div className="buttons-container">
        <CustomButton
          customClass="topic-button"
          title="Behavioral Health →"
        ></CustomButton>
        <CustomButton
          customClass="topic-button"
          title="Digital Health / HealthTech →"
        ></CustomButton>
        <CustomButton
          customClass="topic-button"
          title="Telehealth / Teletherapy →"
        ></CustomButton>
        <CustomButton
          customClass="topic-button"
          title="Practice Management →"
        ></CustomButton>
        <CustomButton
          customClass="topic-button"
          title="Client Engagement & Communication →"
        ></CustomButton>
        <CustomButton
          customClass="topic-button"
          title="Clinical Documentation & EHR →"
        ></CustomButton>
      </div>
    </HelpSectionWrapper>
  );
};

export default HelpSection;
