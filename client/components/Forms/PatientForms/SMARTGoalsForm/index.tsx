import { Controller, FormProvider } from "react-hook-form";
import moment from "moment";
import { useRouter } from "next/router";
import useZodForm from "@/utils/hooks/useZodForm";
import { useMutationData } from "@/utils/hooks/useMutationData";
import CommonServices from "@/services/CommonServices";
import CustomTextArea from "@/components/CustomTextArea";
import FormHeader from "@/components/FormsHeader";
import Button from "@/components/Button";
import styles from "./style.module.scss";
import {
  CLIENT_INFO_QUESTIONS,
  GOAL_THEMES,
  TIMEFRAMES,
  FORM_HEADER,
  SECTION_INSTRUCTIONS,
  smartGoalsSchema,
} from "./constants";

const SMARTGoalForms = ({ formData }) => {
  const router = useRouter();
  const { client_id, session_id } = router.query;
  
  const defaultValues = {
    client_name:
      formData?.client_first_name + " " + formData?.client_last_name,
    date: moment().format("DD/MM/YYYY"),
    intake_date: moment(formData?.intake_date).format("DD/MM/YYYY"),
    service_description: formData?.service_name,
    client_goal_theme: "",
    goal_theme_other: "",
    timeframe: "",
  };

  // Mutation for submitting the form
  const submitMutation = useMutationData(
    ["submitSMARTGoalForm"],
    async (payload) => {
      if (!client_id || !session_id) {
        throw new Error("Required parameters are missing from the route.");
      }
      const formPayload = {
        session_id: session_id,
        client_id: client_id,
        client_goal_theme: payload.client_goal_theme,
        goal_theme_other: payload.goal_theme_other || "",
        timeframe: payload.timeframe,
      };
      return await CommonServices.submitSMARTGoalForm(formPayload);
    },
    undefined,
    () => {
      router.push("/patient-forms/form-submission");
    }
  );

  const methods = useZodForm(
    smartGoalsSchema,
    submitMutation.mutate,
    defaultValues
  );

  const watchedGoalTheme = methods.watch("client_goal_theme");
  const selectedThemeData = GOAL_THEMES.find(
    (theme) => theme.id === watchedGoalTheme
  );

  return (
    <div className={styles["smart-goals-container"]}>
      <FormHeader
        tittle={FORM_HEADER.title}
        description={FORM_HEADER.description}
      />
      <h1>Smart Goals</h1>
      <h3 className={styles["client-info-title"]}>Client Info</h3>

      <FormProvider {...methods}>
        <form onSubmit={methods.onFormSubmit}>
          <div className={styles["smart-goals"]}>
            {CLIENT_INFO_QUESTIONS?.map((question, index) => {
              return (
                <div key={question?.id}>
                  <label>{question?.label} </label>
                  <input
                    name={question?.id}
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
          <div className={styles["goal-theme-section"]}>
            <h3 className={styles["section-title"]}>Client Goal Theme</h3>
            <p className={styles["section-instruction"]}>
              {SECTION_INSTRUCTIONS.goalTheme}
            </p>
            <div className={styles["goal-theme-options"]}>
              {GOAL_THEMES.map((theme) => (
                <div key={theme.id} className={styles["goal-theme-option"]}>
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
                          className={styles["goal-theme-radio"]}
                        />
                        <label htmlFor={theme.id} className={styles["goal-theme-label"]}>
                          {theme.label}
                        </label>
                      </>
                    )}
                  />
                </div>
              ))}
            </div>
            {watchedGoalTheme === "something_else" && (
              <div className={styles["goal-theme-other-input"]}>
                <CustomTextArea
                  label="Goal Theme"
                  name="goal_theme_other"
                  control={methods.control}
                  defaultValue={""}
                  isError={!!methods.errors?.goal_theme_other}
                  disabled={false}
                  helperText={methods.errors?.goal_theme_other?.message || ""}
                  placeholder="Please describe your goal..."
                  rows={4}
                />
              </div>
            )}
          </div>

          {/* Description Section */}
          {watchedGoalTheme && selectedThemeData?.description && (
            <div className={styles["description-section"]}>
              <h3 className={styles["section-title"]}>Description</h3>
              <p className={styles["description-text"]}>
                {selectedThemeData.description}
              </p>
            </div>
          )}

          {/* Timeframe Section */}
          <div className={styles["timeframe-section"]}>
            <h3 className={styles["section-title"]}>Timeframe</h3>
            <div className={styles["timeframe-options"]}>
              {TIMEFRAMES.map((timeframe) => (
                <div key={timeframe.id} className={styles["timeframe-option"]}>
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
                          className={styles["timeframe-radio"]}
                        />
                        <label htmlFor={timeframe.id} className={styles["timeframe-label"]}>
                          {timeframe.label}
                        </label>
                      </>
                    )}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className={styles["submit-button-wrapper"]}>
            <Button type="submit" variant="primary" loading={submitMutation.isPending}>
              Submit
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};
export default SMARTGoalForms;
