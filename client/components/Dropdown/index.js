import React, { forwardRef, useState, useRef } from "react";
import ReactDOM from "react-dom";
import { DeleteIcon, EditIcon, MenuIcon, LockIcon, UnlockIcon } from "../../public/assets/icons";
import { TooltipButton, TooltipContainer } from "../Tooltip/index";

const Dropdown = forwardRef(
  ({ 
    row, 
    handleCellClick, 
    handleEdit, 
    handleDelete, 
    handleActivate,
    handleDeactivate,
    index,
    showActivationActions = false,
    userRoleId,
    currentUserId
  }, ref) => {
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

    // Check if user is tenant or admin
    const isTenantOrAdmin = [3, 4].includes(userRoleId);
    // Check if this is a counselor or tenant row
    const isCounselorOrTenant = row?.role_id === 2 || row?.role_id === 3;
    // Determine if account is activated (use isActivated key from backend)
    const isActivated = !!row?.isActivated;
    
    // Check if current user is a tenant
    const isCurrentUserTenant = userRoleId === 3;
    // Check if this row is a tenant (fellow tenant)
    const isRowTenant = row?.role_id === 3;
    // Check if this row is the current user themselves
    const isCurrentUser = currentUserId && (row?.user_id === currentUserId || row?.user_profile_id === currentUserId);
    
    // Determine if activate/deactivate should be shown
    // For tenants: only show for counselors, not for fellow tenants or themselves
    // For admins: show for both counselors and tenants
    const shouldShowActivationActions = isCounselorOrTenant && 
      (!isCurrentUserTenant || (isCurrentUserTenant && row?.role_id === 2 && !isCurrentUser));

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
              {shouldShowActivationActions && (
                <>
                  {isActivated ? (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeactivate(row, index);
                        handleCellClick(row, index);
                      }}
                    >
                      <TooltipButton
                        title="Deactivate"
                        icon={<LockIcon />}
                        color="#ffc107"
                      />
                    </div>
                  ) : (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActivate(row, index);
                        handleCellClick(row, index);
                      }}
                    >
                      <TooltipButton
                        title="Activate"
                        icon={<UnlockIcon />}
                        color="#4caf50"
                      />
                    </div>
                  )}
                </>
              )}
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
