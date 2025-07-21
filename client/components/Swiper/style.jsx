import styled from "styled-components";

// Add Swiper specific styles here
export const SwiperContentStyles = styled.div`
  .swiper-section-heading {
    font-size: 2.5em;
    margin-bottom: 30px;
    font-family: "Georgia, serif";
  }

  /* Remove specific swiper-card styles from here */
  /* .swiper-card { */
  /*   border: 1px solid #eee; */
  /*   padding: 20px; */
  /*   text-align: left; */
  /*   background-color: white; */
  /* } */

  .swiper-card-image-placeholder {
    width: 100%;
    height: 360px;
    object-fit: cover;
    background-color: #ccc;
    margin-bottom: 15px;
    display: flex;
    justify-content: center;
    align-items: center;
    @media screen and (max-width: 425px) {
      height: 180px;
    }
    @media screen and (max-width: 780px) {
      height: 250px;
    }
  }

  .swiper-card-title {
    font-size: 1.2em;
  }
`;

// Base styles for swiper cards
export const SwiperCardBaseStyles = styled.div`
  border: 1px solid #eee;
  padding: 20px;
  text-align: left;
  background-color: white;
`;
