import React, { forwardRef, useState, useRef } from "react";
import ReactDOM from "react-dom";
import { DeleteIcon, EditIcon, MenuIcon } from "../../public/assets/icons";
import { TooltipButton, TooltipContainer } from "../Tooltip/index";

const Dropdown = forwardRef(
  ({ row, handleCellClick, handleEdit, handleDelete, index }, ref) => {
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
    const buttonRef = useRef(null);

    const handleClick = (e) => {
      e.stopPropagation();
      
      // Calculate position relative to the button
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + 5, // 5px below the button
          right: window.innerWidth - rect.right // align to right edge of button
        });
      }
      
      handleCellClick(row, index);
    };

    return (
      <div style={{ position: "relative", overflow: "visible" }}>
        <div
          ref={buttonRef}
          onClick={handleClick}
        >
          <MenuIcon />
        </div>
        {row.active && typeof window !== 'undefined' && ReactDOM.createPortal(
          <div ref={ref} style={{ 
            position: 'fixed', 
            top: `${dropdownPosition.top}px`, 
            right: `${dropdownPosition.right}px`,
            zIndex: 99999,
            minWidth: '120px',
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>

            <TooltipContainer>
              <div
                onClick={(e) => {
                  handleCellClick(row, index);
                  handleEdit(row, index);
                }}
              >
                <TooltipButton color="#000" title="Edit" icon={<EditIcon />} />
              </div>
              {!row?.has_schedule && (
                <div
                  onClick={(e) => {
                    handleDelete(row, index);
                  }}
                >
                  <TooltipButton
                    title="Delete"
                    icon={<DeleteIcon />}
                    color="#d30028"
                  />
                </div>
              )}
            </TooltipContainer>
          </div>,
          document.body
        )}
      </div>
    );
  }
);

Dropdown.displayName = "ActionDropdown";

export default Dropdown;
