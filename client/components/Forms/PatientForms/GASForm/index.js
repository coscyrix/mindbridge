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

const GasForm = () => {
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
      goal: null,
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

  const selectedGoal = useWatch({ control, name: "goal" })?.value || "";
  useEffect(() => {
    if (selectedGoal && selectedGoal !== goalValue) {
      const newQuestions = gasQuestionBank[selectedGoal] || [];
      const newDefaults = {
        goal: {
          label: treatment_goals.find((g) => g.value === selectedGoal)?.label,
          value: selectedGoal,
        },
      };
      newQuestions.forEach((q) => {
        newDefaults[q.name] = undefined;
      });
      reset(newDefaults); 
      setGoalValue(selectedGoal);
    }
  }, [selectedGoal]);
  

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
        session_id: 1, // This should be passed as a prop or from context
        client_id: 1, // This should be passed as a prop or from context
      };
      
      const response = await CommonServices.submitGASForm(payload);
      console.log("Form submitted successfully", response);
      
      // Reset form after successful submission
      reset();
      setGoalValue(null);
      
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitError(error.message || "Failed to submit form");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <GasFormWrapper key={goalValue || "initial"}>
        <div className="main-bg">
          <div className="Image-wrapper">
            <img
              height={200}
              width={200}
              src="/assets/images/Mindbridge_logo.svg"
              alt="MindBridge Logo"
            />
            <div className="Heading-description">
              <h2>Goal Progress Tracker Questionnaire</h2>
              <div>
                Structured -2 to +2 scale questionnaire to monitor client
                progress, support therapy adjustments, and visualize weekly
                mental health changes.
              </div>
            </div>
          </div>

          <div className="select-options">
            <Controller
              name="goal"
              control={control}
              render={({ field }) => (
                <>
                  <CustomMultiSelect
                    {...field}
                    options={treatment_goals}
                    isMulti={false}
                    placeholder="Select a treatment goal"
                    error={errors?.goal?.message}
                  />
                  {errors.goal && (
                    <p className="error-text">{errors.goal.message}</p>
                  )}
                </>
              )}
            />
          </div>

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
                    <label className="question-label">{`Q${ind + 1}. ${question}`}</label>
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
                <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>
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
