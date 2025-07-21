import React, { useEffect, useRef, useState } from "react";
import { FooterWrapper } from "./style";
import { SUPPORT_EMAIL, DEMO_MAIL_BODY } from "../../utils/constants";
import ButtonRow from "../CustomButton/CustomButtonRow";
import ApiConfig from "../../config/apiConfig";
import { GoArrowRight } from "react-icons/go";
import GetStartedForm from "../GetStartedForm";
const Footer = () => {
  const termsDocUrl = process.env.NEXT_PUBLIC_TERMS_AND_CONDITION;
  const userGuide = process.env.NEXT_PUBLIC_MINDBRIDGE_USER_GUIDE;
  const privacyPractices = process.env.NEXT_PUBLIC_NOTICE_OF_PRIVACY_PRACTICES;
  const privacyPolicy = process.env.NEXT_PUBLIC_PRIVACY_POLICY;
  const learnMore = process.env.NEXT_PUBLIC_LEARN_MORE_VEDIO_LINK;
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
    // console.log("hi")
    setShowModal(true);
  };
  const closeModal = () => setShowModal(false);
  return (
    <FooterWrapper>
      <div className="footer-top-section">
        <div className="footer-contact-section">
          <img
            src="/assets/images/Mindbridge_logo.svg"
            alt="MindBridge"
            className="footer-logo"
          />
          <div className="footer-contact-info">
            <div className="contact-column">
              <p className="contact-label">Email Id</p>
              <p className="contact-value">mindbridge45@gmail.com</p>
            </div>
            <div className="contact-column">
              <p className="contact-label">Phone Number</p>
              <p className="contact-value">+1 678 7889 789</p>
            </div>
          </div>
        </div>
        <div className="footer-cta-section">
          <h2 className="cta-heading">
            The First Step Toward <br />
            Support Starts Here
          </h2>
          <div className="cta-buttons">
            <button onClick={handleGetStarted} className="get-started">
              Get Started <p>Pay only when you earn</p>
            </button>
            <button onClick={handleGetStarted} className="demo-request">
              Request Free Demo
            </button>
          </div>
        </div>
      </div>
      <div className="footer-bottom-section">
        <div className="footer-left">
          <span>
            © 2025 MindBridge Health · Terms of Use · Clinical Membership
          </span>
        </div>
        <div className="footer-right">
          <a href="#">Blog</a>
          <a href={privacyPolicy} download>
            Privacy Policy
          </a>
          <a href={termsDocUrl} download>
            Terms & Conditions
          </a>
        </div>
      </div>
      {showModal && <GetStartedForm open={showModal} onClose={closeModal} />}
    </FooterWrapper>
  );
};

export default Footer;
