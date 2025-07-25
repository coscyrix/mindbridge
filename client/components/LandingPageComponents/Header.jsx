import React, { useState, useEffect, useRef } from "react";
import { HeaderWrapper, MobileNav, Overlay } from "./style";
import CustomButton from "../CustomButton";
import Link from "next/link";
import { useRouter } from "next/router";
import ApiConfig from "../../config/apiConfig";
import ButtonRow from "../CustomButton/CustomButtonRow";
import GetStartedForm from "../GetStartedForm";

const Header = () => {
  const router = useRouter();

  return (
    <HeaderWrapper>
      <div className="mobile-header">
        <div
          className="logo"
          onClick={() => {
            router.push("/");
          }}
        >
          <img
            height="41px"
            src="/assets/images/Mindbridge_logo.svg"
            alt="company-logo"
          />
        </div>
        <div className="mobile-actions">
          <Link href="get-started-form">
            <button className="get-started">
              Get Started
              <span className="earn-badge">Pay only when you earn</span>
            </button>
          </Link>

          <Link href="/login">
            <div className="user-icon">
              <img
                height={20}
                width={20}
                src="/assets/images/gg_profile.png"
                alt="User"
              />
            </div>
          </Link>
        </div>
      </div>

      <div className="desktop-header">
        <div
          className="logo"
          onClick={() => {
            router.push("/");
          }}
        >
          <img
            height="41px"
            src="/assets/images/Mindbridge_logo.svg"
            alt="company-logo"
          />
        </div>
        <div className="register-container">
          <div className="register-group">
            <ButtonRow marginBottom="10px" isNavbar={true}></ButtonRow>
          </div>
        </div>
      </div>
    </HeaderWrapper>
  );
};

export default Header;
