import React, { ReactNode } from "react";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";

import "./style.css";

// import required modules
import { Navigation } from "swiper/modules";

const ManipulateSlider = ({ itemList }: { itemList: ReactNode[] }) => {
  return (
    <>
      <Swiper
        slidesPerView={3.5}
        spaceBetween={30}
        // navigation={true}
        navigation={{
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        }}
        modules={[Navigation]}
        centeredSlides={true}
        loop={true}
        className="mySwiper"
        // Responsive breakpoints
        breakpoints= {{
          // when window width is >= 360px
          360: {
            slidesPerView: 1
          },
          // when window width is >= 576px
          640: {
            slidesPerView: 1.3,
            spaceBetween: 10
          },
          // when window width is >= 768px
          768: {
            slidesPerView: 2,
            spaceBetween: 40
          },
          // when window width is >= 1025px
          1025: {
            slidesPerView: 2.8
          },
          // when window width is >= 1280px
          1280: {
            slidesPerView: 3.5
          }
        }}
      >
        {itemList.map((item, index) => (
          <SwiperSlide key={index}>{item}</SwiperSlide>
        ))}
      </Swiper>
    </>
  );
};
export default ManipulateSlider;
