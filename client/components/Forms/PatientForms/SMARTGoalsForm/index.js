import { Controller, FormProvider, useForm } from "react-hook-form";
import moment from "moment";
import CustomInputField from "../../../CustomInputField";
import { SMARTGoalsContainer } from "./style";
import CustomButton from "../../../CustomButton";
import { toast } from "react-toastify";
import { api } from "../../../../utils/auth";
import { useRouter } from "next/router";
import CommonServices from "../../../../services/CommonServices";
import { useState, useEffect } from "react";
import CustomMultiSelect from "../../../CustomMultiSelect";
import CustomTextArea from "../../../CustomTextArea";
import FormHeader from "../../../FormsHeader";

const questions = [
  { id: "client_name", label: "Client Name: ", type: "string" },
  {
    id: "service_description",
    label: "Service Descritption: ",
    type: "string",
  },
  { id: "date", label: "Date: ", type: "text" },
  { id: "intake_date", label: "Intake Date: ", type: "text" },
];

const ratings = new Array(10).fill(0).map((_, i) => {
  return { label: `${i + 1}`, value: `${i + 1}` };
});

const dropdownOptions = {
  common: [
    { label: "Not Achieved", value: "not_achieved" },
    { label: "Needs Improvement", value: "needs_improvement" },
    { label: "Reviewed and Met", value: "reviewed_and_met" },
    { label: "Completed", value: "completed" },
  ],
  ratings: ratings,
};

const goalThemes = [
  {
    id: "feeling_less_anxious_about_work",
    label: "Feeling less anxious about work",
    description: "This goal helps reduce distress linked to work situations.",
  },
  {
    id: "sleeping_better",
    label: "Sleeping better",
    description: "This goal helps improve sleep quality and establish healthy sleep patterns.",
  },
  {
    id: "managing_stress",
    label: "Managing stress",
    description: "This goal helps develop effective stress management strategies and coping skills.",
  },
  {
    id: "return_to_work_readiness",
    label: "Return to work readiness",
    description: "This goal helps prepare for a successful return to the workplace.",
  },
  {
    id: "something_else",
    label: "Something else (please describe)",
    description: "",
  },
];

const timeframes = [
  { id: "2_4_weeks", label: "2-4 weeks" },
  { id: "6_8_weeks", label: "6-8 weeks" },
  { id: "not_sure_yet", label: "Not sure yet" },
];

const SMARTGoalForms = ({ formData }) => {
  const methods = useForm({
    defaultValues: {
      client_name:
        formData?.client_first_name + " " + formData?.client_last_name,
      date: moment().format("DD/MM/YYYY"),
      intake_date: moment(formData?.intake_date).format("DD/MM/YYYY"),
      service_description: formData?.service_name,
      client_goal_theme: "",
      goal_theme_other: "",
      timeframe: "",
    },
  });
  const [loading, setLoading] = useState(false);
  const [selectedGoalTheme, setSelectedGoalTheme] = useState("");
  const router = useRouter();
  
  const watchedGoalTheme = methods.watch("client_goal_theme");
  
  useEffect(() => {
    setSelectedGoalTheme(watchedGoalTheme || "");
  }, [watchedGoalTheme]);
  
  const selectedThemeData = goalThemes.find(
    (theme) => theme.id === selectedGoalTheme
  );
  
  const onSubmit = async (data) => {
    const { client_id, session_id } = router.query;
    const {
      client_name,
      date,
      intake_date,
      service_description,
      ...payloadData
    } = data;
    try {
      setLoading(true);
      if (!client_id || !session_id) {
        toast.error("Required parameters are missing from the route.");
        setLoading(false);
        return;
      }
      const payload = {
        session_id: session_id,
        client_id: client_id,
        ...payloadData,
      };
      const response = await CommonServices.submitSMARTGoalForm(payload);
      if (response.status === 200) {
        toast.success(
          response?.data?.message || "Form submitted successfully!"
        );
        router.push("/patient-forms/form-submission");
        methods.reset();
      }
    } catch (error) {
      console.log("Error while submitting the form:", error);
      toast.error(error?.message || "Error while submitting the form");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SMARTGoalsContainer>
      <FormHeader
        tittle={"Smart Goal Tracker Questionnaire"}
        description={
          " Structured -2 to +2 scale questionnaire to monitor client progresssupport therapy adjustments and visualize weekly mental health changes"
        }
      />
      <h1>Smart Goals</h1>
      <h3>Client Info</h3>

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <div className="smart-goals">
            {questions?.map((question, index) => {
              return (
                <div
                  key={question?.id}
                  style={{ width: "100%", marginBottom: "10px" }}
                >
                  <label style={{ width: "50%", fontWeight: 500 }}>
                    {question?.label}{" "}
                  </label>
                  <input
                    name={question?.id}
                    style={{
                      textTransform: "capitalize",
                      border: "none",
                      background: "transparent",
                      width: "50%",
                    }}
                    disabled
                    label={question?.label}
                    type={question?.type}
                    {...methods.register(question?.id)}
                  />
                </div>
              );
            })}
          </div>

          {/* Client Goal Theme Section */}
          <div className="goal-theme-section">
            <h3 className="section-title">Client Goal Theme</h3>
            <p className="section-instruction">
              Please select the goal that best fits what you want to work on right now.
            </p>
            <div className="goal-theme-options">
              {goalThemes.map((theme) => (
                <div key={theme.id} className="goal-theme-option">
                  <Controller
                    name="client_goal_theme"
                    control={methods.control}
                    render={({ field }) => (
                      <>
                        <input
                          type="radio"
                          id={theme.id}
                          {...field}
                          value={theme.id}
                          checked={field.value === theme.id}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            setSelectedGoalTheme(e.target.value);
                          }}
                          className="goal-theme-radio"
                        />
                        <label htmlFor={theme.id} className="goal-theme-label">
                          {theme.label}
                        </label>
                      </>
                    )}
                  />
                </div>
              ))}
            </div>
            {selectedGoalTheme === "something_else" && (
              <div className="goal-theme-other-input">
                <CustomTextArea
                  name="goal_theme_other"
                  placeholder="Please describe your goal..."
                  rows={4}
                />
              </div>
            )}
          </div>

          {/* Description Section */}
          {selectedGoalTheme && selectedThemeData?.description && (
            <div className="description-section">
              <h3 className="section-title">Description</h3>
              <p className="description-text">
                {selectedThemeData.description}
              </p>
            </div>
          )}

          {/* Timeframe Section */}
          <div className="timeframe-section">
            <h3 className="section-title">Timeframe</h3>
            <div className="timeframe-options">
              {timeframes.map((timeframe) => (
                <div key={timeframe.id} className="timeframe-option">
                  <Controller
                    name="timeframe"
                    control={methods.control}
                    render={({ field }) => (
                      <>
                        <input
                          type="radio"
                          id={timeframe.id}
                          {...field}
                          value={timeframe.id}
                          checked={field.value === timeframe.id}
                          className="timeframe-radio"
                        />
                        <label htmlFor={timeframe.id} className="timeframe-label">
                          {timeframe.label}
                        </label>
                      </>
                    )}
                  />
                </div>
              ))}
            </div>
          </div>

          <CustomButton title="Submit" type="submit" customClass="primary" />
        </form>
      </FormProvider>
    </SMARTGoalsContainer>
  );
};
export default SMARTGoalForms;
