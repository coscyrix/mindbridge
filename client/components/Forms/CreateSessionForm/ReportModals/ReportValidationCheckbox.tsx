import React from "react";
import styles from "./styles.module.scss";

interface ReportValidationCheckboxProps {
  isAccepted: boolean;
  onAcceptanceChange: (accepted: boolean) => void;
  text?: string;
}

const ReportValidationCheckbox: React.FC<ReportValidationCheckboxProps> = ({
  isAccepted,
  onAcceptanceChange,
  text = "I hereby confirm that I have reviewed and accept the accuracy of all information provided in this report. I understand that this report will be submitted as an official record.",
}) => {
  return (
    <div className={styles.validationCheckboxContainer}>
      <label className={styles.validationCheckboxLabel}>
        <input
          type="checkbox"
          checked={isAccepted}
          onChange={(e) => onAcceptanceChange(e.target.checked)}
          className={styles.validationCheckbox}
          required
        />
        <span className={styles.validationCheckboxText}>{text}</span>
      </label>
    </div>
  );
};

export default ReportValidationCheckbox;

