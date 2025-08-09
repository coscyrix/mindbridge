import {
  useForm,
  Controller,
  useWatch,
  FormProvider,
} from "react-hook-form";
import CustomMultiSelect from "../../../CustomMultiSelect";
import { GasFormWrapper } from "./style";
import { gasQuestionBank, treatment_goals } from "../../../../utils/constants";
import CustomButton from "../../../CustomButton";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { createGasSchema } from "../../../../utils/validationSchema/validationSchema";
import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import CommonServices from "../../../../services/CommonServices";
import { toast } from "react-toastify";
import FormHeader from "../../../FormsHeader";
const GasForm = ({ client_id, session_id, goal }) => {
  const [goalValue, setGoalValue] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const schema = useMemo(() => {
    if (!goalValue) return null;
    return createGasSchema(goalValue);
  }, [goalValue]);

  const methods = useForm({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: {
      goal: {
        label: treatment_goals.find((g) => g.value === goal)?.label,
        value: goal,
      },
    },
    mode: "onSubmit",
  });

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = methods;

  const selectedGoal = goalValue || goal;
  useEffect(() => {
    if (goal && goal !== goalValue) {
      const newQuestions = gasQuestionBank[goal] || [];
      const newDefaults = {
        goal: {
          label: treatment_goals.find((g) => g.value === goal)?.label,
          value: goal,
        },
      };
      newQuestions.forEach((q) => {
        newDefaults[q.name] = undefined;
      });
      reset(newDefaults);
      setGoalValue(goal);
    }
  }, [goal]);

  const questions = gasQuestionBank[selectedGoal] || [];
  const answers = useWatch({ control });

  const totalScore = questions.reduce((sum, q) => {
    const val = answers?.[q.name];
    return sum + (val ? Number(val) : 0);
  }, 0);

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      
      const payload = {
        goal: data.goal?.value,
        responses: questions.map((q) => {
          const numericValue = data[q.name];
          const selectedOption = q.options.find(
            (opt) => opt.value === numericValue
          );
          return {
            question: q.question,
            selectedLabel: selectedOption?.label || null,
            score: numericValue,
          };
        }),
        session_id: Number(client_id), // This should be passed as a prop or from context
        client_id: Number(session_id), // This should be passed as a prop or from context
      };
      
      const response = await CommonServices.submitGASForm(payload);
      console.log("Form submitted successfully", response);
      toast.success(response?.data?.message);
      reset();
      setGoalValue(null);
      
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(error?.response?.data?.message);
      setSubmitError(error.message || "Failed to submit form");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <GasFormWrapper key={goalValue || "initial"}>
        <div className="main-bg">
          <FormHeader tittle={"Gas Form Tracker Questionnaire"} />

          {questions.length > 0 && (
            <div className="score-box">
              <div className="score-content">
                <div className="score-circle">
                  <CircularProgressbar
                    value={(totalScore / (questions.length * 2)) * 100}
                    text={`${totalScore}/${questions.length * 2}`}
                    styles={buildStyles({
                      textSize: "25px",
                      pathColor: "#00B2FF",
                      textColor: "#333",
                      trailColor: "#eee",
                    })}
                  />
                </div>
                <div className="score-text">
                  <div className="score-label">
                    <strong>Total GAS Score:</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {questions.length > 0 && (
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="questions-wrapper">
                {questions.map(({ question, name, options }, ind) => (
                  <div key={name} className="question-block">
                    <label className="question-label">{`Q${
                      ind + 1
                    }. ${question}`}</label>
                    <Controller
                      name={name}
                      control={control}
                      render={({ field }) => (
                        <div className="option-group">
                          {options.map((opt, idx) => (
                            <label key={idx} className="option-label">
                              <input
                                type="radio"
                                value={opt.value}
                                checked={Number(field.value) === opt.value}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                              {opt.label}
                            </label>
                          ))}
                        </div>
                      )}
                    />
                    {errors?.[name] && (
                      <p className="error-text">{errors[name]?.message}</p>
                    )}
                  </div>
                ))}
              </div>

              {submitError && (
                <div
                  className="error-message"
                  style={{ color: "red", marginBottom: "10px" }}
                >
                  {submitError}
                </div>
              )}
              <div className="button-group">
                <CustomButton title="Cancel" type="button" />
                <CustomButton
                  customClass="blue"
                  type="submit"
                  title={isSubmitting ? "Submitting..." : "Submit"}
                  disabled={isSubmitting}
                />
              </div>
            </form>
          )}
        </div>
      </GasFormWrapper>
    </FormProvider>
  );
};

export default GasForm;
