import React, { useState, useEffect, useMemo } from "react";
import CustomMultiSelect from "../../CustomMultiSelect";
import { SmartGoalDataContainer } from "./style";
import Spinner from "../../common/Spinner";

const SmartGoals = ({ smartGoalsData, loading }) => {
  const dateOptions = useMemo(
    () =>
      smartGoalsData.map((item) => ({
        label: item.session_dte,
        value: item.session_dte,
      })),
    [smartGoalsData]
  );

  const [selectedDate, setSelectedDate] = useState(null);
  const [filteredSmartGoals, setFilteredSmartGoals] = useState({});

  useEffect(() => {
    if (dateOptions.length > 0) {
      const firstDate = dateOptions[0];
      setSelectedDate(firstDate);

      const targetedSmartGoalsArr = smartGoalsData.filter(
        (item) => item.session_dte === firstDate.value
      );

      setFilteredSmartGoals(
        targetedSmartGoalsArr.length > 0
          ? targetedSmartGoalsArr[0]?.feedback_smart_goal.at(0) || []
          : []
      );
    }
  }, [smartGoalsData, dateOptions]);

  const handleDateChange = (selectedOption) => {
    if (!selectedOption) return;

    setSelectedDate(selectedOption);
    const targetedSmartGoalsArr = smartGoalsData.filter(
      (item) => item.session_dte === selectedOption.value
    );

    setFilteredSmartGoals(
      targetedSmartGoalsArr.length > 0
        ? targetedSmartGoalsArr[0]?.feedback_smart_goal.at(0) || []
        : []
    );
  };

  const smartGoalCategories = [
    { id: "specific", label: "Specific" },
    { id: "measurable", label: "Measurable" },
    { id: "achievable", label: "Achievable" },
    { id: "relevant", label: "Relevant" },
    { id: "time_bound", label: "Time-Bound" },
  ];

  return (
    <SmartGoalDataContainer>
      {loading ? (
        <div
          style={{
            width: "100%",
            height: "400px",
            position: "relative",
            top: "45%",
          }}
        >
          <Spinner color="#525252" />
        </div>
      ) : Object.keys(filteredSmartGoals).length != 0 ? (
        <div>
          <h4
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span>Session Date:</span>
            <CustomMultiSelect
              options={dateOptions}
              value={selectedDate}
              isMulti={false}
              onChange={handleDateChange}
            />
          </h4>

          <div className="SmartGoalClientTable">
            <table>
              <thead>
                <tr>
                  <th>SMART Goal</th>
                  <th style={{ minWidth: "260px" }}>
                    Goal Description: 1st Phase
                  </th>
                  <th>2nd Phase Review</th>
                  <th>3rd Phase Review</th>
                </tr>
              </thead>
              <tbody>
                {smartGoalCategories.map((category, index) => (
                  <tr key={index}>
                    <td>{category.label}</td>
                    <td>
                      {filteredSmartGoals?.[`${category.id}_1st_phase`] ||
                        "N/A"}
                    </td>
                    <td>
                      {filteredSmartGoals?.[`${category.id}_2nd_phase`] ||
                        "N/A"}
                    </td>
                    <td>
                      {filteredSmartGoals?.[`${category.id}_3rd_phase`] ||
                        "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p
          style={{
            height: "400px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          No Data Available
        </p>
      )}
    </SmartGoalDataContainer>
  );
};

export default SmartGoals;
