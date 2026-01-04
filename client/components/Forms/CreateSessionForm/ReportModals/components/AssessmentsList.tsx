import React from "react";
import CustomTextArea from "../../../../CustomTextArea";
import styles from "../styles.module.scss";

interface Assessment {
  tool?: string;
  form_cde?: string;
  form_name?: string;
  score?: string | number;
  therapist_notes?: string;
}

interface AssessmentsListProps {
  assessments: Assessment[];
  control: any;
  maxItems?: number;
  title?: string;
}

/**
 * AssessmentsList - Shared component for displaying assessments with therapist notes
 * Used in Progress and Discharge reports
 */
const AssessmentsList: React.FC<AssessmentsListProps> = ({
  assessments,
  control,
  maxItems = 5,
  title = "Assessments (Auto-Filled)",
}) => {
  if (!assessments || assessments.length === 0) {
    return (
      <div className={styles.treatmentPlanSection}>
        <h3 className={styles.sectionHeading}>{title}</h3>
        <div className="no-assessments">
          <p>No assessments available for this session.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.treatmentPlanSection}>
      <h3 className={styles.sectionHeading}>{title}</h3>
      {assessments.slice(0, maxItems).map((assessment, index) => {
        const formName =
          assessment?.tool ||
          assessment?.form_cde ||
          assessment?.form_name ||
          `Assessment ${index + 1}`;
        const score = assessment?.score ?? "N/A";

        return (
          <div key={index} className={styles.formField}>
            <div style={{ marginBottom: "8px" }}>
              <strong>Tool:</strong> {formName} <strong>Score:</strong> {score}
            </div>
            <CustomTextArea
              label="Therapist Notes:"
              name={`therapistNotes.${index}`}
              control={control}
              isError={false}
              disabled={false}
              placeholder="Enter therapist notes for this assessment..."
              rows={3}
              helperText={undefined}
            />
          </div>
        );
      })}
    </div>
  );
};

export default AssessmentsList;

