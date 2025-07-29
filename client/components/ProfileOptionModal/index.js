import React from "react";
import { RiLockPasswordFill } from "react-icons/ri";
import { OptionsContainer, OptionButton } from "./style";
import { LogoutIcon } from "../../public/assets/icons";
const ProfileOptionsModal = ({ open, onClose, onLogout, onChangePassword }) => {
  return (
    <OptionsContainer>
      <OptionButton
        onClick={() => {
          onChangePassword();
          onClose();
        }}
      >
        <RiLockPasswordFill size={22} />
        Change Password
      </OptionButton>

      <OptionButton
        onClick={() => {
          onLogout();
          onClose();
        }}
      >
        <LogoutIcon />
        Logout
      </OptionButton>
    </OptionsContainer>
  );
};

export default ProfileOptionsModal;
