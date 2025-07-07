import React from "react";
import { EmpoweringSectionWrapper } from "../style";
import CustomButton from "../../CustomButton";
import { CheckIcon } from "../assets/icons";
import empowermentImage1 from "../assets/images/empowerment-img-1.png";
import empowermentImage2 from "../assets/images/empowerment-img-2.png";
import ButtonRow from "../../CustomButton/CustomButtonRow";
import { useRouter } from "next/router";
import ApiConfig from "../../../config/apiConfig";
const EmpoweringMentalHealth = () => {
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
      imagePlaceholder: empowermentImage1.src,
    },
    {
      title: "Educational or Vocational Counselling Centers",
      description: "Support for Educational & Vocationals counseling centers.",
      imagePlaceholder: empowermentImage2.src,
    },
    {
      title: "Registered and Non-profit",
      description:
        "Empowring care, not profit. Join our mission to streamline therapy services -with every session supporting comumunity well-bring.",
      imagePlaceholder: empowermentImage1.src,
    },
  ];
  const router = useRouter();
  const handleGetStarted = (e) => {
    router.push(ApiConfig.getstartedsubmittion.getstarted);
  };

  return (
    <EmpoweringSectionWrapper>
      <div className="text-content-container">
        <h2 className="empowering-heading">
          Empowering Mental Health
          <br />
          Providers
        </h2>
        <ButtonRow handleGetStarted={handleGetStarted} marginBottom="0px" />
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
    </EmpoweringSectionWrapper>
  );
};

export default EmpoweringMentalHealth;
