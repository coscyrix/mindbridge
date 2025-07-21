import React from "react";
import SearchBar from "./SearchBar";
import { HeroSectionWrapper } from "../style";
import { FeesIcon, NoContractsIcon, ValueIcon } from "../assets/icons";

const HeroSection = () => {
  return (
    <HeroSectionWrapper>
      <div className="features-container">
        <h1>
          We Don&apos;t Lock You In
          {/* <br /> */}
          - You Only Pay When
          {/* <br /> */}
          You Use It.
        </h1>
        <p className="paragraph-heading">
          Forget subscriptions. MindBridge offers counselling management tools
          you pay for only when sessions are completed.
        </p>
        <div className="search-container">
          <h3>Search a Provider</h3>
          <SearchBar />
          <div className="values-container">
            <p className="values-item">
              <NoContractsIcon /> No contracts
            </p>
            <p className="values-item">
              <ValueIcon />
              Just pure value.
            </p>
            <p className="values-item">
              <FeesIcon /> No hidden fees
            </p>
          </div>
        </div>
      </div>
      <div className="image-container" />
    </HeroSectionWrapper>
  );
};

export default HeroSection;
