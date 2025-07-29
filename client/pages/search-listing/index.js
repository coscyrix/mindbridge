import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import CounselorCard from "../../components/SearchListingComponents/CounselorCard";
import { SearchListingWrapper } from "../../components/SearchListingComponents/style";
import CommonServices from "../../services/CommonServices";
import { useForm } from "react-hook-form";
import axios from "axios";
import CustomLoader from "../../components/Loader/CustomLoader";
import CustomButton from "../../components/CustomButton";
import { GoArrowLeft } from "react-icons/go";
import { TREATMENT_TARGET } from "../../utils/constants";
const SearchListing = () => {
  const [isloading, setIsLoading] = useState(false);
  const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGES_BASE_URL;

  const router = useRouter();
  const { query } = router;

  const [searchFilters, setSearchFilters] = useState(null);
  const [counselorsData, setCounselorsData] = useState([]);
  const [profilePictures, setProfilePictures] = useState({});

  const [searchParams, setSearchParams] = useState({
    searchServices: "",
    location: "",
    race: "",
    gender: "",
    speciality: "",
    priceRange: {
      min: 1,
      max: 500,
    },
    categories: [],
  });

  const loadValueFromQuery = () => {
    if (!router.isReady) return;
    const query = router.query;
    setSearchParams((prev) => ({
      ...prev,
      searchServices: query.searchServices || "",
      location: query.location ? query.location.toLowerCase() : "",
      race: query.race ? query.race.toLowerCase() : "",
      gender: query.gender ? query.gender.toLowerCase() : "",
      speciality: query.specialties ? query.specialties.toLowerCase() : "",
      priceRange: {
        min: query.min ? Number(query.min) : prev.priceRange.min,
        max: query.max ? Number(query.max) : prev.priceRange.max,
      },
      categories: query.categories
        ? Array.isArray(query.categories)
          ? query.categories
          : [query.categories]
        : [],
    }));
  };

  useEffect(() => {
    loadValueFromQuery();
  }, [router.isReady]);

  const getSearchFilters = async () => {
    try {
      const response = await CommonServices.getSearchFilters();
      if (response.status === 200) {
        const { data } = response;
        // data?.filters?.specialties?.map((spe) => spe.service_name);
        const uniqueSpecialties = Array.from(
          new Map(
            data.filters.specialties.map((item) => [item.service_name, item])
          ).values()
        );

        setSearchFilters({
          ...data.filters,
          specialties: uniqueSpecialties,
        });
      }
    } catch (error) {
      console.log("Error while fetching the search filters", error);
    }
  };
  const filterSearchResult = async (data, isInitial = false) => {
    try {
      setIsLoading(true);
      // Remove searchServices from data
      if (data?.searchServices !== undefined) delete data.searchServices;

      // Utility to filter out empty values
      const filterPayload = (obj) => {
        const result = {};
        Object.entries(obj).forEach(([key, value]) => {
          if (
            value === undefined ||
            value === null ||
            (typeof value === "string" && value.trim() === "") ||
            (Array.isArray(value) && value.length === 0) ||
            (typeof value === "object" &&
              !Array.isArray(value) &&
              Object.keys(value).length === 0)
          ) {
            // skip
          } else {
            result[key] = value;
          }
        });
        return result;
      };

      // Build the payload
      let payload = { ...data };

      // Map categories to specialties if present and non-empty
      if (searchParams.categories && searchParams.categories.length > 0) {
        payload.treatment_target = searchParams.categories.map(Number);
      }

      // Map priceRange to min_price and max_price if set, but only if not initial call
      if (!isInitial && searchParams.priceRange) {
        const { min, max } = searchParams.priceRange;
        if (min !== undefined && min !== null && min !== "") {
          payload.min_price = min;
        }
        if (max !== undefined && max !== null && max !== "") {
          payload.max_price = max;
        }
      }
      // Remove original priceRange and categories keys
      delete payload.priceRange;
      delete payload.categories;

      // Remove speciality if empty
      if (payload.speciality === "") delete payload.speciality;

      // Remove specialties if empty
      if (payload.specialties && payload.specialties.length === 0)
        delete payload.specialties;

      // Final filter to remove any empty keys
      
      
      payload = filterPayload(payload);

      const response = await CommonServices.getSearchedCounselors(payload);
      if (response.status === 200) {
        setCounselorsData(response.data.rec);
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.log("Error while fetching the error : ", error);
    }
  };

  const fetchAllProfilePictures = async () => {
    const pictureMap = {};

    await Promise.all(
      counselorsData?.map(async (counselor) => {
        try {
          const response = await axios.get(
            `${imageBaseUrl}${counselor.profile_picture_url}`,
            {
              responseType: "blob",
              headers: {
                "ngrok-skip-browser-warning": "true",
              },
            }
          );

          const blob = response.data;
          const reader = new FileReader();

          // Wrap reader in a Promise to wait until it's done
          const base64 = await new Promise((resolve, reject) => {
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });

          pictureMap[counselor.counselor_profile_id] = base64;
        } catch (error) {
          console.log(
            `Error fetching image for ${counselor.counselor_profile_id}`,
            error
          );
        }
      })
    );

    setProfilePictures(pictureMap);
  };

  useEffect(() => {
    if (counselorsData && counselorsData.length > 0) {
      fetchAllProfilePictures();
    }
  }, [counselorsData]);

  useEffect(() => {
    if (router.isReady) {
      const { query } = router;
      if (Object.keys(query).length > 0) {
        filterSearchResult(query, true);
      }
    }
  }, [router.isReady, router.query]);

  useEffect(() => {
    if (!searchFilters) {
      getSearchFilters();
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    filterSearchResult(searchParams);
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
  return (
    <SearchListingWrapper>
      <div className="search-section">
        {/* <div className="search-container">
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
                className="select-input"
                value={searchParams.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
              >
                <option value="">Select Location</option>
                {searchFilters?.locations?.map((location) => (
                  <option key={location} value={location.toLowerCase()}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <img src="/assets/icons/raceIcon.svg" alt="Race" />
              <select
                className="select-input"
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
                className="select-input"
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
                className="select-input"
                value={searchParams.speciality}
                onChange={(e) =>
                  handleInputChange("speciality", e.target.value)
                }
              >
                <option value="">Select Speciality</option>
                {TREATMENT_TARGET.map((specialty) => (
                  <option
                    key={specialty?.service_name}
                    value={specialty?.label.toLowerCase()}
                  >
                    {specialty?.label}
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
        </div> */}
        <GoArrowLeft
          onClick={() => {
            router.back();
          }}
          size={30}
        />
      </div>

      <div className="results-section">
        <div className="filters-section">
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
                min="1"
                max="500"
                value={searchParams.priceRange.min}
                onChange={(e) => handlePriceRangeChange("min", e.target.value)}
              />
              <input
                type="range"
                min="1"
                max="500"
                value={searchParams.priceRange.max}
                onChange={(e) => handlePriceRangeChange("max", e.target.value)}
              />
            </div>
          </div>

          <div className="categories">
            <h3>Treatment Target</h3>
            <div className="categories-list">
              {TREATMENT_TARGET?.map((service) => (
                <label key={service.label} className="category-checkbox">
                  <input
                    type="checkbox"
                    checked={searchParams.categories.includes(service.value)}
                    onChange={() => handleCategoryChange(service.value)}
                  />
                  <span>{service.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div
            style={{
              color: "white",
              padding: " 8px 12px",
              backgroundColor: "#3973b7",
              borderRadius: "6px",
              textAlign: "center",
              marginTop: "16px",
              cursor: "pointer",
            }}
            onClick={() => filterSearchResult(query)}
          >
            Submit
          </div>
        </div>
        {/* {console.log(counselorsData)} */}
        <div className="wrapperCardShow">
          {counselorsData?.length !== 0 ? (
            counselorsData.map((counselor) => (
              <CounselorCard
                key={counselor.counselor_profile_id}
                image={
                  profilePictures[counselor.counselor_profile_id] ||
                  "/assets/images/drImage2.png"
                }
                name={`${counselor.user_first_name} ${counselor.user_last_name}`}
                // speciality={TREATMENT_TARGET}
                location={counselor.location}
                rating={counselor.average_rating}
                reviews={counselor.review_count}
                availability={counselor?.availability}
                contact={counselor.public_phone}
                email={counselor.email}
                services={counselor.services_offered.join(", ")}
                available={counselor.service_modalities}
                counselorId={counselor.counselor_profile_id}
              />
            ))
          ) : (
            <p>No counselors were found associated with your search.</p>
          )}
        </div>
      </div>
      {isloading ? (
        <CustomLoader
          style={{ top: "30vh", left: "10vw", height: "20vh" }}
        ></CustomLoader>
      ) : (
        <></>
      )}
    </SearchListingWrapper>
  );
};

export default SearchListing;
