import React, { useState, useEffect, useRef } from "react";
import { HeaderWrapper, MobileNav, Overlay } from "./style";
import CustomButton from "../CustomButton";
import Link from "next/link";
import { useRouter } from "next/router";
import ApiConfig from "../../config/apiConfig";

const Header = () => {
  const router = useRouter();
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

  const handleGetStarted = () => {
    router.push(ApiConfig.getstartedsubmittion.getstarted);
  };

  return (
    <HeaderWrapper>
      <div className="mobile-header">
        <div className="logo">
          <img
            height="41px"
            src="/assets/images/Mindbridge_logo.svg"
            alt="company-logo"
          />
        </div>
        <div className="mobile-nav-links">
          <button className="hamburger" onClick={() => setIsOpen(true)}>
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      <div className="desktop-header">
        <div className="logo">
          <img
            height="41px"
            src="/assets/images/Mindbridge_logo.svg"
            alt="company-logo"
          />
        </div>
        <div className="register-container">
          <div className="register-group">
            {/* <nav> */}
            {/* <ul>
              <li className="nav-item">
                <Link href="#">Insights</Link>
              </li>
              <li className="nav-item">
                <Link href="#">Sessions</Link>
              </li>
              <li className="nav-item">
                <Link href="#">Communication</Link>
              </li>
            </ul> */}
            {/* </nav> */}
            <CustomButton
              onClick={handleGetStarted}
              customClass="get-started-button"
              title="Get started -pay only when you earn"
            />
           
            <Link href="/login" className="sign-in-link">
              Provider
            </Link>
          </div>
        </div>
      </div>

      {isOpen && <Overlay onClick={() => setIsOpen(false)} />}
      <MobileNav ref={sidebarRef} className={isOpen ? "open" : ""}>
        <div className="sidebar-header">
          <div className="logo">
            <img
              height="41px"
              src="/assets/images/Mindbridge_logo.svg"
              alt="company-logo"
            />
          </div>
          <button className="close-button" onClick={() => setIsOpen(false)}>
            <span></span>
            <span></span>
          </button>
        </div>
        <div className="mobile-register-group">
          <CustomButton
            onClick={handleGetStarted}
            customClass="get-started-button"
            title="Get started -pay only when you earn"
          />
          <Link href="/login" className="mobile-sign-in">
            Provider
          </Link>
        </div>
      </MobileNav>
    </HeaderWrapper>
  );
};

export default Header;
