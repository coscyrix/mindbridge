import React from "react";
import Modal from "react-modal";
import styles from "./Modal.module.css";
import { GoX } from "react-icons/go";
Modal.setAppElement("#__next");

const CustomModal = ({
  isOpen,
  onRequestClose,
  title,
  icon,
  children,
  customStyles = {},
  ...rest
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className={`${styles.modal_content} ${customStyles.className || ""}`}
      overlayClassName={styles.modal_overlay}
      style={{ content: { maxWidth: customStyles.maxWidth } }}
      {...rest}
    >
      <div className={styles.modal_wrapper}>
        <button className={styles.close_button} onClick={onRequestClose}>
          <GoX size={40} color="black" />
        </button>
        <div className={styles.modal_header}>
          <div className={styles.ripple_icon}>
            <span className={styles.inner_circle}>?</span>
            {icon && icon}
          </div>
          <h2>{title}</h2>
        </div>
        <div className={styles.modal_body}>{children}</div>
      </div>
    </Modal>
  );
};

export default CustomModal;
