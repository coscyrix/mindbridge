import React from "react";
import { HelpSectionWrapper } from "./style";
import CustomButton from "../CustomButton";

const HelpSection = () => {
  const Behavioral_Health = process.env.NEXT_PUBLIC_BEHAVIORAL_HEALTH;
  const Digital_Health_HealthTech =
    process.env.NEXT_PUBLIC_DIGITAL_HEALTH_HEALTHTECH;
  const Telehealth_Teletherapy = process.env.NEXT_PUBLIC_TELEHEALTH_TELETHERAPY;
  const Practice_Management = process.env.NEXT_PUBLIC_PRACTICE_MANAGEMENT;
  const Client_Engagement_Communication =
    process.env.NEXT_PUBLIC_CLIENT_ENGAGEMENT_COMMUNICATION;
  const Clinical_Documentation_EHR =
    process.env.NEXT_PUBLIC_CLINICAL_DOCUMENTATION_EHR;
  return (
    <HelpSectionWrapper>
      <h2 className="help-heading">Find The Help You Need Today</h2>
      <p className="help-description">
        Pick a topic below that you&apos;d like to explore:
      </p>
      <div className="buttons-container">
        <a href={Behavioral_Health} download>
          <CustomButton
            customClass="topic-button"
            title="Behavioral Health →"
          />
        </a>

        <a href={Digital_Health_HealthTech} download>
          <CustomButton
            customClass="topic-button"
            title="Digital Health / HealthTech →"
          />
        </a>

        <a href={Telehealth_Teletherapy} download>
          <CustomButton
            customClass="topic-button"
            title="Telehealth / Teletherapy →"
          />
        </a>

        <a href={Practice_Management} download>
          <CustomButton
            customClass="topic-button"
            title="Practice Management →"
          />
        </a>

        <a href={Client_Engagement_Communication} download>
          <CustomButton
            customClass="topic-button"
            title="Client Engagement & Communication →"
          />
        </a>

        <a href={Clinical_Documentation_EHR} download>
          <CustomButton
            customClass="topic-button"
            title="Clinical Documentation & EHR →"
          />
        </a>
      </div>
    </HelpSectionWrapper>
  );
};

export default HelpSection;
