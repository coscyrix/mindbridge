import React from "react";
import styles from "../styles.module.scss";

interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps {
  name: string;
  label?: string;
  options: readonly RadioOption[] | RadioOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  className?: string;
}

/**
 * RadioGroup - Reusable radio button group component
 * Used for single-selection options like duration, discharge reason, etc.
 */
const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  label,
  options,
  value,
  onChange,
  error,
  className,
}) => {
  return (
    <div className={className}>
      {label && <label>{label}</label>}
      <div className={styles.radioGroup}>
        {options.map((option) => (
          <label key={option.value}>
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
            />{" "}
            {option.label}
          </label>
        ))}
      </div>
      {error && (
        <span
          style={{
            color: "#d32f2f",
            fontSize: "12px",
            marginTop: "4px",
            display: "block",
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
};

export default RadioGroup;

