import React from "react";
import { CustomTabContainer } from "./style";

function CustomTab({ heading, value, lines = [] }) {
  return (
    <CustomTabContainer>
      {(heading || value) && (
        <div className="tab-headline">
          {heading && <p className="heading">{heading}</p>}
          {value && <p className="value">{value}</p>}
        </div>
      )}

      {Array.isArray(lines) && lines.length > 0 && (
        <div className="tab-lines">
          {lines.map((line, index) => (
            <p key={index} className="line">
              {line}
            </p>
          ))}
        </div>
      )}
    </CustomTabContainer>
  );
}

export default CustomTab;
