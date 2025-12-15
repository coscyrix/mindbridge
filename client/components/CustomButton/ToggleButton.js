import React from "react";
import styled from "styled-components";

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content:space-between;
  gap: 12px;
  opacity: ${props => props.disabled ? 0.6 : 1};
  pointer-events: ${props => props.disabled ? 'none' : 'auto'};
`;

const SwitchWrapper = styled.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
`;

const HiddenCheckbox = styled.input.attrs({ type: "checkbox" })`
  opacity: 0;
  width: 0;
  height: 0;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
`;

const Slider = styled.span`
  position: absolute;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  background-color: #ccc;
  border-radius: 34px;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  transition: 0.4s;
  min-width: 50px;
  opacity: ${props => props.disabled ? 0.5 : 1};
  &::before {
    content: "";
    height: 20px;
    width: 20px;
    position: absolute;
    left: 3px;
    bottom: 3px;
    background-color: white;
    border-radius: 50%;
    transition: 0.4s;
  }
`;

const CheckedSlider = styled(Slider)`
  background-color: ${props => props.isBlue ? 'var(--primary-button-color, #1b6bc0)' : '#4caf50'};
  min-width: 50px;

  &::before {
    transform: translateX(24px);
  }
`;

const ToggleSwitch = ({ title = "", isOn, onToggle, disabled = false, isBlue = false }) => {
  const handleToggle = (checked) => {
    if (!disabled && onToggle) {
      onToggle(checked);
    }
  };

  return (
    <ToggleContainer disabled={disabled}>
      <span>{title}</span>
      <SwitchWrapper disabled={disabled}>
        <HiddenCheckbox
          checked={isOn}
          disabled={disabled}
          onChange={(e) => handleToggle(e.target.checked)}
        />
        {isOn ? <CheckedSlider disabled={disabled} isBlue={isBlue} /> : <Slider disabled={disabled} />}
      </SwitchWrapper>
    </ToggleContainer>
  );
};

export default ToggleSwitch;
