import React from "react";
import { useRouter } from "next/router";
import { CardWrapper } from "./style";
import { StarIcon } from "../../../public/assets/icons";
import { TREATMENT_TARGET } from "../../../utils/constants";
const CounselorCard = ({
  name,
  speciality,
  location,
  rating,
  reviews,
  availability,
  image,
  contact,
  email,
  services,
  available,
  counselorId,
}) => {
  const router = useRouter();

  const handleBookAppointment = () => {
    router.push(`/search-details/${counselorId}`);
  };

  function normalizeAvailability(schedule) {
    const daysOrder = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    const dayNameMap = {
      monday: "Monday",
      tuesday: "Tuesday",
      wednesday: "Wednesday",
      thursday: "Thursday",
      friday: "Friday",
      saturday: "Saturday",
      sunday: "Sunday",
    };

    // Group days by time string, excluding empty
    const grouped = {};
    daysOrder.forEach((day) => {
      const times = schedule[day] || [];
      if (times.length === 0) return; // Skip unavailable days
      const key = times.join(",");
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(day);
    });

    const output = [];

    for (const [timeKey, days] of Object.entries(grouped)) {
      const ranges = groupConsecutiveDays(days, daysOrder).map((range) => {
        if (range.length === 1) {
          return dayNameMap[range[0]];
        } else {
          return `${dayNameMap[range[0]]} - ${
            dayNameMap[range[range.length - 1]]
          }`;
        }
      });
      output.push(`${ranges.join(", ")}: ${timeKey}`);
    }

    return output.join(" | ");
  }

  // Helper to group consecutive days
  function groupConsecutiveDays(days, orderedDays) {
    const indices = days
      .map((d) => orderedDays.indexOf(d))
      .sort((a, b) => a - b);
    const result = [];
    let temp = [];

    for (let i = 0; i < indices.length; i++) {
      const current = orderedDays[indices[i]];
      temp.push(current);

      const nextIndex = indices[i + 1];
      if (nextIndex !== indices[i] + 1) {
        result.push(temp);
        temp = [];
      }
    }

    if (temp.length) result.push(temp);
    return result;
  }

  const normalisedAvailability = normalizeAvailability(availability);

  return (
    <CardWrapper>
      <div className="card-header">
        <img
          src={image}
          alt={name}
          style={{ objectFit: "cover", width: "300px" }}
        />
        <div className="counselor-info">
          <div className="rating-container">
            <div className="stars">
              {[...Array(5)].map((_, index) => (
                <StarIcon
                  key={index}
                  className={index < Math.floor(rating) ? "filled" : ""}
                />
              ))}
            </div>
            <span className="reviews">{reviews} Reviews</span>
          </div>
          <h3 className="counselor-name">{name}</h3>
          <div className="info-row">
            <img src="/assets/icons/locationIcon.svg" />
            <prompt className="value">{location}</prompt>
          </div>
          <div className="info-row">
            <img src="/assets/icons/callIcon.svg" />
            <p className="value">{contact}</p>
          </div>
          <div className="info-row">
            <img src="/assets/icons/mailIcon.svg" />
            <p className="value">{email}</p>
          </div>

          <div className="card-body">
            <div className="services-list">
              <div className="servicesDetails">
                <h6>Types of Services</h6>
                <p>{services}</p>
              </div>
              <div className="servicesDetails" style={{ marginTop: "20px" }}>
                <h6>Treatment target</h6>
                {TREATMENT_TARGET.map((specialties, index) => (
                  <p key={specialties.value || index}>{specialties.label}</p>
                ))}
              </div>
              <div
                className="availabilityWrapper"
                style={{ marginTop: "20px" }}
              >
                <h6>Available</h6>
                <div>
                  {Array.isArray(available) ? (
                    available.map((mode, index) => (
                      <span key={index}>{mode}</span>
                    ))
                  ) : (
                    <p>{available}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card-footer">
          <img
            src="/assets/images/verified-user.svg"
            className="cardImageFooter"
            alt="Verified"
          />
          <div className="availability">
            <h6 className="label">Availability:</h6>
            <div className="time">
              {normalisedAvailability.split("|").map((line, index) => (
                <p key={index}>{line.trim()}</p>
              ))}
            </div>
          </div>
          <button className="book-button" onClick={handleBookAppointment}>
            View More Details
          </button>
        </div>
      </div>
    </CardWrapper>
  );
};

export default CounselorCard;
