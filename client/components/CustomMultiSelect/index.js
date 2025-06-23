import React from "react";
import Select from "react-select";
import { CustomMultiSelectContainer } from "./style";

const CustomMultiSelect = ({
  field,
  options = [],
  placeholder = "Select an option",
  isMulti = true,
  className = "multi-select",
  classNamePrefix = "select",
  onChange,
  value,
  label,
  error,
  ...props
}) => {
  return (
    <CustomMultiSelectContainer error={error}>
      <div className="select-container">
        {label && <label>{label}</label>}
        <Select
          {...field}
          placeholder={
            <div style={{ opacity: "0.2", color: "#000000", borderColor:error&&'red', boxShadow:error&'red' }}>
              {placeholder}
            </div>
          }
          isMulti={isMulti}
          options={options}
          className={`${className}`}
          classNamePrefix={classNamePrefix}
          onChange={onChange}
          value={value}
          {...props}
        />
        {error && (
          <span style={{ color: "red", fontSize: "16px" }}>{error}</span>
        )}
      </div>
    </CustomMultiSelectContainer>
  );
};

export default CustomMultiSelect;
