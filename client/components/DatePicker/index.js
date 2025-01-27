import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { DataPickerWrapper } from "./style";
function CustomDatePicker() {
  const [startDate, setStartDate] = useState("");
  return (
    <DataPickerWrapper>
      <DatePicker
        selected={startDate}
        onChange={(date) => setStartDate(date)}
      />
    </DataPickerWrapper>
  );
}

export default CustomDatePicker;
