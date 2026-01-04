import React, { useEffect, useState } from "react";
import CustomCard from "../../CustomCard";
import CustomClientDetails from "../../CustomClientDetails";
import { ReportsContainer } from "./style";
import { REPORTS_TABLE_DATA_COLUMNS } from "../../../utils/constants";

function Reports({ reportsData, onClientClick }) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (reportsData) setLoading(false);
  }, [reportsData]);
  return (
    <ReportsContainer>
      <CustomCard title="Reports">
        <CustomClientDetails
          tableData={{
            columns: REPORTS_TABLE_DATA_COLUMNS(onClientClick),
            data: reportsData,
          }}
          itemsPerPage={10000}
          defaultSortFieldId={false}
          fixedHeaderScrollHeight="230px"
          loading={loading}
          loaderBackground="transparent"
          tableCaption="Reports"
        />
      </CustomCard>
    </ReportsContainer>
  );
}

export default Reports;
