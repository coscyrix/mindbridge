import React from "react";
import styles from "../styles.module.scss";

interface CheckboxOption {
  key: string;
  label: string;
}

interface CheckboxGroupProps {
  options: readonly CheckboxOption[] | CheckboxOption[];
  values: Record<string, boolean>;
  onChange: (key: string, checked: boolean) => void;
  label?: string;
  className?: string;
}

/**
 * CheckboxGroup - Reusable checkbox group component
 * Used for multi-selection options like symptoms, risk screening flags, etc.
 */
const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  options,
  values,
  onChange,
  label,
  className,
}) => {
  return (
    <div className={className}>
      {label && <label>{label}</label>}
      <div className={styles.checkboxGroup}>
        {options.map((option) => (
          <label key={option.key}>
            <input
              type="checkbox"
              checked={values[option.key] || false}
              onChange={(e) => onChange(option.key, e.target.checked)}
            />{" "}
            {option.label}
          </label>
        ))}
      </div>
    </div>
  );
};

export default CheckboxGroup;

