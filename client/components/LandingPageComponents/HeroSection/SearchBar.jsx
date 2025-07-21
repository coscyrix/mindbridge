import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { SearchBarWrapper } from "../style";
import {
  DoctorIcon,
  GenderIcon,
  LocationIcon,
  RacesIcon,
} from "../assets/icons";
import { SearchIcon } from "../../../public/assets/icons";
import CustomButton from "../../CustomButton";
import CommonServices from "../../../services/CommonServices";
import { toast } from "react-toastify";
import { TREATMENT_TARGET } from "../../../utils/constants";

const SearchBar = () => {
  const { register, handleSubmit, watch } = useForm();
  const [searchFilters, setSearchFilters] = useState(null);
  const router = useRouter();

  const formValues = watch();
  const isFormEmpty = !Object.values(formValues).some((value) => value !== "");

  const getSearchFilters = async () => {
    try {
      const response = await CommonServices.getSearchFilters();
      if (response.status === 200) {
        const { data } = response;
        setSearchFilters(data?.filters);
      }
    } catch (error) {
      console.log("Error while fetching the search filters", error);
    }
  };

  const onSubmit = (data, e) => {
    e.preventDefault();
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== "")
    );
    if (Object.keys(filteredData).length === 0) {
      toast.error("Please select any feild to search your query", {
        position: "top-right",
      });
      return;
    }
    const queryParams = new URLSearchParams(filteredData).toString();
    router.push(`/search-listing?${queryParams}`);
  };

  useEffect(() => {
    if (!searchFilters) {
      getSearchFilters();
    }
  }, []);

  return (
    <SearchBarWrapper className="search-bar-container">
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "contents" }}>
        <div className="search-block">
          <div className="heading-container">
            <div className="location-text-icon">
              <LocationIcon />
              <h4>Location</h4>
            </div>
            <div className="search-bar-item">
              <select className="select-input" {...register("location")}>
                <option value="">Select Location</option>
                {searchFilters?.locations?.map((loc, index) => (
                  <option key={loc} value={loc.toLowerCase()}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="search-block">
          <div className="heading-container">
            <div className="location-text-icon">
              <RacesIcon />
              <h4>Race</h4>
            </div>

            <div className="search-bar-item">
              <select className="select-input" {...register("race")}>
                <option value="">Select Race</option>
                {searchFilters?.race_options?.map((race, index) => (
                  <option key={index} value={race.toLowerCase()}>
                    {race}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="search-block">
          <div className="heading-container">
            <div className="location-text-icon">
              <GenderIcon />
              <h4>Gender</h4>
            </div>
            <div className="search-bar-item">
              <select className="select-input" {...register("gender")}>
                <option value="">Select Gender</option>
                {searchFilters?.gender_options?.map((gender, index) => (
                  <option key={index} value={gender.toLowerCase()}>
                    {gender}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="search-block no-border">
          <div className="heading-container">
            <div className="location-text-icon">
              <DoctorIcon className="treatment-target-icon" />
              <h4 className="treatment-target-text">Treatment Target</h4>
            </div>
            <div className="search-bar-item">
              <select className="select-input" {...register("specialties")}>
                <option value="">Select Treatment Target</option>
                {TREATMENT_TARGET.map((specialties, index) => (
                  <option key={index} value={specialties?.label.toLowerCase()}>
                    {specialties?.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <button className="search-button">
          <SearchIcon color="#fff" />
          Search
        </button>
        {/* <CustomButton
          customClass="search-button"
          title="Search"
          icon={<SearchIcon color="#fff" />}
          type="submit"
        /> */}
      </form>
    </SearchBarWrapper>
  );
};

export default SearchBar;
