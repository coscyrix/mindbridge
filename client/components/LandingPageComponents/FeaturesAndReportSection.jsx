import React from "react";
import { SwiperSlide } from "swiper/react";
import CustomSwiper from "../Swiper";
import { FeatureAndReportSectionWrapper, FeatureCardWrapper } from "./style";
import { SwiperContentStyles } from "../Swiper/style";
import reportSectionPattern from "./assets/images/reports-section-pattern.png";
import {
  ComplaintLogoIcon,
  GdprLogoIcon,
  HippaLogoIcon,
  PaymentIcon,
  PipedaLogoIcon,
  SecureIcon,
  SimpleIcon,
} from "./assets/icons";
import CustomButton from "../CustomButton";
import reportSectionImage1 from "./assets/images/report-section-image-1.png";
import reportSectionImage2 from "./assets/images/report-section-image-2.png";
import reportSectionImage3 from "./assets/images/report-section-image-3.png";

// Placeholder for the card component within the swiper
const SwiperCard = ({ imagePlaceholder, title }) => (
  <div className="swiper-card">
    <img
      src={imagePlaceholder?.src}
      alt=""
      className="swiper-card-image-placeholder"
    />
    <h4 className="swiper-card-title">{title}</h4>
  </div>
);

const FeatureCard = ({ iconPlaceholder, title, description }) => (
  <FeatureCardWrapper>
    <div className="feature-card">
      <div className="feature-card-icon">{iconPlaceholder}</div>
      <h4 className="feature-card-title">{title}</h4>
      <p className="feature-card-description">{description}</p>
    </div>
  </FeatureCardWrapper>
);

const FeaturesAndReportSection = () => {
  const swiperSlides = [
    {
      imagePlaceholder: reportSectionImage1,
      title: "Stay Organized with Smart Scheduling",
    },
    {
      imagePlaceholder: reportSectionImage2,
      title: "Instant Reporting, Zero Hassle",
    },
    {
      imagePlaceholder: reportSectionImage3,
      title: "Start Sessions in Seconds",
    },
    {
      imagePlaceholder: reportSectionImage2,
      title: "Start Sessions in Seconds",
    },
    {
      imagePlaceholder: reportSectionImage3,
      title: "Start Sessions in Seconds",
    },
    {
      imagePlaceholder: reportSectionImage1,
      title: "Start Sessions in Seconds",
    },
  ];

  const featureCardsData = [
    {
      iconPlaceholder: <SecureIcon />,
      title: "Secure",
      description:
        "Your data stays safe with enterprise-grade security, encryption, and strict privacy controls.",
    },
    {
      iconPlaceholder: <SimpleIcon />,
      title: "Simple",
      description:
        "Simple, intuitive design helps you schedule sessions and manage reports within minutes.",
    },
    {
      iconPlaceholder: <PaymentIcon />,
      title: "Pay-as-You-Go",
      description:
        "Pay only when you use it — no contracts, no subscriptions, just transparent and flexible pricing always.",
    },
  ];

  return (
    <FeatureAndReportSectionWrapper>
      {/* Why MindBridge? Section */}
      <div className="main-section-centered-text">
        <img
          src={reportSectionPattern?.src}
          height={400}
          className="wrapperImage"
        />
        <div className="section-centered-text manual-width">
          <h2 className="section-heading">Why MindBridge?</h2>
          <p className="section-description">
            MindBridge is purpose-built to support mental health professionals
            with the highest standards of security and usability. From
            compliance to care, our platform is designed to simplify, protect,
            and empower your practice.
          </p>
          <div className="logo-container">
            {/* Placeholder Logos */}
            <div>
              <img src="./assets/images/hippa.png" />
            </div>
            <div>
              <img src="./assets/images/pipeda.png" />
            </div>
            <div>
              <img src="./assets/images/eu.png" />
            </div>
            <div>
              <img src="./assets/images/soc.png" />
            </div>
          </div>
        </div>
      </div>

      {/* Features You Can Count On Section */}
      <div className="section-centered-text-card">
        <div className="manual-width">
          <h2 className="section-heading">Features You Can Count On</h2>
          <p className="section-description">
            Discover a smarter way to manage counseling sessions. MindBridge is
            built to be secure, effortless to use, and fair in pricing — so you
            can focus on helping others, not handling tech or costs.
          </p>
          {/* Assuming this button style is unique to this section, keep inline or create specific class if reused */}
          <CustomButton
            customClass="get-started-button"
            title="Get Started Free →"
          />
        </div>
        <div className="feature-cards-container">
          {featureCardsData.map((card, index) => (
            <FeatureCard
              key={index}
              iconPlaceholder={card.iconPlaceholder}
              title={card.title}
              description={card.description}
            />
          ))}
        </div>
      </div>

      {/* From Session To Report Section */}
      <h2 className="swiper-section-heading">
        From Session To Report — <br></br>Seamlessly
      </h2>
      <div className="swiper-container">
        <SwiperContentStyles>
          <CustomSwiper
            customNextAppearance={">"}
            customPrevAppearance={"<"}
            spaceBetween={30}
            slidesPerView={2.5}
            breakpoints={{
              320: {
                slidesPerView: 1.5,
                spaceBetween: 10,
              },
              640: {
                slidesPerView: 2,
                spaceBetween: 20,
              },
              1024: {
                slidesPerView: 2.5,
                spaceBetween: 30,
              },
            }}
          >
            {swiperSlides.map((slide, index) => (
              <SwiperSlide key={index}>
                <SwiperCard
                  imagePlaceholder={slide.imagePlaceholder}
                  title={slide.title}
                />
              </SwiperSlide>
            ))}
          </CustomSwiper>
        </SwiperContentStyles>
      </div>
    </FeatureAndReportSectionWrapper>
  );
};

export default FeaturesAndReportSection;
