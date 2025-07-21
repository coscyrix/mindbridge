import React, { useState } from "react";
import { useRouter } from "next/router";
import ApiConfig from "../../config/apiConfig";
import { ButtonRowWrapper } from "./style";
import GetStartedForm from "../GetStartedForm";

const ButtonRow = ({
  marginLeft = "0px",
  isNavbar = false,
  isMobile = false,
}) => {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const handleGetStarted = () => {
    // console.log("hi")
    setShowModal(true);
  };
  const closeModal = () => setShowModal(false);
  const redirectToLogin = (e) => {
    router.push("/login");
  };
  const patchColor = isNavbar ? "#FFC004" : "#F6F6F6";
  return (
    <ButtonRowWrapper
      marginLeft={marginLeft}
      isMobile={isMobile}
      isNavbar={isNavbar}
    >
      <button className="get-started-btn" onClick={handleGetStarted}>
        <span>Get Started</span>
        <span className="badge">Pay only when you earn</span>
      </button>
      <button
        className="login-btn"
        onClick={isNavbar ? redirectToLogin : handleGetStarted}
      >
        {isNavbar
          ? "Provider Login"
          : "Explore free Demo- No credit card needed"}
      </button>
      {showModal && <GetStartedForm open={showModal} onClose={closeModal} />}
    </ButtonRowWrapper>
  );
};

export default ButtonRow;
