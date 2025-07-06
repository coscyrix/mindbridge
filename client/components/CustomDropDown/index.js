import React from "react";
import {
  CustomDropDownWrapper,
  DropdownButton,
  DropdownItem,
  DropdownMenu,
  Overlay,
} from "./style";
import { useState } from "react";
import { CreateSession } from "../FormLayouts/CreateSessionLayout/style";

function CustomDropDown({
  selectedOption,
  setSelectedOption,
  options,
  customClass,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropDown = () => setIsOpen(false);

  const handleSelect = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
  };

  return (
    <>
      <CreateSession>
        <Overlay
          // onClick={handleClose}
          className={`overlay ${isOpen ? "open" : "closed"}`}
        />
      </CreateSession>
      <CustomDropDownWrapper className={customClass}>
        <DropdownButton onClick={toggleDropdown}>
          {selectedOption}
        </DropdownButton>
        <DropdownMenu isOpen={isOpen}>
          {options?.map((value, index) => (
            <DropdownItem
              key={index}
              onClick={() => handleSelect(value.option)}
            >
              {value.option}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </CustomDropDownWrapper>
    </>
  );
}

export default CustomDropDown;
