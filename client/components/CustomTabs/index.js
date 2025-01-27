import React, { useState } from "react";
import { TabButton, TabList } from "./style";

const CustomTabs = ({ tabs, onTabChange }) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabClick = (index) => {
    setActiveTab(index);
    if (onTabChange) onTabChange(index); // Notify parent of the active tab change
  };

  return (
    <TabList>
      {tabs?.map((tab, index) => (
        <TabButton
          key={index}
          isActive={activeTab === index}
          onClick={() => handleTabClick(index)}
        >
          {tab}
        </TabButton>
      ))}
    </TabList>
  );
};

export default CustomTabs;
