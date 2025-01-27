import React from "react";
import Modal from "react-modal";
import styles from "./AdditionalSericve.module.css";

Modal.setAppElement("#__next");

const AdditionalServiceModal = ({
  isOpen,
  onRequestClose,
  title,
  children,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className={styles.modal_content}
      overlayClassName={styles.modal_overlay}
    >
      <div className={styles.modal_header}>
        <h2>{title}</h2>
        <button className={styles.close_button} onClick={onRequestClose}>
          ×
        </button>
      </div>
      <div className={styles.modal_body}>{children}</div>
    </Modal>
  );
};

export default AdditionalServiceModal;
