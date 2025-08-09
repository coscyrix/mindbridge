import React, { useState, useEffect } from "react";
import { Controller } from "react-hook-form";
import Select from "react-select";
import styled from "styled-components";

const WeeklyAvailabilityContainer = styled.div`
  max-width: 720px;
  margin: 32px auto;
  padding: 24px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  h2 {
    font-size: clamp(18px, 4vw, 22px);
    font-weight: 600;
    margin-bottom: 6px;
    color: #111827;
  }

  .description {
    font-size: clamp(13px, 3.5vw, 14px);
    color: #6b7280;
    margin-bottom: 24px;
  }

  .day-row {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 16px;
    padding: 16px 0;
    border-bottom: 1px solid #e5e7eb;

    @media (max-width: 635px) {
      grid-template-columns: 1fr;
    }
  }

  .day-label {
    display: flex;
    align-items: center;
    gap: 110px;
    @media (max-width: 360px) {
      gap: 10px;
    }
    @media (max-width: 635px) {
      justify-content: space-between;
    }
    label {
      font-size: clamp(15px, 4vw, 16px);
      font-weight: 500;
      color: #374151;
      margin: 0;
      width: 10px;
    }

    .switch {
      position: relative;
      width: 45px;
      height: 25px;
      min-width: 45px;

      input {
        opacity: 0;
        width: 0;
        height: 0;
      }

      .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #d1d5db;
        border-radius: 34px;
        transition: 0.4s;
      }

      .slider:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        border-radius: 50%;
        transition: 0.4s;
      }

      input:checked + .slider {
        background-color: #2b5efc;
      }

      input:checked + .slider:before {
        transform: translateX(20px);
      }
    }
  }

  .closed-label {
    font-size: 14px;
    color: #9ca3af;
    font-style: italic;
    align-self: center;
    padding-top: 4px;

    @media (max-width: 635px) {
      padding-left: 0;
    }
  }

  .time-selector {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 4px;

    .time-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      width: 100%;
      gap: 12px;

      @media (max-width: 400px) {
        // flex-direction: column;
        align-items: stretch;
      }
    }

    .time-select {
      flex: 1;
      min-width: 120px;
      max-width: 160px;

      @media (max-width: 400px) {
        width: 100%;
      }
    }

    .to-separator {
      font-size: 14px;
      color: #6b7280;
      display: inline-block;
      white-space: nowrap;
      padding: 0 4px;

      @media (max-width: 400px) {
        text-align: center;
        padding: 4px 0;
      }
    }

    .remove-button {
      background: none;
      border: none;
      font-size: 18px;
      color: #9ca3af;
      cursor: pointer;
      padding: 0;
      margin-left: 4px;

      &:hover {
        color: #6b7280;
      }
    }
  }

  .button-row {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 32px;
    flex-wrap: wrap;

    @media (max-width: 500px) {
      justify-content: center;
    }

    .cancel-button,
    .save-button {
      padding: 10px 20px;
      font-size: 14px;
      font-weight: 500;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.3s ease;
      white-space: nowrap;
    }

    .cancel-button {
      background-color: #f3f4f6;
      color: #374151;

      &:hover {
        background-color: #e5e7eb;
      }
    }

    .save-button {
      background-color: #2b5efc;
      color: #fff;

      &:hover {
        background-color: #2b5efc;
      }
    }
  }

  @media (max-width: 360px) {
    padding: 16px;

    .button-row {
      flex-direction: column;
      align-items: stretch;
    }

    .day-label {
      flex-direction: column;
      align-items: flex-start;
    }

    .closed-label {
      font-size: 13px;
    }
  }
`;

const generateTimeOptions = () => {
  const options = [];
  for (let i = 0; i < 24; i++) {
    const hour = i % 12 || 12;
    const ampm = i < 12 ? "AM" : "PM";
    options.push(
      { value: `${i}:00`, label: `${hour}:00 ${ampm}` },
      { value: `${i}:30`, label: `${hour}:30 ${ampm}` }
    );
  }
  return options;
};

const timeOptions = generateTimeOptions();

const days = [
  { id: "monday", label: "Monday" },
  { id: "tuesday", label: "Tuesday" },
  { id: "wednesday", label: "Wednesday" },
  { id: "thursday", label: "Thursday" },
  { id: "friday", label: "Friday" },
  { id: "saturday", label: "Saturday" },
  { id: "sunday", label: "Sunday" },
];

const defaultTimeSlot = { start: "10:00", end: "19:00" };

const convertTimesToSlots = (times) => {
  if (!times || times.length === 0) return [];

  // Sort times to ensure they're in order
  const sortedTimes = [...times].sort();

  // Return a single slot with earliest start and latest end time
  return [
    {
      start: sortedTimes[0],
      end: sortedTimes[sortedTimes.length - 1],
    },
  ];
};

const getMinutesDifference = (time1, time2) => {
  const [hours1, minutes1] = time1.split(":").map(Number);
  const [hours2, minutes2] = time2.split(":").map(Number);
  return hours2 * 60 + minutes2 - (hours1 * 60 + minutes1);
};

const WeeklyAvailability = ({ control, value }) => {
  const [timeSlots, setTimeSlots] = useState({
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
  });

  // Initialize timeSlots from value prop
  useEffect(() => {
    if (value) {
      const initialTimeSlots = {};
      days.forEach((day) => {
        const dayTimes = value[day.id] || [];
        initialTimeSlots[day.id] = convertTimesToSlots(dayTimes);
      });
      setTimeSlots(initialTimeSlots);
    }
  }, [value]);

  const addTimeSlot = (dayId) => {
    setTimeSlots((prev) => ({
      ...prev,
      [dayId]: [...(prev[dayId] || []), { ...defaultTimeSlot }],
    }));
  };

  const removeTimeSlot = (dayId, index) => {
    setTimeSlots((prev) => ({
      ...prev,
      [dayId]: prev[dayId].filter((_, i) => i !== index),
    }));
  };

  const updateTimeSlot = (dayId, index, field, newSlots) => {
    setTimeSlots((prev) => ({
      ...prev,
      [dayId]: prev[dayId].map((slot, i) =>
        i === index ? newSlots[index] : slot
      ),
    }));
  };

  const getTimeArray = (slots) => {
    if (!slots || !slots.length) return [];

    // Helper: Convert "HH:mm" to minutes past midnight.
    const timeToMinutes = (time) => {
      const [hrs, mins] = time.split(":").map(Number);
      return hrs * 60 + mins;
    };

    // Helper: Convert minutes back to "HH:mm" (with leading zeros).
    const minutesToTime = (minutes) => {
      const hrs = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
    };

    // Generate an array of times for a given slot.
    // const generateTimes = (start, end) => {
    //   const times = [];
    //   let current = timeToMinutes(start);
    //   const endMinutes = timeToMinutes(end);

    //   // Loop in 1-hour (60 minutes) increments.
    //   while (current <= endMinutes) {
    //     times.push(minutesToTime(current));
    //     current += 60;
    //   }

    //   // If the last generated time isn't exactly the end, add the end time.
    //   if (times[times.length - 1] !== end) {
    //     times.push(end);
    //   }

    //   return times;
    // };

    let allTimes = [];

    // Process each slot.
    slots.forEach((slot) => {
      if (slot.start && slot.end) {
        // const timesForSlot = generateTimes(slot.start, slot.end);
        // allTimes = allTimes.concat(timesForSlot);
        allTimes.push(slot.start, slot.end);
      }
    });

    // Remove duplicates and sort (optional, if your slots might overlap).
    allTimes = [...new Set(allTimes)];
    allTimes.sort((a, b) => timeToMinutes(a) - timeToMinutes(b));

    return allTimes;
  };

  return (
    <WeeklyAvailabilityContainer>
      <h2>Set Standard Hours</h2>
      <p className="description">
        Configure the standard hours of operation for this location.
      </p>
      {days.map((day) => (
        <div key={day.id} className="day-row">
          <div className="day-label">
            <Controller
              name={`availability.${day.id}`}
              control={control}
              defaultValue={value ? value[day.id] : []}
              render={({ field }) => (
                <>
                  <label htmlFor={`${day.id}-checkbox`}>{day.label}</label>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={field.value && field.value.length > 0}
                      onChange={(e) => {
                        if (!e.target.checked) {
                          field.onChange([]);
                          setTimeSlots((prev) => ({
                            ...prev,
                            [day.id]: [],
                          }));
                        } else {
                          const newSlots = [{ ...defaultTimeSlot }];
                          field.onChange(getTimeArray(newSlots));
                          setTimeSlots((prev) => ({
                            ...prev,
                            [day.id]: newSlots,
                          }));
                        }
                      }}
                      id={`${day.id}-checkbox`}
                    />
                    <span className="slider"></span>
                  </label>
                </>
              )}
            />
          </div>

          <Controller
            name={`availability.${day.id}`}
            control={control}
            defaultValue={value ? value[day.id] : []}
            render={({ field }) =>
              !field.value || field.value.length === 0 ? (
                <span className="closed-label">Closed</span>
              ) : (
                <div className="time-selector">
                  {(timeSlots[day.id] || []).map((slot, index) => (
                    <div key={index} className="time-row">
                      <Select
                        className="time-select"
                        options={timeOptions}
                        value={timeOptions.find(
                          (option) => option.value === slot.start
                        )}
                        onChange={(option) => {
                          const newSlots = [...timeSlots[day.id]];
                          newSlots[index] = {
                            ...newSlots[index],
                            start: option.value,
                          };
                          setTimeSlots((prev) => ({
                            ...prev,
                            [day.id]: newSlots,
                          }));
                          field.onChange(getTimeArray(newSlots));
                        }}
                        placeholder="Start"
                      />
                      <span className="to-separator">to</span>
                      <Select
                        className="time-select"
                        options={timeOptions}
                        value={timeOptions.find(
                          (option) => option.value === slot.end
                        )}
                        onChange={(option) => {
                          const newSlots = [...timeSlots[day.id]];
                          newSlots[index] = {
                            ...newSlots[index],
                            end: option.value,
                          };
                          setTimeSlots((prev) => ({
                            ...prev,
                            [day.id]: newSlots,
                          }));
                          field.onChange(getTimeArray(newSlots));
                        }}
                        placeholder="End"
                      />
                    </div>
                  ))}
                </div>
              )
            }
          />
        </div>
      ))}
    </WeeklyAvailabilityContainer>
  );
};

export default WeeklyAvailability;
