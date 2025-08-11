import React, { use, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { PCL5FormContainer } from "./style";
import CustomButton from "../../../CustomButton";
import { toast } from "react-toastify";
import Spinner from "../../../common/Spinner";
import { api } from "../../../../utils/auth";
import { getBaseURL } from "../../../../utils/helper";
import { useRouter } from "next/router";
import CommonServices from "../../../../services/CommonServices";
import FormHeader from "../../../FormsHeader";

const questions = [
  {
    id: "q1_memories",
    text: "Repeated, disturbing, and unwanted memories of the stressful experience?",
  },
  {
    id: "q2_dreams",
    text: "Repeated, disturbing dreams of the stressful experience?",
  },
  {
    id: "q3_reliving",
    text: "Suddenly feeling or acting as if the stressful experience were actually happening again (as if you were actually back there reliving it)?",
  },
  {
    id: "q4_upset",
    text: "Feeling very upset when something reminded you of the stressful experience?",
  },
  {
    id: "q5_physical_reactions",
    text: "Having strong physical reactions when something reminded you of the stressful experience (for example, heart pounding, trouble breathing, sweating)?",
  },
  {
    id: "q6_avoid_memories",
    text: "Avoiding memories, thoughts, or feelings related to the stressful experience?",
  },
  {
    id: "q7_avoid_reminders",
    text: "Avoiding external reminders of the stressful experience (for example, people, places, conversations, activities, objects, or situations)?",
  },
  {
    id: "q8_memory_loss",
    text: "Trouble remembering important parts of the stressful experience?",
  },
  {
    id: "q9_negative_beliefs",
    text: "Having strong negative beliefs about yourself, other people, or the world (for example, having thoughts such as: I am bad, there is something seriously wrong with me, no one can be trusted, the world is completely dangerous)?",
  },
  {
    id: "q10_self_blame",
    text: "Blaming yourself or someone else for the stressful experience or what happened after it?",
  },
  {
    id: "q11_negative_feelings",
    text: "Having strong negative feelings such as fear, horror, anger, guilt, or shame?",
  },
  {
    id: "q12_loss_interest",
    text: "Loss of interest in activities that you used to enjoy?",
  },
  { id: "q13_distant", text: "Feeling distant or cut off from other people?" },
  {
    id: "q14_positive_feelings",
    text: "Trouble experiencing positive feelings (for example, being unable to feel happiness or have loving feelings for people close to you)?",
  },
  {
    id: "q15_irritable",
    text: "Irritable behavior, angry outbursts, or acting aggressively?",
  },
  {
    id: "q16_risky_behaviors",
    text: "Taking too many risks or doing things that could cause you harm?",
  },
  { id: "q17_superalert", text: "Being 'superalert' or watchful or on guard?" },
  { id: "q18_jumpy", text: "Feeling jumpy or easily startled?" },
  { id: "q19_concentration", text: "Having difficulty concentrating?" },
  { id: "q20_sleep", text: "Trouble falling or staying asleep?" },
];

const PCL5Form = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { handleSubmit, control, reset } = useForm();

  const onSubmit = async (data) => {
    const { client_id, session_id } = router.query;
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
        ...data,
      };
      const response = await CommonServices.submitPCL5Form(payload);
      if (response.status === 200) {
        toast.success("Form submitted successfully!");
        router.push("/patient-forms/form-submission");
        reset();
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(error?.message || "Error while submitting the form");
    } finally {
      setTimeout(() => setLoading(false), 3000);
    }
  };

  return (
    <PCL5FormContainer>
      <FormHeader
        tittle={"PCL Tracker Questionnaire"}
        description={
          " Structured -2 to +2 scale questionnaire to monitor client progresssupport therapy adjustments and visualize weekly mental health changes"
        }
      />
      <h1>PCL-5</h1>
      <p>
        Instructions: Below is a list of problems that people sometimes have in
        response to a very stressful experience. Keeping your worst event in
        mind, please read each problem carefully and then select one of the
        numbers to the right to indicate how much you have been bothered by that
        problem in the past month.
      </p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <table className="questions-table">
          <thead>
            <tr>
              <th>In the past month, how much were you bothered by:</th>
              <th>Not at all</th>
              <th>A little bit</th>
              <th>Moderately</th>
              <th>Quite a bit</th>
              <th>Extremely</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((question, index) => (
              <tr key={`item${index + 1}`}>
                <td>{`${index + 1}. ${question.text}`}</td>
                {[0, 1, 2, 3, 4].map((value) => (
                  <td key={value}>
                    <Controller
                      name={`item${index + 1}`}
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="radio"
                          value={value}
                          checked={field.value === value.toString()}
                          required
                        />
                      )}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <CustomButton
          title={loading ? <Spinner height="20px" width="20px" /> : "Submit"}
          type="submit"
          customClass="primary"
          style={{ padding: loading ? "7.5px 12.5px" : "10px 12.5px" }}
        />
      </form>
    </PCL5FormContainer>
  );
};

export default PCL5Form;
