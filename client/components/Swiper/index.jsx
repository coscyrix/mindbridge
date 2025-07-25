import { Navigation } from "swiper/modules";
import "swiper/css";
import React, { useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";

const CustomSwiper = ({
  customPrevAppearance,
  customNextAppearance,
  swiperRef,
  isBottomSwiper,
  children,
  ...props
}) => {
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  return (
    <div className="custom-swiper-container">
      <div className="custom-swiper-buttons-container">
        <button
          ref={prevRef}
          className={`custom-swiper-button custom-swiper-next-button`}
        >
          {isBottomSwiper
            ? customPrevAppearance || "Prev"
            : customNextAppearance || "Next"}
        </button>
        <button
          ref={nextRef}
          className={`custom-swiper-button custom-swiper-prev-button`}
        >
          {isBottomSwiper
            ? customNextAppearance || "Next"
            : customPrevAppearance || "Prev"}
        </button>
      </div>

      <Swiper
        {...props}
        modules={[Navigation]}
        navigation={{
          prevEl: prevRef.current,
          nextEl: nextRef.current,
        }}
        onBeforeInit={(swiper) => {
          if (typeof swiper.params.navigation !== "boolean") {
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
          }
        }}
      >
        {children}
      </Swiper>
    </div>
  );
};

export default CustomSwiper;
