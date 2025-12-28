import React, { useState } from "react";
import { WHODasFormContainer } from "./styles";
import { useForm, Controller, FormProvider } from "react-hook-form";
import CustomButton from "../../../CustomButton";
import { color } from "echarts";
import { mapFormDataToQuestions } from "../../../../utils/helper";
import { useRouter } from "next/router";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { api } from "../../../../utils/auth";
import CustomInputField from "../../../CustomInputField";
import CommonServices from "../../../../services/CommonServices";
import FormHeader from "../../../FormsHeader";

const allQuestions = [
  {
    questionType: "radio",
    category: "Understanding and Communicating",
    questions: [
      {
        questionId: "item1",
        questionNumber: "D1.1",
        questionText: "Concentrating on doing something for ten minutes?",
      },
      {
        questionId: "item2",
        questionNumber: "D1.2",
        questionText: "Remembering to do important things?",
      },
      {
        questionId: "item3",
        questionNumber: "D1.3",
        questionText:
          "Analysing and finding solutions to problems in day-to-day life?",
      },
      {
        questionId: "item4",
        questionNumber: "D1.4",
        questionText:
          "Learning a new task, for example, learning how to get to a new place?",
      },
      {
        questionId: "item5",
        questionNumber: "D1.5",
        questionText: "Generally understanding what people say?",
      },
      {
        questionId: "item6",
        questionNumber: "D1.6",
        questionText: "Starting and maintaining a conversation?",
      },
    ],
  },
  {
    questionType: "radio",
    category: "Getting Around",
    questions: [
      {
        questionId: "item7",
        questionNumber: "D2.1",
        questionText: "Standing for long periods such as 30 minutes?",
      },
      {
        questionId: "item8",
        questionNumber: "D2.2",
        questionText: "Standing up from sitting down?",
      },
      {
        questionId: "item9",
        questionNumber: "D2.3",
        questionText: "Moving around inside your home?",
      },
      {
        questionId: "item10",
        questionNumber: "D2.4",
        questionText: "Getting out of your home?",
      },
      {
        questionId: "item11",
        questionNumber: "D2.5",
        questionText:
          "Walking a long distance such as a kilometre [or equivalent]?",
      },
    ],
  },
  {
    questionType: "radio",
    category: "Self-Care",
    questions: [
      {
        questionId: "item12",
        questionNumber: "D3.1",
        questionText: "Washing your whole body?",
      },
      {
        questionId: "item13",
        questionNumber: "D3.2",
        questionText: "Getting dressed?",
      },
      {
        questionId: "item14",
        questionNumber: "D3.3",
        questionText: "Eating?",
      },
      {
        questionId: "item15",
        questionNumber: "D3.4",
        questionText: "Staying by yourself for a few days?",
      },
    ],
  },
  {
    questionType: "radio",
    category: "Getting Along with People",
    questions: [
      {
        questionId: "item16",
        questionNumber: "D4.1",
        questionText: "Dealing with people you do not know?",
      },
      {
        questionId: "item17",
        questionNumber: "D4.2",
        questionText: "Maintaining a friendship?",
      },
      {
        questionId: "item18",
        questionNumber: "D4.3",
        questionText: "Getting along with people who are close to you?",
      },
      {
        questionId: "item19",
        questionNumber: "D4.4",
        questionText: "Making new friends?",
      },
      {
        questionId: "item20",
        questionNumber: "D4.5",
        questionText: "Sexual activities?",
      },
    ],
  },
  {
    questionType: "radio",
    category: "Life Activities",
    questions: [
      {
        questionId: "item21",
        questionNumber: "D5.1",
        questionText: "Taking care of your household responsibilities?",
      },
      {
        questionId: "item22",
        questionNumber: "D5.2",
        questionText: "Doing most important household tasks well?",
      },
      {
        questionId: "item23",
        questionNumber: "D5.3",
        questionText:
          "Getting all the household work done that you needed to do?",
      },
      {
        questionId: "item24",
        questionNumber: "D5.4",
        questionText: "Getting your household work done as quickly as needed?",
      },
      {
        questionId: "item25",
        questionNumber: "D5.5",
        questionText: "Your day-to-day work/school?",
      },
      {
        questionId: "item26",
        questionNumber: "D5.6",
        questionText: "Doing your most important work/school tasks well?",
      },
      {
        questionId: "item27",
        questionNumber: "D5.7",
        questionText: "Getting all the work done that you need to do?",
      },
      {
        questionId: "item28",
        questionNumber: "D5.8",
        questionText: "Getting your work done as quickly as needed?",
      },
    ],
  },
  {
    questionType: "radio",
    category: "Participation in Society",
    questions: [
      {
        questionId: "item29",
        questionNumber: "D6.1",
        questionText:
          "How much of a problem did you have in joining in community activities (for example, festivities, religious or other activities) in the same way as anyone else can?",
      },
      {
        questionId: "item30",
        questionNumber: "D6.2",
        questionText:
          "How much of a problem did you have because of barriers or hindrances in the world around you?",
      },
      {
        questionId: "item31",
        questionNumber: "D6.3",
        questionText:
          "How much of a problem did you have living with dignity because of the attitudes and actions of others?",
      },
      {
        questionId: "item32",
        questionNumber: "D6.4",
        questionText:
          "How much time did you spend on your health condition, or its consequences?",
      },
      {
        questionId: "item33",
        questionNumber: "D6.5",
        questionText:
          "How much have you been emotionally affected by your health condition?",
      },
      {
        questionId: "item34",
        questionNumber: "D6.6",
        questionText:
          "How much has your health been a drain on the financial resources of you or your family?",
      },
      {
        questionId: "item35",
        questionNumber: "D6.7",
        questionText:
          "How much of a problem did your family have because of your health problems?",
      },
      {
        questionId: "item36",
        questionNumber: "D6.8",
        questionText:
          "How much of a problem did you have in doing things by yourself for relaxation or pleasure?",
      },
    ],
  },
  {
    questionType: "input",
    category: "Impact of Health Conditions on Daily Life",
    questions: [
      {
        questionId: "difficultyDays",
        questionNumber: "H1",
        questionText:
          "Overall, in the past 30 days, how many days were these difficulties present?",
      },
      {
        questionId: "unableDays",
        questionNumber: "H2",
        questionText:
          "In the past 30 days, for how many days were you totally unable to carry out your usual activities or work because of any health condition?",
      },
      {
        questionId: "healthConditionDays",
        questionNumber: "H3",
        questionText:
          "In the past 30 days, not counting the days that you were totally unable, for how many days did you cut back or reduce your usual activities or work because of any health condition?",
      },
    ],
  },
];

const WHODASForm = () => {
  const methods = useForm();
  const {
    control,
    formState: { errors },
    reset,
  } = methods;
  const router = useRouter();
  const { client_id, session_id } = router.query;

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        session_id: session_id,
        client_id: client_id,
      };
      if (!client_id || !session_id) {
        toast.error("Required parameters are missing from the route.");
        return;
      }
      const response = await CommonServices.submitWHODASForm(payload);
      if (response.status === 200) {
        toast.success("Form submitted successfully!");
        router.push("/patient-forms/form-submission");
        reset();
      }
    } catch (error) {
      console.log(":: Error in WHODAS Form", error);
    }
  };
  return (
    <WHODasFormContainer>
      <FormHeader
        tittle={"WHODAS Tracker Questionnaire"}
        description={
          "The WHODAS 2.0 is a Patient-Reported-Outcome (PRO) instrument that uses 36 question to asses the global health status of patients across 6 health domains, independent of disease"
        }
      />
      <h1>WHODAS</h1>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <table className="questions-table">

            <tbody>
              {allQuestions.map((questionCategory, index) => (
                <React.Fragment key={index}>
                  <tr>
                    <td colSpan={7} style={{ fontWeight: "bold" }}>
                      {questionCategory?.category}
                    </td>
                  </tr>
                  {/* if last then dont show the table */}
                  {index !== allQuestions.length - 1 && (
                    <tr style={{ backgroundColor: "#f5f5f5", fontWeight: "bold" }}>
                      <th></th>
                      <th>Difficulties due to health conditions</th>
                      <th>None</th>
                      <th>Mild</th>
                      <th>Moderate</th>
                      <th>Severe</th>
                      <th>Extreme or cannot do</th>
                    </tr>
                  )}
                  
                  {questionCategory.questions.map((question) => (
                    <React.Fragment key={question.id}>
                      <tr>
                        <td>{question.questionNumber}</td>
                        <td className="alignLeft">{question.questionText}</td>
                        {questionCategory?.questionType === "radio" ? (
                          [1, 2, 3, 4, 5].map((value) => (
                            <td key={value}>
                              <Controller
                                name={question.questionId}
                                control={control}
                                render={({ field }) => {
                                  return (
                                    <div>
                                      <input
                                        {...field}
                                        type="radio"
                                        value={value}
                                        required
                                      />
                                    </div>
                                  );
                                }}
                              />
                            </td>
                          ))
                        ) : (
                          <td colSpan={"5"}>
                            <Controller
                              name={question?.questionId}
                              control={control}
                              render={({ field }) => {
                                return (
                                  <CustomInputField
                                    {...field}
                                    type="number"
                                    required
                                  />
                                );
                              }}
                            />
                          </td>
                        )}
                      </tr>
                    </React.Fragment>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          <CustomButton title="Submit" type="submit" customClass="primary" />
        </form>
      </FormProvider>
    </WHODasFormContainer>
  );
};

export default WHODASForm;
