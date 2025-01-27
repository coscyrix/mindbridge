import React, { forwardRef } from "react";
import { DeleteIcon, EditIcon, MenuIcon } from "../../public/assets/icons";
import { TooltipButton, TooltipContainer } from "../Tooltip/index";

const Dropdown = forwardRef(
  ({ row, handleCellClick, handleEdit, handleDelete, index }, ref) => {
    return (
      <div style={{ position: "relative" }}>
        <div
          onClick={(e) => {
            e.stopPropagation();
            handleCellClick(row, index);
          }}
        >
          <MenuIcon />
        </div>
        {row.active && (
          <div ref={ref}>
            <TooltipContainer>
              <div
                onClick={(e) => {
                  handleCellClick(row, index);
                  handleEdit(row, index);
                }}
              >
                <TooltipButton color="#000" title="Edit" icon={<EditIcon />} />
              </div>
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
            </TooltipContainer>
          </div>
        )}
      </div>
    );
  }
);

Dropdown.displayName = "ActionDropdown";

export default Dropdown;
