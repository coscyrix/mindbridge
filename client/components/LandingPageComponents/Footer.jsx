import React from "react";
import { FooterWrapper } from "./style";
import { useRouter } from "next/router";
import { SUPPORT_EMAIL, DEMO_MAIL_BODY } from "../../utils/constants";
import ButtonRow from "../CustomButton/CustomButtonRow";
import ApiConfig from "../../config/apiConfig";
const Footer = () => {
  const termsDocUrl = process.env.NEXT_PUBLIC_TERMS_AND_CONDITION;
  const userGuide = process.env.NEXT_PUBLIC_MINDBRIDGE_USER_GUIDE;
  const privacyPractices = process.env.NEXT_PUBLIC_NOTICE_OF_PRIVACY_PRACTICES;
  const privacyPolicy = process.env.NEXT_PUBLIC_PRIVACY_POLICY;
  const learnMore = process.env.NEXT_PUBLIC_LEARN_MORE_VEDIO_LINK
  const router = useRouter();
  const handleGetStarted = (e) => {
    router.push(ApiConfig.getstartedsubmittion.getstarted);
  };
  return (
    <FooterWrapper>
      {/* Call to Action Section */}
      <div className="call-to-action-section">
        <h2 className="cta-heading">
          The First Step Toward Support
          <br />
          Starts Here
        </h2>
        <p className="cta-description">
          We&apos;re here to help. Set up a free 15-minute call to connect and
          explore
          <br />
          your needs.
        </p>

        <ButtonRow
          handleGetStarted={handleGetStarted}
          // mailoronboarding={true}
          marginBottom="40"
        />
      </div>

      {/* Footer Navigation and Newsletter */}
      <div className="footer-nav-newsletter-container">
        {/* <div className="footer-nav-column">
          <h4 className="footer-heading">The Company</h4>
          <ul className="footer-list">
            <li>
              <a href="#" className="footer-list-item">
                Home
              </a>
            </li>
            <li>
              <a href="#" className="footer-list-item">
                Insight
              </a>
            </li>
            <li>
              <a href="#" className="footer-list-item">
                Session
              </a>
            </li>
            <li>
              <a href="#" className="footer-list-item">
                Communication
              </a>
            </li>
          </ul>
        </div> */}
        <div className="footer-nav-column">
          <h4 className="footer-heading">Blog</h4>
          <ul className="footer-list">
            <li>
              <a href="#" className="footer-list-item">
                News
              </a>
            </li>
            <li>
              <a href="#" className="footer-list-item">
                Health Concers
              </a>
            </li>
            <li>
              <a href={userGuide} download className="footer-list-item">
                Guides
              </a>
              
            </li>
            <li>
              <a
                href={learnMore}
                className="footer-list-item"
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn more
              </a>
            </li>
          </ul>
        </div>
        <div className="footer-nav-column">
          <h4 className="footer-heading">Getting Started</h4>
          <ul className="footer-list">
            <li>
              <a href="#" className="footer-list-item">
                FAQ&apos;S
              </a>
            </li>
            <li>
              <a href="#" className="footer-list-item">
                Talk To Advisor
              </a>
            </li>
            <li>
              <a href="#" className="footer-list-item">
                Refer
              </a>
            </li>
          </ul>
        </div>
        <form
          action={`mailto:${SUPPORT_EMAIL}?subject=Demo Request&body=${encodeURIComponent(
            DEMO_MAIL_BODY
          )}`}
          method="POST"
          enctype="text/plain"
        >
          <div className="newsletter-container">
            <h4 className="footer-heading">Sign Up For Newsletter</h4>
            <div className="newsletter-input-container">
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                className="newsletter-input"
                required
              />
              <button type="submit" className="newsletter-arrow">
                →
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Copyright */}
      <div className="copyright">
        <div className="left-block">
          <span>© 2025 MindBridge Health Terms of Use Clinical Membership</span>
        </div>

        <div className="right-block">
          <a href={termsDocUrl} download>
            Terms & Conditions
          </a>
          <a href={privacyPractices} download>
            Notice of Privacy Practices
          </a>
          <a href={privacyPolicy} download>
            Privacy Policy
          </a>
        </div>
      </div>
    </FooterWrapper>
  );
};

export default Footer;
