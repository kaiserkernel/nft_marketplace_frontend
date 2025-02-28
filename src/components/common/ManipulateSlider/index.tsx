import React, { ReactNode } from "react";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";

import "./style.css";

// import required modules
import { Navigation } from "swiper/modules";

const ManipulateSlider = ({ items }: { items: ReactNode[] }) => {
  return (
    <>
      <Swiper
        slidesPerView="auto"
        spaceBetween={30}
        navigation={true}
        modules={[Navigation]}
        className="mySwiper"
      >
        {items.map((item, index) => (
          <SwiperSlide key={index}>{item}</SwiperSlide>
        ))}
      </Swiper>
    </>
  );
};
export default ManipulateSlider;
