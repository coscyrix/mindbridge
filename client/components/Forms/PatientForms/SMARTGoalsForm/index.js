import { Controller, FormProvider, useForm } from "react-hook-form";
import CustomInputField from "../../../CustomInputField";
import { SMARTGoalsContainer } from "./style";
import CustomButton from "../../../CustomButton";
import { toast } from "react-toastify";
import { api } from "../../../../utils/auth";
import { useRouter } from "next/router";
import { useState } from "react";

const questions = [
  { id: "client_name", label: "Enter Client Name", type: "string" },
  {
    id: "service_description",
    label: "Enter Service Descritptions",
    type: "string",
  },
  { id: "date", label: "Enter Date", type: "date" },
  { id: "intake_date", label: "Enter Intake Date", type: "date" },
];

const SMARTGoalForms = () => {
  const methods = useForm();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
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
      const response = await api.post("/feedback/smart-goal", payload);
      if (response.status === 200) {
        toast.success("Form submitted successfully!");
        methods.reset();
      }
    } catch (error) {
      console.log("Error while submitting the form:", error);
      toast.error("Error while submitting the form");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SMARTGoalsContainer>
      <h1>Smart Goals</h1>
      <p>Client Info</p>

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <div className="smart-goals">
            {questions?.map((question, index) => {
              return (
                <div key={question?.id}>
                  <Controller
                    name={question?.id}
                    render={({ field }) => {
                      return (
                        <CustomInputField
                          style={{ borderRadius: "5px" }}
                          name={question?.id}
                          label={question?.label}
                          type={question?.type}
                          {...field}
                        />
                      );
                    }}
                  />
                </div>
              );
            })}
          </div>
          <table className="SmartGoalClientTable">
            <thead>
              <tr>
                <th>SMART Goal</th>
                <th>Goal Description: 1st Phase</th>
                <th>2nd Phase Review</th>
                <th>3rd Phase Review</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: "specific", label: "Specific" },
                { id: "specific", label: "Measurable" },
                { id: "achievable", label: "Achievable" },
                { id: "relevant", label: "Relevant" },
                { id: "time_bound", label: "Time-Bound" },
              ]?.map((item, index) => {
                return (
                  <tr key={index}>
                    <td>{item.label}</td>
                    <td>
                      <CustomInputField
                        name={`${item.id}_1st_phase`}
                        type="string"
                        placeholder="Enter 1st Phase"
                      />
                    </td>
                    <td>
                      <CustomInputField
                        name={`${item.id}_2nd_phase`}
                        type="string"
                        placeholder="Enter 2nd Phase"
                      />
                    </td>
                    <td>
                      <CustomInputField
                        name={`${item.id}_3rd_phase`}
                        type="string"
                        placeholder="Enter 3rd Phase"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <CustomButton title="Submit" type="submit" customClass="primary" />
        </form>
      </FormProvider>
    </SMARTGoalsContainer>
  );
};
export default SMARTGoalForms;
