import React from "react";
import { CustomTabContainer } from "./style";
function CustomTab({ heading, value }) {
  return (
    <CustomTabContainer>
      <p className="heading">{heading}</p>
      <p className="value">{value}</p>
    </CustomTabContainer>
  );
}

export default CustomTab;
