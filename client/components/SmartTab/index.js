import React, { useState } from "react";
import { SmartTabWrapper } from "./style";
const SmartTab = ({ tabLabels, handleFilterData }) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (tab) => {
    setActiveTab(tab?.id);
    handleFilterData();
  };
  return (
    <SmartTabWrapper>
      <div className="tab">
        {tabLabels.map((tab, index) => (
          <button
            key={index}
            className={`${activeTab === index ? "active" : ""}`}
            onClick={() => handleTabChange(tab)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </SmartTabWrapper>
  );
};

export default SmartTab;
