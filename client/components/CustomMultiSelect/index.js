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
        classNames="multiselect-options"
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
          menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
          menuPosition="fixed"
          {...props}
            styles={{
    control: (baseStyles, state) => ({
      ...baseStyles,
      borderColor: error ? 'var(--error-color)' : '#e1e1e1',
      boxShadow: error ? '0px 0px 0px 4px #fee4e2' : 'none',
      '&:hover': {
        borderColor: error ? 'var(--error-color)' : '#bdbdbd',
      },
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  }}

        />
        {error && (
          <small style={{ color: "red",}}>{error}</small>
        )}
      </div>
    </CustomMultiSelectContainer>
  );
};

export default CustomMultiSelect;
