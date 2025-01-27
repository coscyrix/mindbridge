import React from "react";
import { TooltipButtonWrapper, TooltipWrapper } from "./style";

export const TooltipContainer = ({ children }) => {
  return <TooltipWrapper>{children}</TooltipWrapper>;
};

export const TooltipButton = ({ title, icon, onClick, color }) => {
  return (
    <TooltipButtonWrapper>
      <div className="option-wrapper">
        {icon && <span className="option-icon">{icon}</span>}
        <span style={{ color: color }} className="option-title">
          {title}
        </span>
      </div>
    </TooltipButtonWrapper>
  );
};
