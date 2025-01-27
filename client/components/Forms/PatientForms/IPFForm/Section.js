import React from "react";
import { Controller } from "react-hook-form";
import { RadioWrapper, Table } from "./style";

const Section = ({
  sectionTitle,
  sectionDescription,
  questions,
  options,
  fieldNamePrefix,
  condition,
  children,
  register,
  control,
  tableEnablingQuestion,
  name,
}) => {
  return (
    <section className="section">
      <Table>
        <caption
          style={{
            textAlign: "left",
            verticalAlign: "middle",
            unicodeBidi: "isolate",
            borderColor: "inherit",
            backgroundColor: "rgb(235, 235, 235)",
            border: "1px solid #ccc",
            borderBottom: "none",
            padding: "15px",
          }}
        >
          <h3 style={{ marginTop: 0 }}>
            <u>{sectionTitle}</u>
          </h3>
          <div>
            <div className="children-container">{children}</div>
            <label>{sectionDescription}</label>
            <div className="relationship-question-enabler">
              <label>
                <input {...register(name)} type="radio" value="Yes" />
                Yes
              </label>
              <label>
                <input {...register(name)} type="radio" value="No" />
                No
              </label>
            </div>
          </div>
          <div className="enabled-table-text">{tableEnablingQuestion}</div>
          <div className="over-past-30-days">Over the past 30 days...</div>
        </caption>
        <thead style={{ pointerEvents: condition === "Yes" && "none" }}>
          <tr>
            <th className="questions">Question</th>
            <th key="never">Never</th>
            <th key="sometimes" colSpan={4}>
              Sometimes
            </th>
            <th key="Always" colSpan={2}>
              Always
            </th>
          </tr>
        </thead>
        <tbody style={{ pointerEvents: condition === "Yes" && "none" }}>
          {questions.map((question) => (
            <tr key={question.id}>
              <td>{question.text}</td>
              {options.map((option) => (
                <td key={option.value}>
                  <Controller
                    name={question.id}
                    control={control}
                    render={({ field }) => (
                      <RadioWrapper>
                        <input
                          {...field}
                          type="radio"
                          value={option.value}
                          checked={field.value === option.value.toString()}
                        />
                        <label>{option?.label}</label>
                      </RadioWrapper>
                    )}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </section>
  );
};

export default Section;
