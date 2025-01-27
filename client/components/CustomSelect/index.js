"use client";
import React, { useState, useRef, useEffect } from "react";
import { CustomSelectContainer } from "./style";

function CustomSelect({
  options,
  value,
  onChange,
  dropdownIcon,
  placeholder = "Select an option",
  isError,
  disable = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const selectedOption = options?.find((option) => option.value === value);

  return (
    <CustomSelectContainer>
      <div
        className={`custom-select ${isError ? "error" : ""} ${
          disable && "disabled"
        }`}
        ref={dropdownRef}
      >
        <div
          className="custom-select__selected"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <span className={`custom-select__heading ${!value && "placeholder"}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <span className={`custom-select__arrow ${isOpen ? "open" : ""}`}>
            {dropdownIcon || <>&#9660;</>}
          </span>
        </div>

        {isOpen && (
          <div className="custom-select__dropdown">
            {options?.map((option, index) => (
              <div
                key={index}
                className={`custom-select__option ${
                  value === option ? "selected" : ""
                }`}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
              >
                {option?.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </CustomSelectContainer>
  );
}

export default CustomSelect;
