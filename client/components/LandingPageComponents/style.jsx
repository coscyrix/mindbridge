import styled from "styled-components";
import heroSectionBg from "./assets/images/hero-section-bg.jpg";
import complianceSectionBg from "./assets/images/compliance-section-bg.png";
import heroImg from "./assets/images/heroImg.png";

export const LandingPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

export const HeaderWrapper = styled.div`
  .desktop-header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 60px;
    border-bottom: 1px solid #eee;
    font-size: 0.875rem;
    font-weight: 500;
    height: 70px;
    background-color: white;
    z-index: 999;

    @media (max-width: 768px) {
      display: none;
    }
  }

  .mobile-header {
    display: none;
    padding: 15px 20px;
    border-bottom: 1px solid #eee;
    align-items: center;
    justify-content: space-between;
    height: 70px;

    @media (max-width: 768px) {
      display: flex;
    }

    .mobile-nav-links {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .hamburger {
      border: none;
      background: none;
      padding: 10px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: 4px;

      span {
        display: block;
        width: 24px;
        height: 2px;
        background-color: #333;
        transition: all 0.3s ease;
      }
    }

    .mobile-register-button {
      padding: 8px 15px;
      background-color: var(--primary-button-color);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      &:hover {
        background-color: var(--primary-button-hover-color);
      }
    }
  }

  ul {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
    li {
      margin: 0 15px;
    }
  }

  .nav-item {
    padding: 8px 12px;
  }

  .nav-item:hover {
    background-color: #f8f8f8;
    border-radius: 6px;
  }

  .register-container {
    display: flex;
    align-items: center;

    .register-group {
      display: flex;
      align-items: center;
      gap: 15px; /* Adjust spacing between items */
    }

    .get-started-button {
      padding: 10px 16px;
      background-color: #3973b7;
      color: white;
      border: none;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      white-space: nowrap;

      &:hover {
        background-color: var(--primary-button-hover-color);
      }
    }

    .sign-in-link {
      color: white;
      padding: 8px 14px;
      background-color: #3973b7;
      border-radius: 6px;
      font-weight: 500;
      text-decoration: none;
      white-space: nowrap;

      &:hover {
        background-color: var(--primary-button-hover-color);
      }
    }
  }
`;

export const MobileNav = styled.div`
  position: fixed;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100vh;
  background-color: white;
  z-index: 1000;
  padding: 0;
  transition: transform 0.3s ease-in-out;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);

  &.open {
    transform: translateX(100%);
  }

  &:not(.open) {
    transform: translateX(0%);
  }

  .sidebar-header {
    padding: 20px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
  }

  .close-button {
    border: none;
    background: none;
    padding: 10px;
    cursor: pointer;
    width: 40px;
    height: 40px;
    position: relative;

    span {
      display: block;
      width: 24px;
      height: 2px;
      background-color: #333;
      position: absolute;
      left: 8px;
      transition: all 0.3s ease;

      &:first-child {
        transform: rotate(45deg);
        top: 19px;
      }

      &:last-child {
        transform: rotate(-45deg);
        top: 19px;
      }
    }
  }

  .mobile-sign-in {
    display: block;
    font-size: 1.1rem;
    padding: 20px 20px 0px 20px;
    text-decoration: none;
  }

  nav {
    padding: 20px;

    ul {
      flex-direction: column;
      gap: 20px;
      margin: 0;
      padding: 0;

      li {
        margin: 0;

        a {
          display: block;
          padding: 10px 0;
          font-size: 1.1rem;
          color: #333;
          text-decoration: none;

          &:hover {
            color: var(--primary-button-color);
          }
        }
      }
    }
  }
`;

export const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: none;

  @media (max-width: 768px) {
    display: block;
  }
`;

export const HeroSectionWrapper = styled.div`
  display: flex;
  align-items: center;
  background-color: #f8f5f0;
  height: 700px;
  position: relative;
  z-index: 50;

  @media screen and (max-width: 768px) {
    flex-direction: column;
    height: auto;
    padding: 0;
  }

  h1 {
    font-size: 4.375rem;
    letter-spacing: 2px;
    line-height: 80px;
    font-weight: 500;
    margin: 0px;
    margin-bottom: 28px;

    @media screen and (max-width: 1024px) {
      font-size: 3rem;
      line-height: 60px;
    }

    @media screen and (max-width: 768px) {
      font-size: 2rem;
      line-height: 40px;
      text-align: center;
    }
  }

  h3 {
    margin: 0px;
    font-weight: 600;
    font-size: 1.25rem;
    line-height: 20px;
    letter-spacing: 0%;
    margin-bottom: 20px;

    @media screen and (max-width: 768px) {
      text-align: center;
    }
  }

  p {
    margin: 0px;
    font-weight: 400;
    font-size: 1.25rem;
    line-height: 24px;
    margin-bottom: 40px;

    @media screen and (max-width: 768px) {
      font-size: 1rem;
      text-align: center;
    }
  }

  .features-container {
    flex: 1;
    padding: 90px 80px 90px 63px;

    @media screen and (max-width: 1024px) {
      padding: 90px 40px 90px 63px;
    }

    @media screen and (max-width: 768px) {
      padding: 40px 60px;
      order: 2;
    }
    @media screen and (max-width: 768px) {
      padding: 40px 16px;
    }
  }

  .image-container {
    flex: 1;
    background: url(${heroImg.src});
    background-size: cover;
    background-position: center;
    min-height: 500px;
    height: 100%;
    width: 100%;
    display: block;

    @media screen and (max-width: 768px) {
      order: 1;
      min-height: 300px;
      margin-bottom: 20px;
      display: none;
    }
  }

  .search-bar-container {
    width: 150%;
    position: relative;
    display: flex;
    justify-content: space-between;

    @media screen and (max-width: 768px) {
      width: 100%;
    }
  }

  .values-container {
    display: flex;
    align-items: center;
    gap: 50px;
    margin-top: 15px;

    @media screen and (max-width: 768px) {
      flex-direction: column;
      gap: 20px;
      align-items: center;
    }

    .values-item {
      display: flex;
      align-items: center;
      gap: 5px;
      margin: 0px;
      font-weight: 400;
      font-size: 1.125rem;
      line-height: 24px;

      @media screen and (max-width: 768px) {
        font-size: 1rem;
      }
    }
  }
`;

export const SearchBarWrapper = styled.div`
  &.search-bar-container {
    display: flex;
    align-items: center;
    background-color: white;
    padding: 16px;
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    @media screen and (max-width: 768px) {
      flex-direction: column;
      gap: 20px;
      padding: 20px;
    }
  }

  .search-block {
    display: flex;
    gap: 8px;
    flex: 1;
    border-right: 1px solid #2e2e2e33;
    align-items: flex-start;
    padding-right: 32px;
    margin-right: 32px;

    @media screen and (max-width: 1024px) {
      padding-right: 12px;
      margin-right: 12px;
    }

    @media screen and (max-width: 768px) {
      width: 100%;
      border-right: none;
      border-bottom: 1px solid #2e2e2e33;
      padding-bottom: 15px;
      padding-right: 0px;
      margin-right: 0px;
    }

    h4 {
      margin: 0px;
      font-weight: 600;
      font-size: 1.125rem;
      margin-bottom: 6px;
      color: #3973b7;
    }
  }

  .heading-container {
    width: 100%;
  }

  .no-border {
    border-right: none;
    @media screen and (max-width: 768px) {
      border-bottom: none;
      padding-bottom: 0;
    }
  }

  .icon {
    margin-right: 5px;
  }

  .select-input {
    border: none;
    outline: none;
    font-weight: 500;
    font-size: 0.875rem;
    width: 100%;
  }

  .search-button {
    padding: 14px 20px;
    background-color: #3973b7;
    color: white;
    border: none;
    border-radius: 4px;
    text-align: center;
    cursor: pointer;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 8px;
    @media screen and (max-width: 768px) {
      width: 300px;
      justify-content: center;
    }

    &:hover {
      background-color: var(--primary-button-hover-color);
    }
  }
`;

export const FeatureAndReportSectionWrapper = styled.div`
  .main-section-centered-text {
    display: flex;
    text-align: center;
    margin-bottom: 50px;
    justify-content: center;
    position: relative;
    @media screen and (max-width: 768px) {
      padding: 0px 60px;
    }
    @media screen and (max-width: 425px) {
      padding: 0px 16px;
    }
  }

  .wrapperImage {
    position: absolute;
    top: 25px;
    left: 0px;
    width: 210px;
  }

  .section-centered-text-card {
    background: #f8f6f0;
    margin: 0px 90px;
    border-radius: 12px;
    padding: 100px 174px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;

    @media screen and (max-width: 1024px) {
      padding: 100px 144px;
    }
    @media screen and (max-width: 768px) {
      margin: 0px 60px;
      padding: 50px 16px;
    }
    @media screen and (max-width: 425px) {
      margin: 0px 16px;
      padding: 50px 16px;
    }
  }
  .manual-width {
    max-width: 730px;
    align-items: center;
    display: flex;
    flex-direction: column;
    @media screen and (max-width: 768px) {
      max-width: 100%;
    }
    @media screen and (max-width: 425px) {
      max-width: 100%;
    }
  }

  .section-heading {
    font-size: 2.8125rem;
    margin: 0px;
    padding-top: 67px;
    padding-bottom: 16px;
    font-weight: 600;
  }

  .section-description {
    margin: 0px;
    font-weight: 400;
    font-size: 1rem;
    line-height: 24px;
    letter-spacing: 0%;
    padding-bottom: 30px;
  }

  .logo-container {
    display: flex;
    justify-content: center;
    gap: 30px;
    height: 60px;
    padding-bottom: 100px;
    svg {
      color: black;
    }
    @media screen and (max-width: 425px) {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }
  }

  .get-started-button {
    padding: 14px 20px;
    background-color: #3973b7;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-bottom: 40px;
    &:hover {
      background-color: var(--primary-button-hover-color);
    }
  }

  .feature-cards-container {
    display: flex;
    justify-content: center;
    gap: 20px;
    @media screen and (max-width: 425px) {
      gap: 8px;
      flex-direction: column;
    }
  }

  .swiper-section-heading {
    margin: 0px;
    font-weight: 400;
    font-size: 2.8125rem;
    text-transform: capitalize;
    margin: 100px 90px 40px 90px;
    @media screen and (max-width: 768px) {
      margin: 100px 60px 40px 60px;
    }
    @media screen and (max-width: 425px) {
      margin: 100px 16px 40px 16px;
      font-size: 1.8125rem;
    }
  }

  .swiper-container {
    margin: 0px 90px;
    margin-bottom: 100px;
    @media screen and (max-width: 768px) {
      margin: 0px 60px;
    }
    @media screen and (max-width: 425px) {
      margin: 0px 16px;
      margin-bottom: 100px;
    }
  }

  .custom-swiper-container {
    position: relative;
  }

  .custom-swiper-buttons-container {
    position: absolute;
    top: -90px;
    right: 0px;
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: center;
    .swiper-button-disabled {
      background-color: transparent !important;
      border: 1px solid #e9e9e9 !important;
    }

    .custom-swiper-prev-button,
    .custom-swiper-next-button {
      width: 51px;
      height: 51px;
      border-radius: 50%;
      border: none;
      background-color: #dbebff;
    }
  }
`;

export const FeatureCardWrapper = styled.div`
  flex: 1;
  padding: 30px;
  box-shadow: 0px 2px 4px 0px #3973b70d;
  border-radius: 12px;
  text-align: center;
  background-color: white;
  @media screen and (max-width: 425px) {
    padding: 12px;
  }
  h4,
  p {
    margin: 0px;
  }

  .feature-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }

  .feature-card-icon {
    font-size: 2em;
  }

  .feature-card-title {
    font-weight: 600;
    font-size: 1.25rem;
  }
  .feature-card-description {
    font-weight: 400;
    font-size: 1rem;
    line-height: 22px;
    letter-spacing: 0%;
    text-align: center;
  }
`;

export const HelpSectionWrapper = styled.section`
  background-color: #3973b7;
  color: white;
  text-align: center;
  padding: 95px 300px;
  @media screen and (max-width: 768px) {
    padding: 95px 60px;
  }
  @media screen and (max-width: 425px) {
    padding: 95px 16px;
  }

  .help-heading {
    font-weight: 400;
    font-size: 2.8125rem;
    text-align: center;
    text-transform: capitalize;
    margin: 0px;
    margin-bottom: 16px;
  }

  .help-description {
    font-weight: 400;
    font-size: 1rem;
    line-height: 24px;
    text-align: center;
    margin: 0px;
    margin-bottom: 30px;
  }

  .buttons-container {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 15px;
  }

  .topic-button {
    padding: 10px 20px;
    background-color: transparent;
    color: white;
    border: 1px solid white;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    font-size: 0.875rem;
  }
`;

export const CoreFeaturesSectionWrapper = styled.section`
  display: flex;
  padding: 100px 90px;
  background-color: white;
  gap: 30px;
  @media screen and (max-width: 1024px) {
    padding: 100px 90px;
    flex-direction: column;
  }
  @media screen and (max-width: 768px) {
    padding: 100px 60px;
  }
  @media screen and (max-width: 425px) {
    padding: 100px 16px;
  }

  .text-content-container {
    flex: 1;
  }

  .core-features-heading {
    font-weight: 400;
    font-size: 2.8125rem;
    text-transform: capitalize;
    margin: 0px;
    margin-bottom: 16px;
  }

  .core-features-description {
    font-weight: 400;
    font-size: 1rem;
    line-height: 24px;
    margin: 0px;
    margin-bottom: 30px;
  }

  .core-features-button {
    padding: 14px 20px;
    background-color: #3973b7;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    &:hover {
      background-color: var(--primary-button-hover-color);
    }
  }

  .cards-grid-container {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
`;

export const TrustAndComplianceSectionWrapper = styled.section`
  display: flex;
  align-items: center;
  padding: 70px 90px;
  @media screen and (max-width: 768px) {
    padding: 70px 60px;
  }
  @media screen and (max-width: 425px) {
    padding: 70px 16px;
  }
  background: url(${complianceSectionBg.src});
  background-size: cover;
  background-position: center;
  min-height: 550px;
  height: 100%;
  width: 100%;

  .text-content-wrapper {
    flex: 1;
    margin-right: 50px;
    background-color: white;
    padding: 75px 60px;
    border-radius: 12px;
    max-width: 650px;

    @media screen and (max-width: 1024px) {
      max-width: 520px;
    }

    @media screen and (max-width: 768px) {
      margin-right: 220px;
      padding: 75px 15px;
    }
    @media screen and (max-width: 425px) {
      padding: 75px 30px;
    }
  }

  .trust-section-heading {
    margin: 0px;
    font-weight: 400;
    font-size: 2.8125rem;
    text-transform: capitalize;
    margin-bottom: 30px;
  }

  .features-list {
    display: flex;
    flex-direction: column;
    padding: 0px;
    gap: 18px;
  }

  .feature-item {
    margin: 0px;
    font-weight: 400;
    font-size: 1rem;
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .image-container {
    flex: 1;
  }

  .image-placeholder {
    width: 100%;
    height: 400px;
    background-color: #ccc;
    display: flex;
    justify-content: center;
    align-items: center;
  }
`;

export const EmpoweringSectionWrapper = styled.section`
  padding: 100px 90px;
  background-color: white;

  @media screen and (max-width: 768px) {
    padding: 100px 60px;
  }

  @media screen and (max-width: 425px) {
    padding: 100px 16px;
  }

  .text-content-container {
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: end;
    margin-bottom: 50px;
    @media screen and (max-width: 425px) {
      align-items: baseline;
      flex-direction: column;
    }
  }

  .empowering-heading {
    margin: 0px;
    font-weight: 400;
    font-size: 2.8125rem;
    text-transform: capitalize;
    @media screen and (max-width: 425px) {
      font-size: 2rem;
    }
  }

  .get-started-button {
    padding: 14px 20px;
    background-color: #3973b7;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .provider-types-grid {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
  }

  .provider-type-item {
    display: flex;
    align-items: flex-start;
    gap: 15px;
    align-items: start;
    @media screen and (max-width: 425px) {
      flex-direction: column-reverse;
    }
  }

  .provider-type-icon {
    color: #4682b4;
    font-size: 1.2em;
    @media screen and (max-width: 425px) {
      display: none;
    }
  }

  .provider-type-text {
    flex: 1;
  }

  .provider-type-title {
    margin: 0px;
    font-weight: 600;
    font-size: 1.25rem;
    margin-bottom: 10px;
  }

  .provider-type-description {
    margin: 0px;
    font-weight: 400;
    font-size: 1rem;
    line-height: 22px;
  }

  .provider-type-image-placeholder {
    width: 129px;
    height: 109px;
    object-fit: cover;
    background-color: #ccc;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 5px;
    @media screen and (max-width: 425px) {
      width: 100%;
      height: 150px;
    }
  }
`;

export const CoreFeatureCardWrapper = styled.div`
  padding: 30px;
  border: 1px solid #eee;
  border-radius: 12px;
  text-align: left;
  background-color: #f8f5f0;
  min-height: 150px;
  display: flex;
  gap: 16px;
  min-width: 340px;

  @media screen and (max-width: 768px) {
    min-width: unset;
  }

  @media screen and (max-width: 425px) {
    min-width: unset;
    padding: 15px;
    gap: 8px;
  }

  .icon-placeholder {
    font-size: 1.5em;
    margin-bottom: 10px;
  }

  .title {
    margin: 0px;
    font-weight: 600;
    font-size: 1.25rem;
    margin-bottom: 10px;
  }

  .description {
    margin: 0px;
    font-weight: 400;
    font-size: 1rem;
    line-height: 22px;
  }
`;

export const WorkFlowSectionWrapper = styled.section`
  background-color: #3973b7;
  color: white;
  padding: 100px 0px 100px 90px;
  display: flex;
  align-items: center;
  gap: 36px;

  @media screen and (max-width: 768px) {
    padding: 100px 60px 120px 60px;
    flex-direction: column;
    gap: 50px;
  }

  @media screen and (max-width: 425px) {
    padding: 100px 16px 120px 16px;
    flex-direction: column;
    gap: 50px;
  }

  .left-content-container {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 0;
    @media screen and (max-width: 768px) {
      flex-direction: column;
      width: 100%;
    }
  }

  .small-images-container {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-right: 20px;

    @media screen and (max-width: 1024px) {
      display: none;
    }
  }

  .small-image-placeholder {
    width: 99px;
    height: 96px;
    object-fit: cover;
    background-color: #ccc;
    border-radius: 5px;
  }

  .large-image-placeholder {
    flex: 1;
    width: 70%;
    height: 460px;
    background-color: #ccc;
    border-radius: 5px;
    @media screen and (max-width: 768px) {
      object-fit: cover;
      max-height: 510px;
      width: 100%;
    }
  }

  .right-content-container {
    max-width: 50%;
    .swiper-slide {
      max-width: 256px !important;
    }
    @media screen and (max-width: 768px) {
      max-width: 100%;
    }
  }

  .workflow-heading,
  .workflow-heading-mob {
    margin: 0px;
    font-weight: 400;
    font-size: 2.8125rem;
    text-transform: capitalize;
    margin-bottom: 50px;
    @media screen and (max-width: 768px) {
      text-align: center;
    }
  }

  .workflow-heading {
    @media screen and (max-width: 768px) {
      display: none;
    }
  }
  .workflow-heading-mob {
    display: none;
    @media screen and (max-width: 768px) {
      display: block;
      margin-bottom: 0px;
    }
  }

  .workflow-features-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
    margin-bottom: 30px;
  }

  .navigation-arrows {
    display: flex;
    gap: 20px;

    span {
      font-size: 2em;
    }
  }

  .custom-swiper-container {
    position: relative;
  }

  .custom-swiper-buttons-container {
    position: absolute;
    bottom: -90px;
    left: 0px;
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: center;
    .swiper-button-disabled {
      opacity: 0.5;
    }

    .custom-swiper-prev-button,
    .custom-swiper-next-button {
      border: none;
      background-color: transparent;
      color: #fff;
      font-size: 2rem;
    }
  }
`;

export const WorkflowFeatureCardWrapper = styled.div`
  padding: 35px 30px;
  border: 1px solid #eee;
  border-radius: 5px;
  background-color: white;
  text-align: left;
  color: #000;

  @media screen and (max-width: 768px) {
    padding: 35px 10px;
  }

  .title {
    margin: 0px;
    font-weight: 600;
    font-size: 1.25rem;
    margin-bottom: 14px;
  }

  .description {
    margin: 0px;
    font-weight: 400;
    font-size: 1rem;
    line-height: 22px;
  }
`;

export const MindbridgeJourneyWrapper = styled.section`
  padding: 100px 90px 120px 90px;
  background-color: #fff;
  @media screen and (max-width: 768px) {
    padding: 70px 60px 0px 60px;
  }
  @media screen and (max-width: 425px) {
    padding: 100px 16px 120px 16px;
  }

  .top-content-container {
    display: flex;
    margin-bottom: 40px;
    flex: 1;
    gap: 80px;
    @media screen and (max-width: 768px) {
      flex-direction: column;
    }
  }

  .mindbridge-heading {
    margin: 0px;
    font-weight: 400;
    font-size: 2.8125rem;
    text-transform: capitalize;
    margin-bottom: 15px;
  }

  .mindbridge-description {
    margin: 0px;
    font-weight: 400;
    font-size: 1rem;
    line-height: 24px;
    margin-bottom: 30px;
  }

  .get-started-button {
    padding: 10px 20px;
    background-color: var(--primary-button-color);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    &:hover {
      background-color: var(--primary-button-hover-color);
    }
  }

  .image-container {
    flex: 1;
  }

  .image-placeholder {
    width: 100%;
    height: 350px;
    background-color: #ccc;
    border-radius: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .steps-container {
    display: flex;
    justify-content: space-around;
    text-align: center;
    @media screen and (max-width: 425px) {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }
  }

  .step-item {
    flex: 1;
    padding: 0 10px;
  }

  .step-icon-container {
    width: 60px;
    height: 60px;
    background-color: #f8f6f0;
    border-radius: 50%;
    margin: 0 auto 15px auto;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 2em;
    color: #4682b4;
  }

  .step-title {
    margin: 0px;
    font-weight: 400;
    font-size: 1rem;
    color: #2e2e2e;
  }

  .step-description {
    margin: 0px;
    font-weight: 600;
    font-size: 1rem;
    line-height: 24px;
    text-align: center;
    color: #2e2e2e;
  }
`;

export const FooterWrapper = styled.footer`
  background-color: #467bbb;
  color: white;
  padding: 70px 90px 0px 90px;
  text-align: center;

  @media screen and (max-width: 768px) {
    padding: 70px 60px 0px 60px;
  }

  @media screen and (max-width: 425px) {
    padding: 70px 16px 0px 16px;
  }

  .call-to-action-section {
    margin-bottom: 50px;
  }

  .cta-heading {
    margin: 0px;
    font-weight: 400;
    font-size: 2.8125rem;
    text-align: center;
    margin-bottom: 15px;
  }

  .cta-description {
    margin: 0px;
    font-weight: 400;
    font-size: 1rem;
    line-height: 24px;
    text-align: center;
    margin-bottom: 30px;
  }

  .cta-buttons-container {
    display: flex;
    align-item: center;
    justify-content: center;
    gap: 20px;
    margin-bottom: 70px;
  }

  .primary-footer-button {
    padding: 10px 20px;
    background-color: white;
    color: #3973b7;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    font-size: 0.875rem;
  }

  .secondary-footer-button {
    padding: 10px 20px;
    background-color: transparent;
    color: #fff;
    border: 1px solid white;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    font-size: 0.875rem;
  }

  .footer-nav-newsletter-container {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    text-align: left;
    margin-bottom: 60px;
  }

  .footer-nav-column {
    flex-basis: 150px;
    margin-bottom: 20px;
  }

  .footer-heading {
    margin: 0px;
    font-weight: 500;
    font-size: 1.25rem;
    text-align: left;
    margin-bottom: 12px;
  }

  .footer-list {
    display: flex;
    flex-direction: column;
    list-style: none;
    padding: 0;
    gap: 12px;
  }

  .footer-list-item {
    color: white;
    text-decoration: none;
    font-weight: 400;
    font-size: 1rem;
    line-height: 24px;
  }

  .newsletter-container {
    flex-basis: 325px;
    margin-bottom: 20px;
    @media screen and (max-width: 425px) {
      flex-basis: unset;
    }
  }

  .newsletter-input-container {
    display: flex;
    align-items: center;
    border: 1px solid white;
    border-radius: 4px;
    padding: 10px;
    height: 44px;
  }

  .newsletter-input {
    border: none;
    outline: none;
    background-color: transparent;
    color: white;
    flex: 1;

    &::placeholder {
      color: rgba(255, 255, 255, 0.7);
    }
  }

  .newsletter-arrow {
    margin-left: 10px;
  }

  .copyright {
    border-top: 1px solid #ffffff33;
    padding: 15px 0px;
    font-weight: 400;
    font-size: 0.875rem;
    line-height: 24px;
    text-align: center;
  }
`;
