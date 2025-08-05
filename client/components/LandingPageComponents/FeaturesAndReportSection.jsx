import React from "react";
import { SwiperSlide } from "swiper/react";
import CustomSwiper from "../Swiper";
import { FeatureAndReportSectionWrapper, FeatureCardWrapper } from "./style";
import { SwiperContentStyles } from "../Swiper/style";
import reportSectionPattern from "./assets/images/reports-section-pattern.png";
import { Navigation } from "swiper/modules";
import "swiper/css";
import { useRef, useState } from "react";
import { Swiper } from "swiper/react";
import {
  ArrowIcon,
  ArrowLeft,
} from "./assets/icons";
import { useRouter } from "next/router";
import reportSectionImage1 from "./assets/images/report-section-image-1.png";
import reportSectionImage2 from "./assets/images/report-section-image-2.png";
import reportSectionImage3 from "./assets/images/report-section-image-3.png";
import reportSectionImage4 from "./assets/images/report-section-image-4.png";
import reportSectionImage5 from "./assets/images/report-section-image-5.png";
import Image from "next/image";
import ButtonRow from "../CustomButton/CustomButtonRow";

// Placeholder for the card component within the swiper
const SwiperCard = ({ imagePlaceholder, title }) => (
  <div className="swiper-card">
    <Image
      src={imagePlaceholder?.src}
      alt={title}
      className="swiper-card-image-placeholder"
      width={200}
      height={120}
    />
    <h4 className="swiper-card-title">{title}</h4>
  </div>
);

const FeatureCard = ({ iconPlaceholder, title, description }) => (
  <FeatureCardWrapper>
    <div className="feature-card">
      <img src={iconPlaceholder} alt={title} />
      {/* <div className="feature-card-icon">{iconPlaceholder}</div> */}
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
      imagePlaceholder: reportSectionImage4,
      title: "Secure & Private Conversations",
    },
    {
      imagePlaceholder: reportSectionImage5,
      title: "Track Progress Effortlessly",
    },
    {
      imagePlaceholder: reportSectionImage1,
      title: "Seamless Counselor Collaboration",
    },
  ];

  const featureCardsData = [
    {
      iconPlaceholder: "/assets/images/simple.svg",
      title: "Simple",
      description:
        "Simple, intuitive design helps you schedule sessions and manage reports within minutes.",
    },
    {
      iconPlaceholder: "/assets/images/secure.svg",
      title: "Secure",
      description:
        "Your data stays safe with enterprise-grade security, encryption, and strict privacy controls.",
    },
    {
      iconPlaceholder: "/assets/images/pay.svg",
      title: "Pay-as-You-Go",
      description:
        "Pay only when you use it — no contracts, no subscriptions, just transparent and flexible pricing always.",
    },
  ];

  const logos = [
    { src: "/assets/images/hippa.svg", alt: "HIPAA logo" },
    { src: "/assets/images/soc_uodated.svg", alt: "SOC logo" },
    { src: "/assets/images/pipeda.svg", alt: "PIPEDA logo" },
    { src: "/assets/images/eu.svg", alt: "EU logo" },
  ];

  const router = useRouter();
  const swiperRef = useRef(null);
  return (
    <FeatureAndReportSectionWrapper>
      {/* Why MindBridge? Section */}
      <div className="main-section-centered-text">
        <Image
          src={reportSectionPattern?.src}
          height={400}
          width={1200}
          className="wrapperImage"
          alt="Report section pattern"
        />
        <div className="section-centered-text manual-width manual-width-1">
          <h2 className="section-heading section-heading-1">
            Simplify Your Counseling Practice — Secure, Simple, and Scalable
          </h2>
          <p className="section-description">
            MindBridge is purpose-built to help mental health professionals
            operate with the highest standards of security, compliance, and
            ease. From secure documentation to streamlined workflows, we
            simplify your process so you can focus on care.
          </p>
          <div className="logo-container">
            {logos.map((logo) => (
              <div key={logo.alt}>
                <img
                  src={logo.src}
                  alt={logo.alt}
                  style={{
                    objectFit: "cover",
                    ...(logo.alt === "SOC logo" && {}),
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features You Can Count On Section */}
      <div className="section-centered-text-card">
        <div className="manual-width">
          <h2 className="section-heading">Features You Can Count On</h2>
          <p className="section-description">
            For counselors, clinics, and care teams seeking a smarter way to
            manage therapy sessions.
          </p>
          <div className="feature-button">
            <ButtonRow marginBottom="40px" />
          </div>
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
        From Session To Report — Seamlessly
      </h2>

      <div className="swiper-container">
        <SwiperContentStyles>
          <CustomSwiper
            swiperRef={swiperRef}
            customPrevAppearance={<ArrowIcon />}
            customNextAppearance={<ArrowLeft />}
            spaceBetween={30}
            slidesPerView={2.5}
            breakpoints={{
              200: {
                slidesPerView: 1.1,
                spaceBetween: 10,
              },
              420: {
                slidesPerView: 1.1,
                spaceBetween: 10,
              },
              640: {
                slidesPerView: 1.7,
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
