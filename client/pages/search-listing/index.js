import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import CounselorCard from "../../components/SearchListingComponents/CounselorCard";
import { SearchListingWrapper } from "../../components/SearchListingComponents/style";
import CommonServices from "../../services/CommonServices";

const SearchListing = () => {
  const router = useRouter();
  const [searchFilters, setSearchFilters] = useState(null);
  const [counselorsData, setCounselorsData] = useState([]);
  const [searchParams, setSearchParams] = useState({
    searchServices: "",
    location: "",
    race: "",
    gender: "",
    speciality: "",
    priceRange: {
      min: 1200,
      max: 20000,
    },
    categories: [],
  });

  const getSearchFilters = async()=>{
    try {
      const response = await CommonServices.getSearchFilters();
      if(response.status===200){
        const{data} = response;
        setSearchFilters(data.filters);
      }
    } catch (error) {
      console.log('Error while fetching the search filters', error);
    }
  }

  const filterSearchResult = async(data)=>{
    try {
      const response = await CommonServices.getSearchedCounselors(data);
      if(response.status===200){
        console.log(response,'response');
        setCounselorsData(response.data.rec);
      }
    } catch (error) {
      console.log('Error while fetching the error : ', error);
    }
  }

  useEffect(()=>{
    if (router.isReady) {
      const { query } = router;
      if (Object.keys(query).length > 0) {
        filterSearchResult(query);
      }
    }
  },[router.isReady, router.query])

  useEffect(()=>{
    if(!searchFilters){
      getSearchFilters();
    }
  },[])

  // Mock data for dropdowns
  const locations = ["XYZ City, Indo...", "ABC City", "DEF City"];

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Search params:", searchParams);
  };

  const handleInputChange = (field, value) => {
    setSearchParams((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePriceRangeChange = (type, value) => {
    setSearchParams((prev) => ({
      ...prev,
      priceRange: {
        ...prev.priceRange,
        [type]: value,
      },
    }));
  };

  const handleCategoryChange = (category) => {
    setSearchParams((prev) => {
      const updatedCategories = prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category];

      return {
        ...prev,
        categories: updatedCategories,
      };
    });
  };

  const handleBookAppointment = (counselorId) => {
    console.log("Booking appointment with counselor:", counselorId);
  };

  return (
    <SearchListingWrapper>
      <div className="search-section">
        <div className="search-container">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Search services"
              value={searchParams.searchServices}
              onChange={(e) =>
                handleInputChange("searchServices", e.target.value)
              }
            />
            <button className="search-icon-button">
              <img src="./assets/icons/searchIcon.svg" />
            </button>
          </div>

          <div className="filters-wrapper">
            <div className="filter-item">
              <img src="./assets/icons/locationIcon.svg" />
              <select
                value={searchParams.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
              >
                <option value="">Select Location</option>
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <img src="/assets/icons/raceIcon.svg" alt="Race" />
              <select
                value={searchParams.race}
                onChange={(e) => handleInputChange("race", e.target.value)}
              >
                <option value="">Select Race</option>
                {searchFilters?.race_options?.map((race) => (
                  <option key={race} value={race.toLowerCase()}>
                    {race}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <img src="/assets/icons/genderIcon.svg" alt="Gender" />
              <select
                value={searchParams.gender}
                onChange={(e) => handleInputChange("gender", e.target.value)}
              >
                <option value="">Select Gender</option>
                {searchFilters?.gender_options?.map((gender) => (
                  <option key={gender} value={gender.toLowerCase()}>
                    {gender}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <img src="./assets/icons/locationIcon.svg" />
              <select
                value={searchParams.speciality}
                onChange={(e) =>
                  handleInputChange("speciality", e.target.value)
                }
              >
                <option value="">Select Speciality</option>
                {searchFilters?.specialties?.map((specialty) => (
                  <option key={specialty} value={specialty.toLowerCase()}>
                    {specialty}
                  </option>
                ))}
              </select>
            </div>
            <div className="searchButtonHeader">
              <button className="search-button" onClick={handleSearch}>
                Search
              </button>
              <img src="./assets/icons/searchIcon.svg" />
            </div>
          </div>
        </div>
      </div>

      <div className="results-section">
        <div className="filters-section">
          <div className="search-by-name">
            <h3>Search by Facility Name</h3>
            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder="Search"
                value={searchParams.searchTerm}
                onChange={(e) =>
                  handleInputChange("searchTerm", e.target.value)
                }
              />
              <button onClick={handleSearch}>Search</button>
            </div>
          </div>

          <div className="price-range">
            <div className="wrapperRange">
              <h3>Price Range</h3>
              <div className="price-display">
                $ {searchParams.priceRange.min} - ${" "}
                {searchParams.priceRange.max}
              </div>
            </div>
            <div className="price-inputs">
              <div className="input-group">
                <label>Min</label>
                <div className="price-input">
                  <span>$</span>
                  <input
                    type="number"
                    value={searchParams.priceRange.min}
                    onChange={(e) =>
                      handlePriceRangeChange("min", e.target.value)
                    }
                  />
                </div>
              </div>
              <span className="separator">—</span>
              <div className="input-group">
                <label>Max</label>
                <div className="price-input">
                  <span>$</span>
                  <input
                    type="number"
                    value={searchParams.priceRange.max}
                    onChange={(e) =>
                      handlePriceRangeChange("max", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
            <div className="price-slider">
              <input
                type="range"
                min="1200"
                max="20000"
                value={searchParams.priceRange.min}
                onChange={(e) => handlePriceRangeChange("min", e.target.value)}
              />
              <input
                type="range"
                min="1200"
                max="20000"
                value={searchParams.priceRange.max}
                onChange={(e) => handlePriceRangeChange("max", e.target.value)}
              />
            </div>
          </div>

          <div className="categories">
            <h3>Categories</h3>
            <div className="categories-list">
              {searchFilters?.services?.map((service) => (
                <label key={service} className="category-checkbox">
                  <input
                    type="checkbox"
                    checked={searchParams.categories.includes(service)}
                    onChange={() => handleCategoryChange(service)}
                  />
                  <span>{service}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="wrapperCardShow">
          {counselorsData?.length!==0?counselorsData.map((counselor) => (
            <CounselorCard
              key={counselor.counselor_profile_id}
              image={'/assets/images/drImage2.png'||counselor.profile_picture_url}
              name={`${counselor.user_first_name} ${counselor.user_last_name}`}
              speciality={counselor.specialties.join(", ")}
              location={counselor.location}
              rating={counselor.average_rating}
              reviews={counselor.review_count}
              // availability={Object.entries(counselor.availability)
              //   .filter(([_, times]) => times.length > 0)
              //   .map(([day, times]) => `${day}: ${times.join(", ")}`)
              //   .join(" | ")}
              availability="9:00 AM - 5:00 PM"
              contact={counselor.public_phone}
              email={counselor.email}
              services={counselor.services_offered.join(", ")}
              available={counselor.service_modalities}
              counselorId={counselor.counselor_profile_id}
            />
          )):<p>No counselors were found associated with your search.</p>}
        </div>
      </div>
    </SearchListingWrapper>
  );
};

export default SearchListing;
