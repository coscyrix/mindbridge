import React, { useRef } from "react";
import { Swiper } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";

// Import Swiper styles
import "swiper/css";
// import './style.js'; // Import the style file

const CustomSwiper = ({
  customPrevAppearance,
  customNextAppearance,
  children,
  ...props
}) => {
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  return (
    <div className="custom-swiper-container">
      <div className="custom-swiper-buttons-container">
        <button ref={prevRef} className="custom-swiper-prev-button">
          {customPrevAppearance || "Prev"}
        </button>
        <button ref={nextRef} className="custom-swiper-next-button">
          {customNextAppearance || "Next"}
        </button>
      </div>

      <Swiper
        {...props}
        modules={[Navigation]}
        navigation={{
          prevEl: prevRef.current,
          nextEl: nextRef.current,
        }}
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
