import React from "react";
import CustomCard from "../../CustomCard";
import CustomClientDetails from "../../CustomClientDetails";
import { ReportsContainer } from "./style";
import { REPORTS_TABLE_DATA } from "../../../utils/constants";

function Reports() {
  return (
    <ReportsContainer>
      <CustomCard title="Reports">
        <CustomClientDetails tableData={REPORTS_TABLE_DATA} itemsPerPage={5} />
      </CustomCard>
    </ReportsContainer>
  );
}

export default Reports;
