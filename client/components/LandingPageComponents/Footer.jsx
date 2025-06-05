import React from "react";
import { FooterWrapper } from "./style";
import CustomButton from "../CustomButton";

const Footer = () => {
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
        <div className="cta-buttons-container">
          <CustomButton
            customClass="primary-footer-button"
            title="Get Started Free →"
          />
          <CustomButton
            customClass="secondary-footer-button"
            title="Get Started Free →"
          />
        </div>
      </div>

      {/* Footer Navigation and Newsletter */}
      <div className="footer-nav-newsletter-container">
        <div className="footer-nav-column">
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
        </div>
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
              <a href="#" className="footer-list-item">
                Guides
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
        <div className="newsletter-container">
          <h4 className="footer-heading">Sign Up For Newsletter</h4>
          <div className="newsletter-input-container">
            <input
              type="email"
              placeholder="Enter your email"
              className="newsletter-input"
            />
            <span className="newsletter-arrow">→</span>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="copyright">
        © 2025 MindBridge HealthTerms of Use Clinical Membership Terms &
        Conditions Privacy Policy Notice of Privacy Practices
      </div>
    </FooterWrapper>
  );
};

export default Footer;
