import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { FormWrapper } from "./style";
import Section from "./Section";
import { IPF_FORM_QUESTIONS } from "../../../../utils/constants";
import CustomButton from "../../../CustomButton";
import { toast } from "react-toastify";
import { api } from "../../../../utils/auth";
import { useRouter } from "next/router";

const options = [
  { label: "0", value: 0 },
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
  { label: "4", value: 4 },
  { label: "5", value: 5 },
  { label: "6", value: 6 },
];

const IPFForm = () => {
  const { control, handleSubmit, watch, register, reset, setValue } = useForm();
  const [loading, setLoading] = useState();
  const router = useRouter();

  const onSubmit = async (data) => {
    const { client_id, session_id } = router.query;
    const {
      relationship,
      family,
      work,
      friendshipsAndSocializing,
      parenting,
      education,
      selfCare,
      ...payloadData
    } = data;
    console.log(data, "formData");
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
      const response = await api.post("/feedback/ipf", payload);
      if (response.status === 200) {
        toast.success("Form submitted successfully!");
        router.push("/patient-forms/form-submission");
      }
    } catch (error) {
      toast.error("Failed to submit the form!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormWrapper>
      <h1>IPF</h1>
      <h4>
        INSTRUCTIONS: Answer the questions at the beginning of each section to
        determine which sections apply to you. Then, within the sections that
        apply to you, read each statement and rate how often you have acted like
        that over the past 30 days. Circle only one number for each statement.
      </h4>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Romantic Relationship with Spouse or Partner */}
        <Section
          sectionTitle="Romantic Relationship with Spouse or Partner"
          sectionDescription="Have you been in a romantic relationship with a spouse or partner in the past 30 days?"
          questions={IPF_FORM_QUESTIONS?.relationship}
          options={options}
          name="relationship"
          tableEnablingQuestion="If you have not been in a romantic relationship with a spouse or
            partner during the past 30 days skip this section and continue with
            the next section. Otherwise, please answer the following questions."
          fieldNamePrefix="relationshipWithSpouse"
          register={register}
          control={control}
          setValue={setValue}
        />
        {/* Family */}
        <Section
          name="family"
          sectionTitle="Family"
          sectionDescription="Have you been in contact with family members (parents,
                  brothers, sisters, grandparents, etc.) in the past 30 days?"
          questions={IPF_FORM_QUESTIONS?.family}
          options={options}
          fieldNamePrefix="relationshipWithFamily"
          tableEnablingQuestion="If you have not been in contact with family during the past 30
                days skip this section and continue with the next section.
                Otherwise, please answer the following questions."
          register={register}
          control={control}
          setValue={setValue}
        >
          <label>
            In this section, family refers to all relatives other than your
            spouse/partner or children (for example, parents, brothers, sisters,
            grandparents, etc). Do not answer these questions in reference to
            your spouse/partner or children.
          </label>
        </Section>
        {/* Work (including home-based word) */}
        <Section
          name="work"
          tableEnablingQuestion="If you have not worked either for pay or as a volunteer during
                the past 30 days skip this section and continue with the next
                section. Otherwise, please answer the following questions."
          sectionTitle="Work (including home-based work)"
          sectionDescription="Have you worked (either for pay or as a volunteer) in the past
                  30 days?"
          questions={IPF_FORM_QUESTIONS?.work}
          options={options}
          fieldNamePrefix="workObject"
          register={register}
          control={control}
          setValue={setValue}
        />
        {/* Friendships and Socializing */}
        <Section
          name="friendshipsAndSocializing"
          tableEnablingQuestion=" If you have not been in contact with friends during the past 30
                days skip this section and continue with the next section.
                Otherwise, please answer the following questions."
          sectionTitle="Friendships and Socializing"
          sectionDescription="Have you been in contact with friends in the past 30 days?"
          questions={IPF_FORM_QUESTIONS?.social}
          options={options}
          fieldNamePrefix="friendshipsAndSocializingObject"
          register={register}
          control={control}
          setValue={setValue}
        />
        {/* Parenting */}
        <Section
          name="parenting"
          tableEnablingQuestion="If you do not have children with whom you lived or had regular
                contact during the past 30 days skip this section and continue
                with the next section. Otherwise, please answer the following
                questions."
          sectionTitle="Parenting"
          sectionDescription=" Do you have children with whom you lived or had regular
                  contact during the past 30 days?"
          questions={IPF_FORM_QUESTIONS?.parenting}
          options={options}
          fieldNamePrefix="parentingObject"
          register={register}
          control={control}
          setValue={setValue}
        />
        {/* Education (including distance learning) */}
        <Section
          name="education"
          tableEnablingQuestion="If you have not been involved in an educational experience
                during the past 30 days skip this section and continue with the
                next section. Otherwise, please answer the following questions."
          sectionTitle="Education (including distance learning)"
          sectionDescription="Have you been involved in a formal educational experience,
                  either in or outside of the school setting, during the past 30
                  days?"
          questions={IPF_FORM_QUESTIONS?.school}
          options={options}
          fieldNamePrefix="educationObject"
          register={register}
          control={control}
          setValue={setValue}
        />
        {/* Self Care */}
        <Section
          name="selfCare"
          sectionTitle="Self Care"
          questions={IPF_FORM_QUESTIONS?.personalCare}
          options={options}
          fieldNamePrefix="selfCareObject"
          register={register}
          control={control}
          setValue={setValue}
        />
        <CustomButton title="Submit" className="primary" type="submit" />
      </form>
    </FormWrapper>
  );
};

export default IPFForm;
