import React, { useState, useEffect } from 'react';
import { Controller } from 'react-hook-form';
import Select from 'react-select';
import styled from 'styled-components';

const WeeklyAvailabilityContainer = styled.div`
  padding: 20px;

  h2 {
    font-size: 24px;
    color: #333;
    margin-bottom: 24px;
  }

  .day-container {
    margin-bottom: 16px;
    padding: 12px 0;
    border-bottom: 1px solid #eee;
    
    .day-header {
      display: flex;
      align-items: start;
      gap: 16px;
      
      .day-checkbox {
        display: flex;
        align-items: start;
        min-width: 120px;
        
        input[type="checkbox"] {
          width: 12px;
          height: 12px;
        }
        
        label {
          font-size: 16px;
          color: #333;
        }
      }
      
      .time-selectors {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 10px;
        
        .time-select {
          width: 150px;
        }
        
        .separator {
          color: #666;
          margin: 0 4px;
        }
      }

      .remove-button {
        color: #999;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 18px;
        
        &:hover {
          color: #666;
        }
      }
    }
    
    .add-time {
      color: #2196f3;
      font-size: 14px;
      background: none;
      border: none;
      cursor: pointer;
      
      &:hover {
        color: #1976d2;
      }
      
      &::before {
        content: '+';
        margin-right: 4px;
      }
    }
  }
`;

const generateTimeOptions = () => {
  const options = [];
  for (let i = 0; i < 24; i++) {
    const hour = i % 12 || 12;
    const ampm = i < 12 ? 'AM' : 'PM';
    options.push(
      { value: `${i}:00`, label: `${hour}:00 ${ampm}` },
      { value: `${i}:30`, label: `${hour}:30 ${ampm}` }
    );
  }
  return options;
};

const timeOptions = generateTimeOptions();

const days = [
  { id: 'monday', label: 'Monday' },
  { id: 'tuesday', label: 'Tuesday' },
  { id: 'wednesday', label: 'Wednesday' },
  { id: 'thursday', label: 'Thursday' },
  { id: 'friday', label: 'Friday' },
  { id: 'saturday', label: 'Saturday' },
  { id: 'sunday', label: 'Sunday' }
];

const defaultTimeSlot = { start: '10:00', end: '19:00' };

const convertTimesToSlots = (times) => {
  if (!times || times.length === 0) return [];
  
  // Sort times to ensure they're in order
  const sortedTimes = [...times].sort();
  
  // Return a single slot with earliest start and latest end time
  return [{
    start: sortedTimes[0],
    end: sortedTimes[sortedTimes.length - 1]
  }];
};

const getMinutesDifference = (time1, time2) => {
  const [hours1, minutes1] = time1.split(':').map(Number);
  const [hours2, minutes2] = time2.split(':').map(Number);
  return (hours2 * 60 + minutes2) - (hours1 * 60 + minutes1);
};

const WeeklyAvailability = ({ control, value }) => {
  const [timeSlots, setTimeSlots] = useState({
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: []
  });

  // Initialize timeSlots from value prop
  useEffect(() => {
    if (value) {
      const initialTimeSlots = {};
      days.forEach(day => {
        const dayTimes = value[day.id] || [];
        initialTimeSlots[day.id] = convertTimesToSlots(dayTimes);
      });
      setTimeSlots(initialTimeSlots);
    }
  }, [value]);

  const addTimeSlot = (dayId) => {
    setTimeSlots(prev => ({
      ...prev,
      [dayId]: [...(prev[dayId] || []), { ...defaultTimeSlot }]
    }));
  };

  const removeTimeSlot = (dayId, index) => {
    setTimeSlots(prev => ({
      ...prev,
      [dayId]: prev[dayId].filter((_, i) => i !== index)
    }));
  };

  const updateTimeSlot = (dayId, index, field, newSlots) => {
    setTimeSlots(prev => ({
      ...prev,
      [dayId]: prev[dayId].map((slot, i) => 
        i === index ? newSlots[index] : slot
      )
    }));
  };

  const getTimeArray = (slots) => {
  if (!slots || !slots.length) return [];

  // Helper: Convert "HH:mm" to minutes past midnight.
  const timeToMinutes = (time) => {
    const [hrs, mins] = time.split(':').map(Number);
    return hrs * 60 + mins;
  };

  // Helper: Convert minutes back to "HH:mm" (with leading zeros).
  const minutesToTime = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };

  // Generate an array of times for a given slot.
  const generateTimes = (start, end) => {
    const times = [];
    let current = timeToMinutes(start);
    const endMinutes = timeToMinutes(end);
    
    // Loop in 1-hour (60 minutes) increments.
    while (current <= endMinutes) {
      times.push(minutesToTime(current));
      current += 60;
    }
    
    // If the last generated time isn't exactly the end, add the end time.
    if (times[times.length - 1] !== end) {
      times.push(end);
    }
    
    return times;
  };

  let allTimes = [];

  // Process each slot.
  slots.forEach(slot => {
    if (slot.start && slot.end) {
      const timesForSlot = generateTimes(slot.start, slot.end);
      allTimes = allTimes.concat(timesForSlot);
    }
  });

  // Remove duplicates and sort (optional, if your slots might overlap).
  allTimes = [...new Set(allTimes)];
  allTimes.sort((a, b) => timeToMinutes(a) - timeToMinutes(b));

  return allTimes;
};


  return (
    <WeeklyAvailabilityContainer>
      <h2>Default Opening Hours For Business</h2>
      {days.map((day) => (
        <div key={day.id} className="day-container">
          <div className="day-header">
            <div className="day-checkbox">
              <Controller
                name={`availability.${day.id}`}
                control={control}
                defaultValue={value ? value[day.id] : []}
                render={({ field }) => (
                  <>
                    <input
                      type="checkbox"
                      checked={field.value && field.value.length > 0}
                      onChange={(e) => {
                        if (!e.target.checked) {
                          field.onChange([]);
                          setTimeSlots(prev => ({
                            ...prev,
                            [day.id]: []
                          }));
                        } else {
                          const newSlots = [{ ...defaultTimeSlot }];
                          field.onChange(getTimeArray(newSlots));
                          setTimeSlots(prev => ({
                            ...prev,
                            [day.id]: newSlots
                          }));
                        }
                      }}
                      id={`${day.id}-checkbox`}
                    />
                    <label htmlFor={`${day.id}-checkbox`}>{day.label}</label>
                  </>
                )}
              />
            </div>
            <Controller
              name={`availability.${day.id}`}
              control={control}
              defaultValue={value ? value[day.id] : []}
              render={({ field }) => (
                !field.value || field.value.length === 0 ? (
                  <span style={{ color: '#666' }}>closed</span>
                ) : (
                  <>
                  <div className='time-slot-container'>
                    {(timeSlots[day.id] || []).map((slot, index) => (
                      <div key={index} className="time-selectors">
                        <Select
                          className="time-select"
                          classNamePrefix="select"
                          options={timeOptions}
                          value={timeOptions.find(option => 
                            option.value === slot.start
                          )}
                          onChange={(option) => {
                            const newSlots = [...timeSlots[day.id]];
                            newSlots[index] = { 
                              ...newSlots[index], 
                              start: option.value 
                            };
                            setTimeSlots(prev => ({
                              ...prev,
                              [day.id]: newSlots
                            }));
                            field.onChange(getTimeArray(newSlots));
                          }}
                          placeholder="Start time"
                        />
                        <span className="separator">-</span>
                        <Select
                          className="time-select"
                          classNamePrefix="select"
                          options={timeOptions}
                          value={timeOptions.find(option => 
                            option.value === slot.end
                          )}
                          onChange={(option) => {
                            const newSlots = [...timeSlots[day.id]];
                            newSlots[index] = { 
                              ...newSlots[index], 
                              end: option.value 
                            };
                            setTimeSlots(prev => ({
                              ...prev,
                              [day.id]: newSlots
                            }));
                            field.onChange(getTimeArray(newSlots));
                          }}
                          placeholder="End time"
                        />
                          <button 
                            className="remove-button" 
                            type="button"
                            onClick={() => {
                              const newSlots = timeSlots[day.id].filter((_, i) => i !== index);
                              setTimeSlots(prev => ({
                                ...prev,
                                [day.id]: newSlots
                              }));
                              field.onChange(getTimeArray(newSlots));
                            }}
                            disabled={index===0}
                            style={{visibility:index===0&&'hidden'}}
                          >
                            ×
                          </button>
                      </div>
                    ))}
                    </div>
                    {(timeSlots[day.id] || []) && (
                      <button 
                        type="button" 
                        className="add-time"
                        onClick={() => {
                          const newSlots = [...timeSlots[day.id], { ...defaultTimeSlot }];
                          setTimeSlots(prev => ({
                            ...prev,
                            [day.id]: newSlots
                          }));
                          field.onChange(getTimeArray(newSlots));
                        }}
                      >
                        Add
                      </button>
                    )}
                  </>
                )
              )}
            />
          </div>
        </div>
      ))}
    </WeeklyAvailabilityContainer>
  );
};

export default WeeklyAvailability; 