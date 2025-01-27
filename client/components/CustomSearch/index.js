import React from "react";
import { CustomSearchBarContainer } from "./style";
import { SearchIcon } from "../../public/assets/icons";

const CustomSearch = ({ placeholder = "Search", onFilter, filterText }) => {
  return (
    <CustomSearchBarContainer>
      <div className="search-bar">
        <div className="search-icon">
          <SearchIcon style={{ display: "flex" }} />
        </div>
        <input
          className="search-input"
          contentEditable
          suppressContentEditableWarning
          value={filterText}
          onChange={onFilter}
          placeholder={placeholder}
        ></input>
      </div>
    </CustomSearchBarContainer>
  );
};

export default CustomSearch;
