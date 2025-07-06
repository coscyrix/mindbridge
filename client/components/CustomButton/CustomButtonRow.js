import React from "react";
import CustomButton from "./index";

import { DEMO_MAIL_BODY, SUPPORT_EMAIL } from "../../utils/constants";
const ButtonRow = ({
  marginBottom = "70px",
  handleGetStarted,
  // mailoronboarding,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: "20px",
      }}
    >
      <CustomButton
        // type="button"
        onClick={handleGetStarted}
        customClass="core-features-button get-started-button"
        title="Get started - pay only when you earn"
      />
      <CustomButton
        customClass="secondary-footer-button"
        style={{ marginBottom: marginBottom }}
        title="Explore Demo – No Credit Card Needed"
        onClick={() => {
          handleGetStarted()
          // if (mailoronboarding) {
          //   handleGetStarted();
          // } else {
          //   window.location.href = `mailto:${SUPPORT_EMAIL}?subject=Demo Request&body=${encodeURIComponent(
          //     DEMO_MAIL_BODY
          //   )}`;
          // }
        }}
      />
    </div>
  );
};

export default ButtonRow;
