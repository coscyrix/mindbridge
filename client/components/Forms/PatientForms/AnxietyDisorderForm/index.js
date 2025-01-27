import React, { useState, useEffect } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { AnxietyDisorderFormContainer } from "./style";
import CustomButton from "../../../CustomButton";
import { api } from "../../../../utils/auth";
import { toast } from "react-toastify";
import Spinner from "../../../common/Spinner";
import { useRouter } from "next/router";

const anxietyQuestions = [
  { id: "nervous", label: "Feeling nervous, anxious, or on edge?" },
  { id: "controlWorry", label: "Not being able to stop or control worrying?" },
  { id: "tooMuchWorry", label: "Worrying too much about different things?" },
  { id: "relaxing", label: "Trouble relaxing?" },
  { id: "restless", label: "Being so restless that it is hard to sit still?" },
  { id: "irritable", label: "Becoming easily annoyed or irritable?" },
  {
    id: "feelingAfraid",
    label: "Feeling afraid as if something awful might happen?",
  },
];

const selectOptions = [
  { value: 0, label: "Not at all" },
  { value: 1, label: "Several days" },
  { value: 2, label: "More than half the days" },
  { value: 3, label: "Nearly every day" },
];

const AnxietyDisorderForm = () => {
  const [loading, setLoading] = useState(false);
  const methods = useForm({
    defaultValues: anxietyQuestions.reduce(
      (acc, question, index) => ({ ...acc, [`item${index + 1}`]: null }),
      { total_score: 0 }
    ),
  });

  const router = useRouter();
  const {
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = methods;

  const watchFields = watch();

  useEffect(() => {
    const total = Object.keys(watchFields)
      .filter((key) => key.startsWith("item"))
      .reduce((sum, key) => sum + (parseInt(watchFields[key]) || 0), 0);

    if (methods.getValues("total_score") !== total) {
      setValue("total_score", total, { shouldDirty: false });
    }
  }, [watchFields, setValue, methods]);

  const onSubmit = async (data) => {
    const { client_id, session_id } = router.query;
    try {
      setLoading(true);
      if (!client_id || !session_id) {
        toast.error("Required parameters are missing from the route.");
        setLoading(false);
        return;
      }
      const { total_score, ...payloadData } = data;
      const payload = {
        session_id,
        client_id,
        ...payloadData,
      };
      const response = await api.post("/feedback/gad7", payload);
      if (response.status === 200) {
        toast.success("Form submitted successfully!");
        reset();
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error submitting the form");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnxietyDisorderFormContainer>
      <FormProvider {...methods}>
        <div className="anxiety-content">
          <form onSubmit={handleSubmit(onSubmit)}>
            <h2>Generalised Anxiety Disorder Questionnaire (GAD-7)</h2>
            <p>
              Over the last 2 weeks, how often have you been bothered by any of
              the following problems?
            </p>

            {anxietyQuestions.map((question, index) => (
              <div key={question.id} className="anxiety-content_select-fields">
                <label htmlFor={question.id} style={{ fontWeight: "bold" }}>
                  {question.label}
                </label>
                <Controller
                  name={`item${index + 1}`}
                  control={control}
                  rules={{ required: "Please select an option" }}
                  render={({ field }) => (
                    <div>
                      {selectOptions.map((option) => (
                        <label
                          key={option.value}
                          style={{ marginRight: "20px" }}
                        >
                          <input
                            type="radio"
                            value={option.value}
                            checked={field.value === option.value}
                            onChange={() => field.onChange(option.value)}
                          />
                          {option.label}
                        </label>
                      ))}
                      {errors[`item${index + 1}`] && (
                        <p style={{ color: "red", fontSize: "12px" }}>
                          {errors[`item${index + 1}`]?.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>
            ))}

            <div className="anxiety-content_input-fields-container">
              <div className="score-wrapper">
                <label>Total= </label>
                <input
                  {...methods.register("total_score")}
                  className="total_score"
                  disabled
                />
                <span>/21</span>
              </div>
              <input
                value={
                  watchFields.total_score >= 15
                    ? "Severe Anxiety"
                    : watchFields.total_score >= 10
                    ? "Moderate Anxiety"
                    : watchFields.total_score >= 5
                    ? "Mild Anxiety"
                    : "No Anxiety"
                }
                disabled
              />
            </div>

            <CustomButton
              title={
                loading ? <Spinner height="20px" width="20px" /> : "Submit"
              }
              type="submit"
              customClass="primary"
              style={{ padding: loading ? "7.5px 12.5px" : "10px 12.5px" }}
            />
          </form>
        </div>
      </FormProvider>
    </AnxietyDisorderFormContainer>
  );
};

export default AnxietyDisorderForm;
