import React, { useEffect } from "react";
import { Controller, useWatch } from "react-hook-form";
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
  setValue,
  name,
}) => {
  const nameValue = useWatch({ control, name });
  useEffect(() => {
    if (nameValue === "No") {
      questions.forEach((question) => {
        setValue(question.id, "0");
      });
    }
  }, [nameValue, questions, setValue]);

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
                <input {...register(name)} type="radio" value="Yes" required />
                Yes
              </label>
              <label>
                <input {...register(name)} type="radio" value="No" required />
                No
              </label>
            </div>
          </div>
          <div className="enabled-table-text">{tableEnablingQuestion}</div>
          <div className="over-past-30-days">Over the past 30 days...</div>
        </caption>
        <thead style={{ pointerEvents: nameValue === "No" ? "none" : "auto" }}>
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
        <tbody style={{ pointerEvents: nameValue === "No" ? "none" : "auto" }}>
          {questions.map((question) => (
            <tr key={question.id}>
              <td>{question.text}</td>
              {options.map((option) => (
                <td key={option.value}>
                  <Controller
                    name={question.id}
                    rules={{ required: "This field is required" }}
                    control={control}
                    render={({ field }) => (
                      <RadioWrapper>
                        <input
                          {...field}
                          required
                          type="radio"
                          value={nameValue == "No" ? "0" : option.value}
                          checked={field.value === option.value.toString()}
                          disabled={nameValue === "No"}
                          onChange={(e) => {
                            field.onChange(
                              nameValue == "No" ? 0 : e.target.value
                            );
                          }}
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
