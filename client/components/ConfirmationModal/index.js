import React from "react";
import { ConfirmationModalWrapper } from "./style";
import CustomModal from "../CustomModal";
import CustomButton from "../CustomButton";
import Spinner from "../common/Spinner";

const ConfirmationModal = ({
  isOpen,
  onClose,
  content = "Are you sure you want to send the consent form?",
  affirmativeAction = "Send",
  discardAction = "Cancel",
  handleAffirmativeAction,
  loading,
}) => {
  return (
    <CustomModal
      title={"Confirmation"}
      isOpen={isOpen}
      onRequestClose={onClose}
    >
      <ConfirmationModalWrapper>
        <div>{content}</div>
        <div className="modal-buttons">
          <CustomButton
            onClick={onClose}
            customClass="cancel-button"
            title={discardAction}
          />
          <CustomButton
            onClick={!loading && handleAffirmativeAction}
            style={{ padding: loading ? "5.75px 12px" : "10.5px 12px" }}
            customClass="save-button"
            title={
              loading ? (
                <Spinner width="25px" height="25px" />
              ) : (
                affirmativeAction
              )
            }
          />
        </div>
      </ConfirmationModalWrapper>
    </CustomModal>
  );
};

export default ConfirmationModal;
