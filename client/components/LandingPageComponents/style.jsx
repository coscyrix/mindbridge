import styled from "styled-components";
import heroSectionBg from "./assets/images/hero-section-bg.jpg";
import complianceSectionBg from "./assets/images/compliance-section-bg.png";
import heroImg from "./assets/images/heroImg.png";
import heroImg11 from "./assets/images/heroImg11.png";
export const LandingPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  @media (max-width: 768px) {
    padding: 20px;
  }
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

    @media (max-width: 770px) {
      display: none;
    }
  }
  .logo {
    cursor: pointer;
  }

  .mobile-header {
  display: none;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #fff;
  @media (max-width: 768px) {
    display:flex;
    position: fixed;
    z-index: 10;
    width: 100%;

  }
}

.mobile-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.get-started {
  background-color: #3a78c9;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.earn-badge {
  background-color: #ffc107;
  color: #000;
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 600;
  @media (max-width: 460px) {
    display: none;
  }
}

.user-icon img {
  height: 36px;
  width: 36px;
  border-radius: 50%;
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
      font-size: 14px;
      height: 38px;
      font-family: Dmsans;
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
      // padding-top: 17px;
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

// export const HeroSectionWrapper = styled.div`
//   background: url(${heroImg11.src});
//   background-size: contain;
//   background-repeat: no-repeat;
//   display: flex;
//   align-items: center;
//   background-color: #f8f5f0;
//   height: 700px;
//   position: relative;
//   z-index: 50;

//   @media screen and (max-width: 768px) {
//     background: none;
//     flex-direction: column;
//     height: auto;
//     padding: 0;
//   }

//   h1 {
//     font-size: 3.75rem;
//     letter-spacing: 2px;
//     line-height: 80px;
//     font-weight: 500;
//     margin: 0px;
//     margin-bottom: 28px;
//     font-family: Playfair Display;

//     @media screen and (max-width: 1024px) {
//       font-size: 3rem;
//       line-height: 60px;
//     }

//     @media screen and (max-width: 768px) {
//       font-size: 2rem;
//       line-height: 40px;
//       text-align: center;
//     }
//   }

//   h3 {
//     margin: 0px;
//     font-weight: 600;
//     font-size: 1.25rem;
//     line-height: 20px;
//     letter-spacing: 0%;
//     margin-bottom: 20px;

//     @media screen and (max-width: 768px) {
//       text-align: center;
//     }
//   }

//   p {
//     margin: 0px;
//     font-weight: 400;
//     font-size: 1.25rem;
//     line-height: 24px;
//     margin-bottom: 40px;

//     @media screen and (max-width: 768px) {
//       font-size: 1rem;
//       text-align: center;
//     }
//   }

//   .features-container {
//     width: 60%;
//     padding: 90px 80px 90px 63px;

//     @media screen and (max-width: 1024px) {
//       padding: 90px 40px 90px 63px;
//     }

//     @media screen and (max-width: 768px) {
//       padding: 40px 60px;
//       order: 2;
//     }
//     @media screen and (max-width: 768px) {
//       padding: 40px 16px;
//     }
//   }

//   .image-container {
//     width: 40%;
//     background-size: cover;
//     background-position: center;
//     min-height: 500px;
//     height: 80%;
//     display: block;

//     @media screen and (max-width: 768px) {
//       order: 1;
//       min-height: 300px;
//       margin-bottom: 20px;
//       display: none;
//     }
//   }

//   .search-bar-container {
//     width: 170%;
//     position: relative;
//     display: flex;
//     justify-content: space-between;

//     @media screen and (max-width: 768px) {
//       width: 100%;
//     }
//   }

//   .values-container {
//     display: flex;
//     align-items: center;
//     gap: 50px;
//     margin-top: 15px;

//     @media screen and (max-width: 768px) {
//       flex-direction: column;
//       gap: 20px;
//       align-items: center;
//     }

//     .values-item {
//       display: flex;
//       align-items: center;
//       gap: 5px;
//       margin: 0px;
//       font-weight: 400;
//       font-size: 1.125rem;
//       line-height: 24px;

//       @media screen and (max-width: 768px) {
//         font-size: 1rem;
//       }
//     }
//   }
// `;

export const HeroSectionWrapper = styled.div`
  display: flex;
  align-items: center;
  background-color: #f8f5f0;
  height: 700px;
  position: relative;

  @media screen and (max-width: 768px) {
    flex-direction: column;
    height: auto;
    padding: 0;
  }

  .search-container {
    @media screen and (max-width: 770px) {
      display: flex;
      flex-direction: column;
    }
  }

  h1 {
    font-size: 4.375rem;
    letter-spacing: 2px;
    line-height: 80px;
    font-weight: 500;
    margin: 0px;
    margin-bottom: 28px;
    padding-top: 50px;
    font-family: Playfair Display;

    @media screen and (max-width: 1430px) {
      padding-top: 150px;
      font-size: 4rem;
      // font-size: 3rem;
      // line-height: 60px;
    }
    @media screen and (max-width: 1228px) {
      padding-top: 170px;
    }
    @media screen and (max-width: 1024px) {
      margin: 0px;
      font-size: 3rem;
      line-height: 60px;
    }
    @media screen and (max-width: 768px) {
      font-size: 2.75rem;
      line-height: 40px;
      text-align: center;
      padding: 0px;
      margin-top: 35px;
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
      text-align: left;
      padding-top: 20px;
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
    width: 50%;
    @media screen and (max-width: 1024px) {
      padding: 90px 40px 90px 63px;
    }

    @media screen and (max-width: 768px) {
      padding: 40px 60px;
      padding: 40px 16px;
      order: 2;
      width: 95%;
    }
  }
  .paragraph-heading {
    margin: 25px 0px 40px;
  }
  .image-container {
    flex: 1;
    background: url(${heroImg.src});
    background-size: cover;
    background-position: center;
    min-height: 500px;
    height: 100%;
    width: 50%;
    display: block;

    @media screen and (max-width: 768px) {
      order: 4;
      width: 100%;
      height: 100%;
      min-height: 300px;
      margin-bottom: 20px;
      // display: none;
    }
  }

  .search-bar-container {
    width: 180%;
    position: relative;
    display: flex;
    justify-content: space-between;

    @media screen and (max-width: 865px) {
      width: fit-content;
    }
    @media screen and (max-width: 768px) {
      // width: 100%;
      width: auto;
    }
  }

  .values-container {
    display: flex;
    align-items: center;
    gap: 50px;
    margin-top: 15px;

    @media screen and (max-width: 1206px) {
      font-size: 0.5rem;
      // text-align: center;
      white-space: nowrap;
    }

    @media screen and (max-width: 768px) {
      flex-direction: column;
      gap: 20px;
      align-items: center;
      order: -1;
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

// export const SearchBarWrapper = styled.div`
//   &.search-bar-container {
//     display: flex;
//     align-items: center;
//     background-color: white;
//     // padding: 16px;
//     border-radius: 12px;
//     box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

//     @media screen and (max-width: 768px) {
//       flex-direction: column;
//       gap: 20px;
//       padding: 20px;
//     }
//   }

//   .search-block {
//     display: flex;
//     gap: 8px;
//     flex: 1;
//     padding: 18px;
//     border-right: 1px solid #2e2e2e33;
//     align-items: flex-start;
//     padding-right: 32px;
//     white-space: nowrap;

//     @media screen and (max-width: 1024px) {
//       padding-right: 12px;
//       margin-right: 12px;
//     }

//     @media screen and (max-width: 768px) {
//       width: 100%;
//       border-right: none;
//       border-bottom: 1px solid #2e2e2e33;
//       padding-bottom: 15px;
//       padding-right: 0px;
//       margin-right: 0px;
//     }

//     h4 {
//       margin: 0px;
//       font-weight: 600;
//       font-size: 1.125rem;
//       margin-bottom: 6px;
//       color: #3973b7;
//     }
//   }

//   .heading-container {
//     width: 100%;
//   }

//   .no-border {
//     border-right: none;
//     @media screen and (max-width: 768px) {
//       border-bottom: none;
//       padding-bottom: 0;
//     }
//   }

//   .icon {
//     margin-right: 5px;
//   }

//   .select-input {
//     border: none;
//     outline: none;
//     font-weight: 500;
//     font-size: 0.875rem;
//     width: 100%;
//   }

//   .search-button {
//     padding: 14px 20px;
//     background-color: #3973b7;
//     color: white;
//     border: none;
//     border-radius: 4px;
//     text-align: center;
//     cursor: pointer;
//     white-space: nowrap;
//     display: flex;
//     align-items: center;
//     gap: 8px;
//     @media screen and (max-width: 768px) {
//       width: 300px;
//       justify-content: center;
//     }

//     &:hover {
//       background-color: var(--primary-button-hover-color);
//     }
//   }
// `;

export const SearchBarWrapper = styled.div`
  &.search-bar-container {
    display: flex;
    align-items: center;
    background-color: white;
    padding: 15px;
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    @media screen and (max-width: 768px) {
      flex-direction: column;
      gap: 20px;
      padding: 20px;
    }
  }

  .search-block.location-text-icon {
    flex-direction: column;
  }

  .treatment-target-text {
    white-space: nowrap;
  }
  .location-text-icon {
    display: flex;
    // flex-direction: column;
    gap: 10px;
    @media screen and (max-width: 768px) {
      display: flex;
      // flex-direction: column;
      gap: 10px;
      // padding: 20px;
    }
  }
  .search-block {
    // display: flex;
    gap: 8px;
    flex: 1;
    border-right: 1px solid #2e2e2e33;
    align-items: flex-start;
    padding-right: 32px;
    margin-right: 32px;

    @media screen and (max-width: 1224px) {
      padding-right: 12px;
      margin-right: 12px;
      flex-direction: column;
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
    @media screen and (max-width: 768px) {
      border-bottom: none;
      padding-bottom: 0;
    }
  }

  .select-input {
    border: none;
    outline: none;
    font-weight: 500;
    font-size: 0.875rem;
    width: 100%;
  }

  .search-button {
    padding: 10px 12px;
    background-color: var(--primary-button-color);
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
    @media screen and (max-width: 400px) {
      width: 230px;
      justify-content: center;
    }
    @media screen and (max-width: 1000px) {
      // width: 300px;
      // justify-content: center;
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
    padding: 30px 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;

    @media screen and (max-width: 1024px) {
      padding: 100px 144px;
    }
    @media screen and (max-width: 768px) {
      margin: 0px 60px;
      padding: 50px 6px;
    }
    @media screen and (max-width: 425px) {
      margin: 0px 16px;
      padding: 30px 10px;
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
  .manual-width-1 {
    @media screen and (max-width: 1360px) {
      padding-top: 100px;
    }
    @media screen and (max-width: 910px) {
      padding-top: 0px;
    }
  }
  .section-heading {
    font-size: 2.8125rem;
    margin: 0px;
    padding-top: 67px;
    padding-bottom: 16px;
    font-weight: 600;
    font-family: Playfair Display;
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
    @media screen and (max-width: 540px) {
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
    @media screen and (max-width: 1024px) {
      flex-direction: column;
    }
  }

  .swiper-section-heading {
    margin: 0px;
    font-weight: 400;
    font-size: 2.8125rem;
    text-transform: capitalize;
    margin: 100px 90px 40px 90px;
    font-family: Playfair Display;
    @media screen and (max-width: 1000px) {
      font-size: 1.9rem;
    }
    @media screen and (max-width: 768px) {
      margin: 25px 60px 92px 60px;
    }
    @media screen and (max-width: 425px) {
      margin: 100px 16px 100px 16px;
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

  .feature-button {
    margin-bottom: 40px;
  }

  .custom-swiper-buttons-container {
    @media screen and (max-width: 470px) {
      top: -70px;
    }

    position: absolute;
    top: -65px;
    right: 0px;
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: center;

    .custom-swiper-prev-button,
    .custom-swiper-next-button {
      width: 51px;
      height: 51px;
      border-radius: 50%;
      border: 1px solid transparent;
      background-color: #2e2e2e;
      color: white;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    button:disabled {
      background-color: white;
      color: black;
      border-color: black;
    }
  }
`;

export const FeatureCardWrapper = styled.div`
  flex: 1;
  height: 262px;
  width: 284px;
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
  padding: 95px 223px;
  @media screen and (max-width: 768px) {
    padding: 45px 60px;
    margin-top: 58px;
  }
  @media screen and (max-width: 425px) {
    padding: 95px 16px;
  }

  .help-heading {
    font-family: Playfair Display;
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
    font-family: Playfair Display;
  }

  .explore-feature-core-button {
    margin-left: -10px;
    white-space: nowrap;
  }

  @media (max-width: 1024px) {
    .explore-feature-core-button {
      margin-left: -100px;
    }
  }

  @media (max-width: 768px) {
    .explore-feature-core-button {
      margin-left: -40px;
    }
  }

  @media (max-width: 480px) {
    .explore-feature-core-button {
      margin-left: 0;
    }
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

    @media screen and (max-width: 1255px) {
      grid-template-columns: repeat(1, 1fr);
    }
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
    font-family: Playfair Display;
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
  .image-container-journey {
    width: 50%;
    height: auto;
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
    padding: 100px 15px;
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
    width: 50% @media screen and (max-width: 425px) {
      align-items: baseline;
      width: 100%;
      flex-direction: column;
    }
    @media screen and (max-width: 425px) {
      align-items: baseline;
      width: 100%;
      flex-direction: column;
      align-items: center;
      gap: 20px;
    }
    @media screen and (max-width: 725px) {
      // align-items: baseline;
      width: 100%;
      flex-direction: column;
      align-items: flex-start;
      gap: 20px;
    }
  }
  text-content-container-Journey {
    @media screen and (max-width: 1091px) {
    }
  }

  .empowering-heading {
    margin: 0px;
    font-weight: 400;
    font-size: 2.8125rem;
    text-transform: capitalize;
    font-family: Playfair Display;
    @media screen and (max-width: 425px) {
      font-size: 2rem;
      text-align: center;
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
    @media screen and (max-width: 675px) {
      grid-template-columns: 1fr;
    }
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
  // min-width: 340px;

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
    padding: 45px 60px 120px 60px;
    flex-direction: column;
    gap: 50px;
  }

  @media screen and (max-width: 425px) {
    padding: 35px 16px 120px 16px;
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
    object-fit: cover;
    @media screen and (max-width: 768px) {
      object-fit: cover;
      max-height: 510px;
      width: 100%;
      margin-top: 35px;
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
    font-family: Playfair Display;
    margin-bottom: 50px;
    @media screen and (max-width: 768px) {
      font-family: Playfair Display;
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
    bottom: -36px;
    // left: -30px;
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: center;
    // .swiper-button-disabled {
    //   opacity: 0.5;
    // }

    .custom-swiper-prev-button,
    .custom-swiper-next-button {
      border: none;
      background-color: transparent;
      color: #fff;
      font-size: 2rem;
      width: 32px;
      height: 32px;
    }
  }
`;

export const WorkflowFeatureCardWrapper = styled.div`
  padding: 16px 30px;
  border: 1px solid #eee;
  border-radius: 5px;
  background-color: #f8f6f0;
  text-align: left;
  color: #000;

  @media screen and (max-width: 768px) {
    padding: 35px 10px;
  }

  .title {
    margin: 0px;
    font-weight: 600;
    font-size: 1.25rem;
    margin-bottom: 8px;
  }

  .description {
    margin: 0px;
    font-weight: 400;
    font-size: 1rem;
    line-height: 22px;
  }
`;

export const MindbridgeJourneyWrapper = styled.section`
  padding: 20px;
  background-color: #fff;
  @media screen and (max-width: 768px) {
    padding: 70px 60px 0px 60px;
  }
  @media screen and (max-width: 425px) {
    padding: 70px 60px 0px 60px
  }

  .image-journey{
  height:auto;
  }

  .text-content-container-Journey {
   @media screen and (max-width: 780px) {
    width:100%;
  }
    width: 50%;
    
  }
  .image-container-journey{
  width:50%;
   @media screen and (max-width: 780px) {
    width:100%;
  }
  }
  .top-content-container {
    display: flex;
    margin-bottom: 40px;
    flex: 1;
    gap: 35px;
    @media screen and (max-width: 768px) {
      flex-direction: column;
    }
  }
.explore-feature-core-button {
    margin-left:40px;
    white-space: nowrap;
  }

  @media (max-width: 1024px) {
    .explore-feature-core-button {
      margin-left: -100px;
    }
  }

  @media (max-width: 768px) {
    .explore-feature-core-button {
      margin-left: -40px;
    }
  }

  @media (max-width: 480px) {
    .explore-feature-core-button {
      margin-left: 0;
    }
  }


  .mindbridge-heading {
    margin: 0px;
    font-weight: 400;
    font-size: 2.8125rem;
    text-transform: capitalize;
    margin-bottom: 15px;
    font-family:Playfair Display;
  }

  .mindbridge-description {
    margin: 0px;
    font-weight: 400;
    font-size: 1rem;
    line-height: 24px;
    margin-bottom: 30px;
  }

  // .get-started-button {
  //   padding: 10px 20px;
  //   background-color: var(--primary-button-color);
  //   color: white;
  //   border: none;
  //   border-radius: 4px;
  //   cursor: pointer;
  //   &:hover {
  //     background-color: var(--primary-button-hover-color);
  //   }
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
    display: grid;
    justify-content: center;
    grid-template-columns: repeat(4, 1fr);
    text-align: center;
    @media screen and (max-width: 770px) {
      display: grid;
      grid-template-columns: repeat(1, 1fr);
      gap: 20px;
      margin-bottom:25px;
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
        width: 80%;
    margin: auto;
  }
`;

export const FooterWrapper = styled.footer`
  background-color: #467bbb;
  color: #ffffff;
  padding: 70px 90px 0 90px;

  @media screen and (max-width: 768px) {
    padding: 60px 40px 0 40px;
  }

  @media screen and (max-width: 425px) {
    padding: 50px 20px 0 20px;
  }

  .footer-top-section {
    display: flex;
    justify-content: space-between;
    gap: 30px;
    flex-wrap: wrap;
    align-items: flex-start;

    @media screen and (max-width: 768px) {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
  }

  .footer-contact-section {
    display: flex;
    flex-direction: column;
    gap: 20px;

    .footer-logo {
      width: 160px;
      height: auto;
    }

    .footer-contact-details {
      font-size: 0.95rem;

      p {
        margin: 0;
        font-weight: 400;
        line-height: 24px;
      }

      strong {
        display: block;
        margin-bottom: 4px;
      }
    }

    @media screen and (max-width: 768px) {
      align-items: center;
    }
  }
  .footer-contact-info {
    display: flex;
    gap: 60px;
    margin-top: 40px;
    margin-bottom: 40px;
    flex-wrap: wrap;

    @media screen and (max-width: 768px) {
      flex-direction: column;
      gap: 20px;
      align-items: center;
      text-align: center;
    }

    .contact-column {
      min-width: 180px;
    }

    .contact-label {
      font-weight: 600;
      font-size: 1rem;
      margin-bottom: 4px;
    }

    .contact-value {
      font-weight: 400;
      font-size: 1rem;
      margin: 0;
    }
  }

  .footer-cta-section {
    text-align: right;
    flex: 1;

    @media screen and (max-width: 768px) {
      text-align: center;
    }

    .cta-heading {
      font-size: 2.5rem;
      font-family: "Playfair Display", serif;
      font-weight: 500;
      margin-bottom: 20px;
    }

    .cta-buttons {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      justify-content: flex-end;

      @media screen and (max-width: 768px) {
        justify-content: center;
      }

      button {
        padding: 10px 14px;
        border-radius: 4px;
        font-weight: 500;
        font-size: 14px;
        cursor: pointer;
        white-space: nowrap;
        border: none;
      }

      .get-started {
        background: #FFFFFF
        color: #3973b7;
        border: 1px solid white;
        display: flex;
        gap: 10px;
      }

      .pay-only {
        background: #fdbb14;
        color: black;
      }

      .demo-request {
        background: transparent;
        color: white;
        border: 1px solid white;
      }
    }
  }

  .footer-bottom-section {
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    margin-top: 60px;
    padding: 20px 0;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    font-size: 14px;

    .footer-left {
      flex: 1;
      @media screen and (max-width: 768px) {
        text-align: center;
        margin-bottom: 10px;
      }
    }

    .footer-right {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;

      @media screen and (max-width: 768px) {
        justify-content: center;
        width: 100%;
      }

      a {
        color: white;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
`;
