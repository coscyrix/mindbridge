import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { DataPickerWrapper } from "./style";

function CustomDatePicker({ selected, onChange, ...props }) {
  return (
    <DataPickerWrapper>
      <DatePicker
        selected={selected}
        onChange={onChange}
        {...props}
      />
    </DataPickerWrapper>
  );
}

export default CustomDatePicker;
