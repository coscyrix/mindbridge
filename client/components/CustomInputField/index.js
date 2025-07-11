import React from "react";
import { useFormContext } from "react-hook-form";
import { CustomInputContainer } from "./style";

const CustomInputField = ({
  name,
  label,
  type = "text",
  placeholder = "",
  validationRules = {}, 
  customClass = "",
  disabled = false,
  icon,
  helperText,
  handleShowPassword,
  value,
  ...props
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <CustomInputContainer>
      {label && <label htmlFor={name}>{label}</label>}
      <div className={`input-field-container ${disabled && "disabled"}`}>
        <div
          className="input-icon"
          onClick={() => {
            handleShowPassword();
          }}
        >
          {icon}
        </div>
        <input
          id={name}
          type={type}
          lang="en-GB"
          {...register(name, {
            required: "This field is required",
            ...validationRules,
          })}
          value={value}
          placeholder={placeholder}
          className={`${customClass} ${errors[name] ? "error-input" : ""}`}
          disabled={disabled}
          {...props}
        />
      </div>
      {/* Show error message if there is an error, else show helperText */}
      <p className={`${errors[name] ? "error-text" : "helper-text"}`}>
        {errors[name] ? errors[name].message : helperText}
      </p>
    </CustomInputContainer>
  );
};

export default CustomInputField;
