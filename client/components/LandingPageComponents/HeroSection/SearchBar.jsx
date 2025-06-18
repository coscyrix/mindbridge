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
  const { register, handleSubmit, watch } = useForm();
  const [searchFilters, setSearchFilters] = useState({
    race_options: [],
    gender_options: [],
    specialties: []
  });
  const [locations, setLocations] = useState([]);
  const router = useRouter();

  const formValues = watch();
  const isFormEmpty = !Object.values(formValues).some(value => value !== "");

  const getSearchFilters = async()=>{
    try {
      const response = await CommonServices.getSearchFilters();
      if(response.status===200){
        const{data} = response;
        console.log('search filters', data);
        
        // Ensure we have valid arrays for each filter type
        setSearchFilters({
          race_options: Array.isArray(data.filters?.race_options) ? data.filters.race_options : [],
          gender_options: Array.isArray(data.filters?.gender_options) ? data.filters.gender_options : [],
          specialties: Array.isArray(data.filters?.specialties) ? data.filters.specialties : []
        });
      }
    } catch (error) {
      console.log('Error while fetching the search filters', error);
    }
  }

  useEffect(() => {
    // Fetch search filters including locations
    const fetchFilters = async () => {
      try {
        const response = await fetch('/api/counselor-profile/search-filters');
        const data = await response.json();
        if (data.filters && Array.isArray(data.filters.locations)) {
          setLocations(data.filters.locations);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };

    fetchFilters();
  }, []);

  const onSubmit = (data) => {
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== "")
    );
    const queryParams = new URLSearchParams(filteredData).toString();
    router.push(`/search-listing?${queryParams}`);
  };

  useEffect(()=>{
    if(!searchFilters.race_options.length && !searchFilters.gender_options.length && !searchFilters.specialties.length)
    {
      getSearchFilters();
    }
  },[])

  return (
    <SearchBarWrapper className="search-bar-container">
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'contents' }}>
        <div className="search-block">
          <LocationIcon />
          <div className="heading-container">
            <h4>Location</h4>
            <div className="search-bar-item">
              <select className="select-input" {...register("location")}>
                <option value="">Select Location</option>
                {Array.isArray(locations) && locations.map((location, index) => (
                  <option key={index} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="search-block">
          <RacesIcon />
          <div className="heading-container">
            <h4>Race</h4>
            <div className="search-bar-item">
              <select className="select-input" {...register("race")}>
                <option value="">Select Race</option>
                {Array.isArray(searchFilters.race_options) && searchFilters.race_options.map((race, index) => (
                  <option key={index} value={race.toLowerCase()}>
                    {race}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="search-block">
          <GenderIcon />
          <div className="heading-container">
            <h4>Gender</h4>
            <div className="search-bar-item">
              <select className="select-input" {...register("gender")}>
                <option value="">Select Gender</option>
                {Array.isArray(searchFilters.gender_options) && searchFilters.gender_options.map((gender, index) => (
                  <option key={index} value={gender.toLowerCase()}>
                    {gender}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="search-block no-border">
          <DoctorIcon />
          <div className="heading-container">
            <h4>Speciality</h4>
            <div className="search-bar-item">
              <select className="select-input" {...register("specialties")}>
                <option value="">Select Speciality</option>
                {Array.isArray(searchFilters.specialties) && searchFilters.specialties.map((specialty, index) => (
                  <option key={index} value={specialty?.service_name?.toLowerCase() || ''}>
                    {specialty?.service_name || ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
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
