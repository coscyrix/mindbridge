import React from "react";
import { TableHeadingTabsContainer } from "./style";
import { useState } from "react";
function TableHeadingTabs({ tabLabels }) {
  const [activeTab, setActiveTab] = useState(0);
  const handleTabChange = (index) => {
    setActiveTab(index);
  };

  return (
    <TableHeadingTabsContainer>
      <div className="heading-container">
        <div className="tab">
          {tabLabels.map((tab, index) => (
            <button
              key={index}
              className={`${activeTab === index ? "active" : ""}`}
              onClick={() => handleTabChange(index)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
    </TableHeadingTabsContainer>
  );
}

export default TableHeadingTabs;
