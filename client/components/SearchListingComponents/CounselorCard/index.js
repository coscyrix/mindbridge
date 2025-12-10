import React from "react";
import { useRouter } from "next/router";
import { CardWrapper } from "./style";
import { StarIcon } from "../../../public/assets/icons";

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
  TREATMENT_TARGET = [],
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
      <div className="card-left">
        <img src={image} alt={name} className="counselor-photo" />
      </div>

      <div className="card-center">
        <div className="rating-row">
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
        <p className="counselor-speciality">{speciality}</p>

        <div className="info-row">
          <img src="/assets/images/location.png" alt="Location" className="info-icon" />
          <span className="value">{location}</span>
        </div>
        <div className="info-row">
          <img src="/assets/images/phone.jpg" alt="Phone" className="info-icon" />
          <span className="value">{contact}</span>
        </div>
        <div className="info-row">
          <img src="/assets/images/mail.png" alt="Email" className="info-icon" />
          <span className="value">{email}</span>
        </div>

        <div className="servicesDetails">
          <h6>Treatment target</h6>
          {TREATMENT_TARGET.length > 0 ? (
            TREATMENT_TARGET.map((specialty, index) => (
              <span key={index}>
                {specialty}
                {index < TREATMENT_TARGET.length - 1 && ", "}
              </span>
            ))
          ) : (
            <span>No targets</span>
          )}
        </div>

        <div className="availabilityWrapper">
          <h6>Available</h6>
          <div>
            {Array.isArray(available) ? (
              available.map((mode, index) => <span key={index}>{mode}</span>)
            ) : (
              <span>{available}</span>
            )}
          </div>
        </div>
      </div>

      <div className="card-right">
        <img
          src="/assets/images/verified.png"
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
    </CardWrapper>
  );
};

export default CounselorCard;
