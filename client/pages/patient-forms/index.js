import Link from "next/link";
import React from "react";

const baseUrl = "/patient-forms";

const patientForms = [
  { formName: "Generalized Anxiety Disorder (GAD)", url: "gad" },
  { formName: "PTSD Checklist for DSM-5 (PCL-5)", url: "pcl-5" },
  { formName: "Patient Health Questionnaire (PHQ-9)", url: "phq-9" },
  { formName: "IPF Form", url: "ipf" },
  { formName: "Consent Form", url: "consent" },
  { formName: "WHODas Form", url: "whodas" },
  { formName: "Smart Goals", url: "smartgoals" },
];

const PatientForms = () => {
  return (
    <div style={{ padding: "20px 30px" }}>
      <h1 style={{ margin: 0 }}>Patient Forms</h1>
      <ul
        style={{
          listStyle: "ordered",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          color: "var(--primary-button-color)",
        }}
      >
        {patientForms.map((form) => (
          <li key={form?.url}>
            <Link href={`${baseUrl}/${form?.url}`}>{form?.formName}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PatientForms;
