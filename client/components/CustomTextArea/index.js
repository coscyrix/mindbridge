import React from "react";
import { CustomTextAreaWrapper } from "./style";
import { Controller } from "react-hook-form";

function CustomTextArea({
  label,
  name,
  control,
  defaultValue = "",
  isError,
  disabled,
  ...rest
}) {
  return (
    <CustomTextAreaWrapper>
      <div className={`content ${disabled && "disabled"}`}>
        <label>{label}</label>
        {control ? (
          <Controller
            name={name}
            control={control}
            defaultValue={defaultValue}
            render={({ field }) => (
              <textarea
                className={`${isError ? "error" : ""}`}
                {...field}
                rows={4}
                cols={50}
                disabled={disabled}
                {...rest}
              />
            )}
          />
        ) : (
          <textarea
            name={name}
            disabled={disabled}
            className={`${isError ? "error" : ""}`}
            {...rest}
          />
        )}
      </div>
    </CustomTextAreaWrapper>
  );
}

export default CustomTextArea;
