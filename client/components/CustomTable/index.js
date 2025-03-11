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
  ...props
}) {
  const customStyles = {
    rows: {
      style: {
        background: "transparent",
        "&:hover": {
          background: "white",
          cursor: "pointer",
        },
      },
    },
  };
  return (
    <>
      <CustomTableContainer>
        <DataTable
          columns={columns}
          data={data}
          sortIcon={<TableDownArrowIcon />}
          defaultSortFieldId={defaultSortFieldId ? defaultSortFieldId : 1}
          customStyles={customStyles}
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
