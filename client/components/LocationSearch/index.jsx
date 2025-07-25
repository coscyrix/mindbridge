import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useLoadScript } from "@react-google-maps/api";

const libraries = ["places"];

const LocationSearchContainer = styled.div`
  position: relative;
  width: 100%;
  margin-bottom: 24px;

  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #333;
  }

  .location-input {
    width: 100%;
    padding: 12px;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    font-size: 14px;
    outline: none;
    transition: border-color 0.3s ease;
    background-color: white;

    &:focus {
      border-color: #2196f3;
    }

    &.error {
      border-color: #f44336;
    }
  }

  .error-message {
    color: #f44336;
    font-size: 12px;
    margin-top: 4px;
  }

  /* Style for Google Places Autocomplete dropdown */
  .pac-container {
    border-radius: 4px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    margin-top: 4px;
    border: none;
    font-family: inherit;
  }

  .pac-item {
    padding: 8px 12px;
    font-size: 14px;
    cursor: pointer;

    &:hover {
      background-color: #f5f5f5;
    }
  }
`;

const LocationSearch = ({ value, onChange, error, label }) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [inputValue, setInputValue] = useState(value?.label || "");
  useEffect(() => {
    if (value?.label) {
      setInputValue(value.label);
    } else if (typeof value === "string") {
      setInputValue(value);
    }
  }, [value]);
  useEffect(() => {
    if (!isLoaded || loadError) return;

    const options = {
      componentRestrictions: undefined, // Restrict to US locations
      fields: ["address_components", "formatted_address", "geometry"],
      types: ["address"],
    };

    autocompleteRef.current = new window.google.maps.places.Autocomplete(
      inputRef.current,
      options
    );

    autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current.getPlace();

      if (place.geometry) {
        const locationData = {
          // value: place.formatted_address,
          // label: place.formatted_address,
          // lat: place.geometry.location.lat(),
          // lng: place.geometry.location.lng(),
          // address_components: place.address_components,
          value: inputRef.current.value, // use raw input
          label: inputRef.current.value,
          lat: place.geometry?.location?.lat?.() ?? null,
          lng: place.geometry?.location?.lng?.() ?? null,
          address_components: place.address_components || [],
        };
        setInputValue(place.formatted_address);
        onChange(locationData);
      }
    });

    return () => {
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(
          autocompleteRef.current
        );
      }
    };
  }, [isLoaded, loadError, onChange]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // If the input is cleared, clear the selected location
    if (!newValue) {
      onChange(null);
    }
  };

  if (loadError) {
    return <div>Error loading Google Maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <LocationSearchContainer>
      {label && <label>{label}</label>}
      <input
        ref={inputRef}
        type="text"
        className={`location-input ${error ? "error" : ""}`}
        placeholder="Enter your location"
        value={inputValue}
        onChange={handleInputChange}
      />
      {error && <div className="error-message">{error}</div>}
    </LocationSearchContainer>
  );
};

export default LocationSearch;
