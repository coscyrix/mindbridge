import React, { useState } from "react";
import { SmartTabWrapper } from "./style";
const SmartTab = ({
  tabLabels,
  handleFilterData,
  activeTab,
  setActiveTab,
  selectCounselor,
}) => {
  const handleTabChange = (tab) => {
    setActiveTab(tab?.id);
    handleFilterData(tab);
  };
  return (
    <SmartTabWrapper>
      <div className="tab">
        {tabLabels.map((tab, index) => {
          const isDisabled =
            selectCounselor && selectCounselor !== "allCounselors";
          return (
            <button
              key={index}
              className={`${activeTab === index ? "active" : ""}`}
              onClick={() => handleTabChange(tab)}
              disabled={
                selectCounselor && selectCounselor !== "allCounselors"
                  ? true
                  : false
              }
              style={{
                opacity: isDisabled && index > 0 ? 0.5 : 1,
                cursor: isDisabled && index > 0 ? "not-allowed" : "pointer",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </SmartTabWrapper>
  );
};

export default SmartTab;
