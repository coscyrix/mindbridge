import React, { useState } from "react";
import styled from "styled-components";
const DateSelector = ({ dates, availability, selectedDate, onDateSelect }) => {
  // const
  const [blockedDate, setBlockedDate] = useState(null);

  const handleClick = (date) => {
    const dayOfWeek = new Date(date)
      .toLocaleDateString("en-US", {
        weekday: "long",
      })
      .toLowerCase();

    const isAvailable = availability?.[dayOfWeek]?.length > 0;

    if (isAvailable) {
      onDateSelect(date);
      setBlockedDate(null);
    } else {
      setBlockedDate(date);
    }
  };
  return (
    <DateSelectorWrapper>
      <div className="date-grid">
        {dates.map((dateObj) => {
          const { date, day } = dateObj;
          const dayOfWeek = new Date(date)
            .toLocaleDateString("en-US", {
              weekday: "long",
            })
            .toLowerCase();

          const isAvailable = availability?.[dayOfWeek]?.length > 0;
          const isSelected = selectedDate === date && isAvailable;
          const isBlocked = blockedDate === date;

          return (
            <DateItem
              key={date}
              isSelected={isSelected}
              isBlocked={isBlocked}
              isAvailable={isAvailable}
              onClick={() => handleClick(date)}
            >
              <span className="day">{day}</span>
              <span className="date">{date}</span>
            </DateItem>
          );
        })}
      </div>
    </DateSelectorWrapper>
  );
};

const DateSelectorWrapper = styled.div`
  .date-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 8px;
    margin-bottom: 24px;
    white-space: nowrap;
  }
  .blocked-icon {
    margin-left: 4px;
    color: red;
    display: inline-flex;
    align-items: center;
    &:hover {
    }
  }
  .time-slots {
    h3 {
      margin: 0 0 16px 0;
      font-size: 16px;
      color: #333;
    }

    .slot-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }
  }
`;

const DateItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  border-radius: 8px;
  cursor: ${(props) => (props.isAvailable ? "pointer" : "not-allowed")};
  opacity: ${(props) => (props.isAvailable ? "1" : "0.5")};
  pointer-events: ${(props) => (props.isAvailable ? "auto" : "none")};
  background: ${(props) => (props.isSelected ? "#1a73e8" : "white")};
  border: 1px solid ${(props) => (props.isSelected ? "#1a73e8" : "#e0e0e0")};
  transition: all 0.2s ease;

  &:hover {
    border-color: ${(props) => (props.isAvailable ? "#1a73e8" : "#e0e0e0")};
  }

  .day {
    font-size: 12px;
    color: ${(props) => (props.isSelected ? "rgba(255,255,255,0.8)" : "#666")};
    margin-bottom: 4px;
  }

  .date {
    font-size: 16px;
    font-weight: 600;
    color: ${(props) => (props.isSelected ? "white" : "#333")};
  }
`;

const TimeSlot = styled.button`
  padding: 8px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: white;
  color: ${(props) => (props.disabled ? "#999" : "#333")};
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  font-size: 14px;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${(props) => (props.disabled ? "#e0e0e0" : "#1a73e8")};
    background: ${(props) => (props.disabled ? "white" : "#f8f9fa")};
  }

  &:disabled {
    
    opacity: 0.7;
    background: #f5f5f5;
  }
`;

export default DateSelector;
