import { Controller, FormProvider, useForm } from "react-hook-form";
import moment from "moment";
import CustomInputField from "../../../CustomInputField";
import { SMARTGoalsContainer } from "./style";
import CustomButton from "../../../CustomButton";
import { toast } from "react-toastify";
import { api } from "../../../../utils/auth";
import { useRouter } from "next/router";
import CommonServices from "../../../../services/CommonServices";
import { useState } from "react";
import CustomMultiSelect from "../../../CustomMultiSelect";
import CustomTextArea from "../../../CustomTextArea";

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

const SMARTGoalForms = ({ formData }) => {
  const methods = useForm({
    defaultValues: {
      client_name:
        formData?.client_first_name + " " + formData?.client_last_name,
      date: moment().format("DD/MM/YYYY"),
      intake_date: moment(formData?.intake_date).format("DD/MM/YYYY"),
      service_description: formData?.service_name,
    },
  });
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
          <table className="SmartGoalClientTable">
            <thead>
              <tr>
                <th>SMART Goal</th>
                <th style={{ minWidth: "260px" }}>
                  Goal Description: 1st Phase
                </th>
                <th>2nd Phase Review</th>
                <th>3rd Phase Review</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  id: "specific",
                  label: "Specific",
                  placeholder:
                    "I want to feel more comfortable and less anxious during group meeting.",
                },
                {
                  id: "measurable",
                  label: "Measurable",
                  placeholder:
                    "I will rate my anxiety on a scale of 1 - 10 before and after each meeting.",
                },
                {
                  id: "achievable",
                  label: "Achievable",
                  placeholder:
                    "I will start with smaller meetings and gradually build upto larger ones.",
                },
                {
                  id: "relevant",
                  label: "Relevant",
                  placeholder:
                    "This will help me become more engaged at work and contribute more to projects.",
                },
                {
                  id: "time_bound",
                  label: "Time-Bound",
                  placeholder:
                    "I will achieve this within 8 weeks by attending at least 4 meetings.",
                },
              ]?.map((item, index) => {
                return (
                  <tr key={index}>
                    <td>{item.label}</td>
                    <td>
                      <CustomInputField
                        name={`${item.id}_1st_phase`}
                        type="string"
                        placeholder={item?.placeholder}
                      />
                    </td>
                    <td>
                      <Controller
                        name={`${item.id}_2nd_phase`}
                        control={methods.control}
                        render={({ field }) => (
                          <CustomMultiSelect
                            {...field}
                            options={
                              item.id == "measurable"
                                ? dropdownOptions?.ratings
                                : dropdownOptions?.common
                            }
                            placeholder="Select 2nd Phase"
                            isMulti={false}
                            onChange={(selectedOption) =>
                              field.onChange(selectedOption?.label)
                            } // Store only the label
                            value={
                              field.value
                                ? {
                                    label: field.value, // Convert stored label back to an object
                                    value:
                                      item.id == "measurable"
                                        ? field.value
                                        : field.value
                                            .toLowerCase()
                                            .replace(/\s/g, "_"),
                                  }
                                : null
                            }
                          />
                        )}
                      />
                    </td>
                    <td>
                      <Controller
                        name={`${item.id}_3rd_phase`}
                        control={methods.control}
                        render={({ field }) => (
                          <CustomMultiSelect
                            {...field}
                            options={
                              item.id == "measurable"
                                ? dropdownOptions?.ratings
                                : dropdownOptions?.common
                            }
                            placeholder="Select 3rd Phase"
                            isMulti={false}
                            onChange={(selectedOption) =>
                              field.onChange(selectedOption?.label)
                            } // Store only the label
                            value={
                              field.value
                                ? {
                                    label: field.value, // Convert stored label back to an object
                                    value:
                                      item.id == "measurable"
                                        ? field.value
                                        : field.value
                                            .toLowerCase()
                                            .replace(/\s/g, "_"),
                                  }
                                : null
                            }
                          />
                        )}
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
