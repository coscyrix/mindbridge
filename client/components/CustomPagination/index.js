import { useEffect } from "react";
import ReactPaginate from "react-paginate";
import { PaginationContainer } from "./style";
import CustomButton from "../CustomButton";
import { ArrowIcon } from "../../public/assets/icons";
import useWindowResize from "../../utils/hooks/useWindowResize";

const CustomPagination = ({
  totalItems,
  itemsPerPage,
  currentPage,
  setCurrentPage,
}) => {
  const { pageSize } = useWindowResize();
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected);
  };

  useEffect(() => {
    if (currentPage > totalPages - 1) {
      setCurrentPage(0);
    }
  }, [totalItems, itemsPerPage, totalPages]);

  return (
    <PaginationContainer>
      <ReactPaginate
        previousLabel={
          <CustomButton
            title="Previous"
            customClass="prev-button"
            icon={<ArrowIcon />}
            disabled={currentPage === 0}
          />
        }
        nextLabel={
          <CustomButton
            title="Next"
            icon={<ArrowIcon />}
            disabled={currentPage === totalPages - 1}
          />
        }
        breakLabel={"..."}
        pageCount={totalPages}
        onPageChange={handlePageChange}
        forcePage={currentPage}
        containerClassName={"pagination"}
        activeClassName={"active"}
        marginPagesDisplayed={pageSize.width < 500 ? 1 : 2}
        pageRangeDisplayed={pageSize.width < 500 ? 1 : 3}
      />
    </PaginationContainer>
  );
};

export default CustomPagination;
