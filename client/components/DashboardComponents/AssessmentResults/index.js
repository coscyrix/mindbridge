import React from "react";
import CustomCard from "../../CustomCard";
import CustomClientDetails from "../../CustomClientDetails";
import { AssessmentResultsContainer } from "./style";
import { ASSESSMENT_DATA } from "../../../utils/constants";
function AssessmentResults() {
  return (
    <AssessmentResultsContainer>
      <CustomCard title="Assessment Results">
        <CustomClientDetails tableData={ASSESSMENT_DATA} itemsPerPage={5} />
      </CustomCard>
    </AssessmentResultsContainer>
  );
}

export default AssessmentResults;
