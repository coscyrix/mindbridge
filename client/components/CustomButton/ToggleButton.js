import React from "react";
import styled from "styled-components";

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content:space-between;
  gap: 12px;
`;

const SwitchWrapper = styled.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
`;

const HiddenCheckbox = styled.input.attrs({ type: "checkbox" })`
  opacity: 0;
  width: 0;
  height: 0;
`;

const Slider = styled.span`
  position: absolute;
  cursor: pointer;
  background-color: #ccc;
  border-radius: 34px;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  transition: 0.4s;
  min-width: 50px;
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
  background-color: #4caf50;
  min-width: 50px;

  &::before {
    transform: translateX(24px);
  }
`;

const ToggleSwitch = ({ title = "", isOn, onToggle }) => {
  return (
    <ToggleContainer>
      <span>{title}</span>
      <SwitchWrapper>
        <HiddenCheckbox
          checked={isOn}
          onChange={(e) => onToggle(e.target.checked)}
        />
        {isOn ? <CheckedSlider /> : <Slider />}
      </SwitchWrapper>
    </ToggleContainer>
  );
};

export default ToggleSwitch;
