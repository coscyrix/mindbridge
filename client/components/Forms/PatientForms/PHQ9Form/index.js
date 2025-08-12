import React, { useEffect, useState } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import CustomInputField from "../../../CustomInputField";
import { PHQFormContainer } from "./style";
import CustomButton from "../../../CustomButton";
import { toast } from "react-toastify";
import moment from "moment";
import { api } from "../../../../utils/auth";
import { getBaseURL } from "../../../../utils/helper";
import Spinner from "../../../common/Spinner";
import { useRouter } from "next/router";
import CommonServices from "../../../../services/CommonServices";
import FormHeader from "../../../FormsHeader";

const PHQ9Form = ({ client_name = "N/A" }) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const methods = useForm({
    defaultValues: {
      name: client_name,
      date: moment().format("DD/MM/YYYY"),
    },
  });

  const { handleSubmit, control, reset, register, setValue } = methods;

  const questions = [
    {
      id: "q1_little_interest",
      text: "Little interest or pleasure in doing things",
    },
    { id: "q2_feeling_down", text: "Feeling down, depressed, or hopeless" },
    {
      id: "q3_sleep_issues",
      text: "Trouble falling or staying asleep, or sleeping too much",
    },
    { id: "q4_low_energy", text: "Feeling tired or having little energy" },
    { id: "q5_appetite_issues", text: "Poor appetite or overeating" },
    {
      id: "q6_feeling_bad",
      text: "Feeling bad about yourself—or that you are a failure or have let yourself or your family down",
    },
    {
      id: "q7_concentration",
      text: "Trouble concentrating on things, such as reading the newspaper or watching television",
    },
    {
      id: "q8_fidgety",
      text: "Moving or speaking so slowly that other people could have noticed? Or the opposite—being so fidgety or restless that you have been moving around a lot more than usual",
    },
    {
      id: "q9_hurting_thoughts",
      text: "Thoughts that you would be better off dead or of hurting yourself in some way",
    },
  ];

  const onSubmit = async (data) => {
    const { client_id, session_id } = router.query;
    try {
      setLoading(true);
      if (!client_id || !session_id) {
        toast.error("Required parameters are missing from the route.");
        setLoading(false);
        return;
      }
      const { name, date, ...payloadData } = data;
      const payload = {
        session_id: session_id,
        client_id: client_id,
        ...payloadData,
      };
      const response = await CommonServices.submitPHQ9Form(payload);
      if (response.status === 200) {
        toast.success(data?.message || "Form submitted successfully!");
        router.push("/patient-forms/form-submission");
        reset();
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(error?.message || "Error submitting the form");
    } finally {
      setTimeout(() => setLoading(false), 3000);
    }
  };
  useEffect(() => {
    setValue("name", client_name);
  }, [client_name, setValue]);
  return (
    <PHQFormContainer>
      <FormHeader
        tittle={"Phq9 Tracker Questionnaire"}
        description={
          "The Patient Health Questionnaire-9 (PHQ-9) is a standardized instrument designed to help healthcare providers  assess the presence and severity of depression in patients"
        }
      />
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="phq9-form">
          <h1>Patient Health Questionnaire (PHQ-9)</h1>
          {/* Name and Date */}
          <div className="name-date-container">
            <div className="name-date-fields">
              <label>Name: </label>
              <input
                disabled
                label="Name"
                placeholder="Enter your name"
                customClass="remove-styling"
                {...register("name")}
              />
            </div>
            <div className="name-date-fields">
              <label>Date: </label>
              <input
                name="date"
                disabled
                label="Date"
                type="text"
                customClass="remove-styling"
                {...register("date")}
              />
            </div>
          </div>

          {/* Questions Table */}
          <table className="questions-table">
            <thead>
              <tr>
                <th>Question</th>
                <th>Not at all (0)</th>
                <th>Several days (1)</th>
                <th>More than half the days (2)</th>
                <th>Nearly every day (3)</th>
              </tr>
            </thead>
            <tbody>
              {questions.map(({ id, text }, index) => (
                <tr key={id}>
                  <td>{`${index + 1}. ${text}`}</td>
                  {["0", "1", "2", "3"].map((value) => (
                    <td key={`${id}-${value}`}>
                      <Controller
                        name={`item${index + 1}`}
                        control={control}
                        rules={{ required: "This field is required" }}
                        render={({ field }) => {
                          const radioId = `${id}-${value}`;
                          return (
                            <label htmlFor={radioId} className="radio-option">
                              <input
                                {...field}
                                id={radioId}
                                type="radio"
                                value={value}
                                checked={field.value === value}
                                onChange={field.onChange}
                                required
                              />
                            </label>
                          );
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Difficulty Section */}
          <div className="difficulty-section">
            <p>
              If you checked off any problems, how difficult have these problems
              made it for you to do your work, take care of things at home, or
              get along with other people?
            </p>
            <Controller
              name="difficulty_score"
              control={control}
              rules={{ required: "This field is required" }}
              render={({ field }) => (
                <div className="radio-group">
                  {[
                    { label: "Not difficult at all", value: 0 },
                    { label: "Somewhat difficult", value: 1 },
                    { label: "Very difficult", value: 2 },
                    { label: "Extremely difficult", value: 3 },
                  ].map((option, idx) => {
                    const uniqueId = `difficulty-${idx}`;
                    return (
                      <label key={uniqueId} htmlFor={uniqueId}>
                        <input
                          {...field}
                          id={uniqueId}
                          type="radio"
                          value={option.value} // Use option.value
                          checked={field.value === option.value} // Compare with option.value
                          onChange={() => field.onChange(option.value)} // Update the field value
                        />
                        {option.label}
                      </label>
                    );
                  })}
                </div>
              )}
            />
          </div>

          <CustomButton
            title={loading ? <Spinner height="20px" width="20px" /> : "Submit"}
            type="submit"
            customClass="primary"
            style={{ padding: loading ? "7.5px 12.5px" : "10px 12.5px" }}
          />
        </form>
      </FormProvider>
    </PHQFormContainer>
  );
};

export default PHQ9Form;
