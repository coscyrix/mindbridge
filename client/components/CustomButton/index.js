import React, { useState, useRef, useEffect } from "react";
import { CustomButtonContainer, DropdownContainer } from "./style";
import { ClosedEyeIcon, OpenEyeIcon } from "../../public/assets/icons";

const CustomButton = ({
  onClick,
  title,
  icon,
  customClass = "",
  dropdownOptions = [],
  renderFooter = null, // Additional prop for custom footer (e.g., Reset and Show All Columns)
  ...props
}) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleButtonClick = () => {
    if (dropdownOptions.length > 0) {
      setDropdownOpen(!isDropdownOpen);
    } else if (onClick) {
      onClick();
    }
  };

  const handleOptionClick = (optionOnClick) => {
    if (title != "Columns" && optionOnClick) {
      setDropdownOpen(false);
      optionOnClick();
    } else {
      optionOnClick();
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <CustomButtonContainer ref={dropdownRef}>
      <button onClick={handleButtonClick} className={customClass} {...props}>
        {title !== "Next" && icon}
        <span>{title}</span>
        {title === "Next" && icon}
      </button>
      {dropdownOptions.length > 0 && isDropdownOpen && (
        <DropdownContainer className="dropdown_list-container">
          {dropdownOptions.map((dropdown, dropdownIndex) => (
            <div key={dropdownIndex} className="dropdown-section">
              {/* Render the heading */}
              {dropdown.heading && (
                <h3
                  className={`${
                    dropdownIndex ? "dropdown-heading" : "top-dropdown-heading"
                  }`}
                >
                  {dropdown.heading}
                </h3>
              )}

              {/* Render subHeadings with toggle icons */}
              {dropdown.subHeadings && dropdown.subHeadings.length > 0 && (
                <div className="dropdown-sub-options">
                  {dropdown.subHeadings.map((option, optionIndex) => (
                    <div
                      key={optionIndex}
                      className="dropdown-option"
                      onClick={() => handleOptionClick(option.onClick)}
                    >
                      <div className="option-wrapper">
                        {option.icon && (
                          <span className="option-icon">{option.icon}</span>
                        )}
                        <span className="option-title">{option.name}</span>
                      </div>
                      {option.toggleIcon && (
                        <span className="toggle-icon">
                          {!option?.omit ? <OpenEyeIcon /> : <ClosedEyeIcon />}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Optional footer section (e.g., Reset or Show All Columns) */}
          {renderFooter && (
            <div className="dropdown-footer">{renderFooter()}</div>
          )}
        </DropdownContainer>
      )}
    </CustomButtonContainer>
  );
};

export default CustomButton;
