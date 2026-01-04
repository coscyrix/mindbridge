import React from "react";
import { CustomTextAreaWrapper } from "./style";
import { Controller, useFormContext } from "react-hook-form";

function CustomTextArea({
  label,
  name,
  control,
  defaultValue = "",
  isError,
  disabled,
  helperText,
  ...rest
}) {
  // Get errors from form context if control is not provided
  const formContext = !control ? useFormContext() : null;
  const errors = formContext?.formState?.errors;

  return (
    <CustomTextAreaWrapper>
      <div className={`content ${disabled && "disabled"}`}>
        <label>{label}</label>
        {control ? (
          <Controller
            name={name}
            control={control}
            defaultValue={defaultValue}
            render={({ field, fieldState: { error } }) => {
              const hasError = isError || !!error;
              return (
                <>
                  <textarea
                    className={hasError ? "error" : ""}
                    {...field}
                    rows={4}
                    cols={50}
                    disabled={disabled}
                    {...rest}
                  />
                  {/* Show error message if there is an error, else show helperText */}
                  <p className={hasError ? "error-text" : "helper-text"}>
                    {hasError ? (error?.message || "This field is required") : helperText}
                  </p>
                </>
              );
            }}
          />
        ) : (
          <>
            <textarea
              name={name}
              disabled={disabled}
              className={isError || errors?.[name] ? "error" : ""}
              {...rest}
            />
            {/* Show error message if there is an error, else show helperText */}
            <p className={isError || errors?.[name] ? "error-text" : "helper-text"}>
              {isError || errors?.[name]
                ? errors?.[name]?.message || "This field is required"
                : helperText}
            </p>
          </>
        )}
      </div>
    </CustomTextAreaWrapper>
  );
}

export default CustomTextArea;
