import React, { useState } from 'react';
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
      align-items: center;
      gap: 16px;
      
      .day-checkbox {
        display: flex;
        align-items: center;
        min-width: 120px;
        
        input[type="checkbox"] {
          margin-right: 8px;
          width: 18px;
          height: 18px;
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
        
        .time-select {
          width: 150px;
        }
        
        .separator {
          color: #666;
          margin: 0 4px;
        }
      }

      .remove-button {
        margin-left: 12px;
        color: #999;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 18px;
        padding: 4px 8px;
        
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
      padding: 8px 0;
      margin-left: 136px;
      display: flex;
      align-items: center;
      
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

const WeeklyAvailability = ({ control }) => {
  const [timeSlots, setTimeSlots] = useState({
    monday: [defaultTimeSlot],
    tuesday: [defaultTimeSlot],
    wednesday: [defaultTimeSlot],
    thursday: [defaultTimeSlot],
    friday: [defaultTimeSlot],
    saturday: [defaultTimeSlot],
    sunday: [defaultTimeSlot]
  });

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

  return (
    <WeeklyAvailabilityContainer>
      <h2>Default Opening Hours For Business</h2>
      {days.map((day) => (
        <div key={day.id} className="day-container">
          <div className="day-header">
            <div className="day-checkbox">
              <Controller
                name={`availability.${day.id}.enabled`}
                control={control}
                defaultValue={day.id !== 'saturday' && day.id !== 'sunday'}
                render={({ field }) => (
                  <>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={(e) => {
                        field.onChange(e.target.checked);
                        if (!e.target.checked) {
                          setTimeSlots(prev => ({
                            ...prev,
                            [day.id]: [{ ...defaultTimeSlot }]
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
              defaultValue={{ slots: [{ ...defaultTimeSlot }] }}
              render={({ field }) => (
                <Controller
                  name={`availability.${day.id}.enabled`}
                  control={control}
                  render={({ field: enabledField }) => (
                    !enabledField.value ? (
                      <span style={{ color: '#666' }}>closed</span>
                    ) : (
                      <>
                        {(timeSlots[day.id] || []).map((slot, index) => (
                          <div key={index} className="time-selectors">
                            <Select
                              className="time-select"
                              classNamePrefix="select"
                              options={timeOptions}
                              value={timeOptions.find(option => 
                                option.value === (field.value?.slots?.[index]?.start || slot.start)
                              )}
                              onChange={(option) => {
                                const newSlots = [...(field.value?.slots || [])];
                                if (!newSlots[index]) {
                                  newSlots[index] = { ...slot };
                                }
                                newSlots[index] = { 
                                  ...newSlots[index], 
                                  start: option.value 
                                };
                                field.onChange({ slots: newSlots });
                                updateTimeSlot(day.id, index, field, newSlots);
                              }}
                              placeholder="Start time"
                            />
                            <span className="separator">-</span>
                            <Select
                              className="time-select"
                              classNamePrefix="select"
                              options={timeOptions}
                              value={timeOptions.find(option => 
                                option.value === (field.value?.slots?.[index]?.end || slot.end)
                              )}
                              onChange={(option) => {
                                const newSlots = [...(field.value?.slots || [])];
                                if (!newSlots[index]) {
                                  newSlots[index] = { ...slot };
                                }
                                newSlots[index] = { 
                                  ...newSlots[index], 
                                  end: option.value 
                                };
                                field.onChange({ slots: newSlots });
                                updateTimeSlot(day.id, index, field, newSlots);
                              }}
                              placeholder="End time"
                            />
                            {index > 0 && (
                              <button 
                                className="remove-button" 
                                type="button"
                                onClick={() => {
                                  removeTimeSlot(day.id, index);
                                  const newSlots = (field.value?.slots || []).filter((_, i) => i !== index);
                                  field.onChange({ slots: newSlots });
                                }}
                              >
                                ×
                              </button>
                            )}
                          </div>
                        ))}
                        {(timeSlots[day.id] || []).length < 3 && (
                          <button 
                            type="button" 
                            className="add-time"
                            onClick={() => {
                              const newSlot = { ...defaultTimeSlot };
                              addTimeSlot(day.id);
                              const newSlots = [...(field.value?.slots || []), newSlot];
                              field.onChange({ slots: newSlots });
                            }}
                          >
                            Add
                          </button>
                        )}
                      </>
                    )
                  )}
                />
              )}
            />
          </div>
        </div>
      ))}
    </WeeklyAvailabilityContainer>
  );
};

export default WeeklyAvailability; 