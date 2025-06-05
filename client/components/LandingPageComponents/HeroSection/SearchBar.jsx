import React from "react";
import { SearchBarWrapper } from "../style";
import {
  DoctorIcon,
  GenderIcon,
  LocationIcon,
  RacesIcon,
} from "../assets/icons";
import { SearchIcon } from "../../../public/assets/icons";
import CustomButton from "../../CustomButton";

const SearchBar = () => {
  return (
    <SearchBarWrapper className="search-bar-container">
      <div className="search-block"><LocationIcon />
      <div className="heading-container">
        <h4>Location</h4>
        <div className="search-bar-item">
          <select className="select-input">
            <option value="xyz">XYZ City, Indo...</option>
          </select>
        </div>
      </div>
      </div>
      <div className="search-block">
      <RacesIcon />
      <div className="heading-container">
        <h4>Race</h4>
        <div className="search-bar-item">
          <select className="select-input">
            <option value="native">Native</option>
          </select>
        </div>
      </div>
      </div>
      <div className="search-block">
      <GenderIcon />
      <div className="heading-container">
        <h4>Gender</h4>
        <div className="search-bar-item">
          <select className="select-input">
            <option value="female">Female</option>
          </select>
        </div>
      </div>
      </div>
      <div className="search-block no-border">
      <DoctorIcon />
      <div className="heading-container">
        <h4>Speciality</h4>
        <div className="search-bar-item">
          <select className="select-input">
            <option value="female">Speciality xyz...</option>
          </select>
        </div>
      </div>
      </div>
      <CustomButton
        customClass="search-button"
        title="Search"
        icon={<SearchIcon color="#fff" />}
      />
    </SearchBarWrapper>
  );
};

export default SearchBar;
