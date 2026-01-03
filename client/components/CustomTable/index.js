import DataTable from "react-data-table-component";
import { CustomTableContainer } from "./style";
import { TableDownArrowIcon } from "../../public/assets/icons";
import Spinner from "../common/Spinner";

function CustomTable({
  columns,
  data,
  onRowclick,
  defaultSortFieldId,
  loading,
  loaderBackground = "var(--background-color)",
  conditionalRowStyles,
  ...props
}) {
  const customStyles = {
    rows: {
      style: {
        background: "transparent",
        "&:hover": {
          background: "white",
          cursor: onRowclick ? "pointer" : "default",
        },
      },
    },
  };
  return (
    <>
      <CustomTableContainer>
        <DataTable
          className="custom-data-table"
          columns={columns}
          data={data}
          sortIcon={<TableDownArrowIcon />}
          defaultSortFieldId={defaultSortFieldId ? defaultSortFieldId : null}
          customStyles={customStyles}
          conditionalRowStyles={conditionalRowStyles}
          progressComponent={
            <div
              style={{
                backgroundColor: loaderBackground,
                width: "100%",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Spinner color="#525252" />
            </div>
          }
          progressPending={loading}
          onRowClicked={onRowclick}
          fixedHeader={true}
          {...props}
        />
      </CustomTableContainer>
    </>
  );
}

export default CustomTable;
