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
  counselorId
}) => {
  const router = useRouter();

  const handleBookAppointment = () => {
    router.push(`/search-details/${counselorId}`);
  };

  return (
    <CardWrapper>
      <div className="card-header">
        <img src={image} alt={name} />
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
            <img src="./assets/icons/locationIcon.svg" />
            <prompt className="value">{location}</prompt>
          </div>
          <div className="info-row">
            <img src="./assets/icons/callIcon.svg" />
            <p className="value">{contact}</p>
          </div>
          <div className="info-row">
            <img src="./assets/icons/mailIcon.svg" />
            <p className="value">{email}</p>
          </div>

          <div className="card-body">
            <div className="services-list">
              <div className="servicesDetails">
                <h6>Types of Services</h6>
                <p>{services}</p>
              </div>
              <div className="servicesDetails">
                <h6>Speciality</h6>
                <p>{speciality}</p>
              </div>
              <div className="availabilityWrapper">
                <h6>Available</h6>
                <div>
                  {Array.isArray(available) ? available.map((mode, index) => (
                    <span key={index}>{mode}</span>
                  )) : <p>{available}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card-footer">
          <img
            src="./assets/images/verified-user.svg"
            className="cardImageFooter"
          />
          <div className="availability">
            <h6 className="label">Availability:</h6>
            <p className="time">{availability}</p>
            <h5 className="label">Gynaecologist Specialist</h5>
          </div>
          <button className="book-button" onClick={handleBookAppointment}>
            Book Appointment
          </button>
        </div>
      </div>
    </CardWrapper>
  );
};

export default CounselorCard;
