import React, { useEffect, useRef, useState } from "react";
import { EmpoweringSectionWrapper } from "../style";
import CustomButton from "../../CustomButton";
import { CheckIcon } from "../assets/icons";
import empowermentImage1 from "../assets/images/empowerment-img-1.png";
import empowermentImage2 from "../assets/images/empowerment-img-2.png";
import empowermentImage3 from "../assets/images/empowerment-img-3.png";
import empowermentImage4 from "../assets/images/empowerment-img-4.png";
import ButtonRow from "../../CustomButton/CustomButtonRow";
import { useRouter } from "next/router";
import ApiConfig from "../../../config/apiConfig";
import { GoArrowRight } from "react-icons/go";
import Link from "next/link";
import GetStartedForm from "../../GetStartedForm";

const EmpoweringMentalHealth = () => {

  const [isOpen, setIsOpen] = useState(false);
    const sidebarRef = useRef(null);
  
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };
  
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
  const [showModal, setShowModal] = useState(false);
  
    const handleGetStarted = () => {
      setShowModal(true);
    };
    const closeModal = () => setShowModal(false)
  const providerTypes = [
    {
      title: "Private Practitioners",
      description:
        "Independent professionals delivering care seamlessly with the full power of MindBridge's toolkit.",
      imagePlaceholder: empowermentImage1.src,
    },
    {
      title: "Clinics and Group Practices",
      description:
        "Designed for clinics and group practices to streamline team operation and boost productivity.",
      imagePlaceholder: empowermentImage2.src,
    },
    {
      title: "Educational or Vocational Counselling Centers",
      description: "Support for Educational & Vocationals counseling centers.",
      imagePlaceholder: empowermentImage3.src,
    },
    {
      title: "Registered and Non-profit",
      description:
        "Empowring care, not profit. Join our mission to streamline therapy services -with every session supporting comumunity well-bring.",
      imagePlaceholder: empowermentImage4.src,
    },
  ];
  const router = useRouter();

  return (
    <EmpoweringSectionWrapper>
      <div className="text-content-container text-content-container-empowering">
        <h2 className="empowering-heading">
          Empowering Mental Health Providers
        </h2>

        <button onClick={handleGetStarted} className={`get-started-free-btn`}>
          <span>Get Started Free</span>

          <GoArrowRight className="arrow" />
        </button>
      </div>
      <div className="provider-types-grid">
        {providerTypes.map((type, index) => (
          <div key={index} className="provider-type-item">
            <span className="provider-type-icon">
              <CheckIcon />
            </span>
            <div className="provider-type-text">
              <h4 className="provider-type-title">{type.title}</h4>
              <p className="provider-type-description">{type.description}</p>
            </div>
            <img
              className="provider-type-image-placeholder"
              src={type?.imagePlaceholder}
              alt="card-image"
            />
          </div>
        ))}
      </div>
      {showModal && <GetStartedForm open={showModal} onClose={closeModal} />}
    </EmpoweringSectionWrapper>
  );
};

export default EmpoweringMentalHealth;
