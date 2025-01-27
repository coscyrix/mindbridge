import React from "react";
import { GenerateSessionTableContainer } from "./style";
import DataTable from "react-data-table-component";
import { TableDownArrowIcon } from "../../public/assets/icons";
import Spinner from "../common/Spinner";

const GenerateSessionTable = ({ columns, data, onRowclick }) => {
  return (
    <GenerateSessionTableContainer>
      <DataTable
        columns={columns}
        data={data}
        selectableRows
        sortIcon={<TableDownArrowIcon />}
        defaultSortFieldId={1}
        progressComponent={<Spinner />}
        onRowClicked={onRowclick}
      />
    </GenerateSessionTableContainer>
  );
};

export default GenerateSessionTable;
