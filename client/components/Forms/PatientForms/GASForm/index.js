import { useForm, Controller, useWatch, FormProvider } from "react-hook-form";
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
import { useReferenceContext } from "../../../../context/ReferenceContext";

const GasForm = ({ client_id, session_id, target_outcome_id = 3 }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const { targetOutcomes } = useReferenceContext();
  const selectedOutcome = treatment_goals.find(
    (g) => g.id === Number(target_outcome_id)
  );

  const questions = gasQuestionBank[target_outcome_id] || [];
  const schema = useMemo(() => {
    if (!target_outcome_id) return null;
    return createGasSchema(target_outcome_id);
  }, [target_outcome_id]);

  const methods = useForm({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: {
      goal: {
        label: selectedOutcome?.label || "",
        value: Number(selectedOutcome?.id) || 0,
      },
      ...questions.reduce((acc, q) => {
        acc[q.name] = undefined;
        return acc;
      }, {}),
    },
    mode: "onSubmit",
  });
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = methods;

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
        goal:data.goal.label,
        target_outcome_id: Number(target_outcome_id),
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
        session_id: Number(session_id),
        client_id: Number(client_id),
      };

      const response = await CommonServices.submitGASForm(payload);
      toast.success(response?.data?.message);
      reset();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(error?.response?.data?.message || "Failed to submit form");
      setSubmitError(error.message || "Failed to submit form");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!selectedOutcome) return;

    const newDefaults = {
      goal: {
        label: selectedOutcome.label,
        value: Number(selectedOutcome.id),
      },
    };

    questions.forEach((q) => {
      newDefaults[q.name] = undefined;
    });

    reset(newDefaults);
  }, [selectedOutcome, questions, reset]);

  return (
    <FormProvider {...methods}>
      <GasFormWrapper>
        <div className="main-bg">
          <FormHeader
            tittle="Gas Form Tracker Questionnaire"
            description="Structured -2 to +2 scale questionnaire to monitor client progress, support therapy adjustments and visualize weekly mental health changes"
          />

          {questions.length > 0 && (
            <div className="score-box">
              <p>{selectedOutcome?.label}</p>
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

              <div className="button-group">
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
