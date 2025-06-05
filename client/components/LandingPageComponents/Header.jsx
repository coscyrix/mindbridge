import React, { useState, useEffect, useRef } from "react";
import { HeaderWrapper, MobileNav, Overlay } from "./style";
import CustomButton from "../CustomButton";
import Link from "next/link";
import { useRouter } from "next/router";

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
          <CustomButton
            title="Register for free"
            className="mobile-register-button"
            onClick={() => router.push("/login")}
          />
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
          <nav>
            <ul>
              <li>
                <Link href="#">Insights</Link>
              </li>
              <li>
                <Link href="#">Sessions</Link>
              </li>
              <li>
                <Link href="#">Communication</Link>
              </li>
            </ul>
          </nav>
          <Link href="/login" className="sign-in-link">
            Sign in
          </Link>
          <CustomButton title="Register for free" className="register-button" />
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
        <Link href="/login" className="mobile-sign-in">
          Sign in
        </Link>
        <nav>
          <ul>
            <li>
              <Link href="#">Insights</Link>
            </li>
            <li>
              <Link href="#">Sessions</Link>
            </li>
            <li>
              <Link href="#">Communication</Link>
            </li>
          </ul>
        </nav>
      </MobileNav>
    </HeaderWrapper>
  );
};

export default Header;
