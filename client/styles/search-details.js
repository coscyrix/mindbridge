import styled from "styled-components";

export const SearchDetailsWrapper = styled.div`
  max-width: 1440px;
  margin: 0 auto;
  padding: 20px 0px;
`;

export const ProfileHeader = styled.div`
`;

export const ProfileInfo = styled.div`
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
`;

export const HeaderWrapperBackground = styled.div`
  position: relative;
  background-color: #3973b7;
  height: 160px;
  margin-bottom: 40px;
`;

export const ProfileImage = styled.div`
  position: absolute;
  width: 120px;
  height: 120px;
  bottom: -60px;
  left: 160px;
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }
`;

export const CameraIcon = styled.button`
  position: absolute;
  bottom: 0;
  right: 0;
  background: white;
  border: none;
  border-radius: 50%;
  padding: 8px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const DoctorInfo = styled.div`
  padding-top: 20px;
  display: flex;
  justify-content: space-between;
`;

export const NameBadges = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: center;
  }

  h1 {
    margin: 0;
    padding-bottom: 2px;
    font-size: 24px;
    text-transform: capitalize;
  }
`;

export const Badges = styled.div`
  display: flex;
  gap: 8px;

  @media (max-width: 480px) {
    margin-top: 8px;
  }
`;

export const Address = styled.p`
  color: #666;
  margin: 4px 0;
`;

export const Rating = styled.div`
  color: #ffd700;
  margin-top: 8px;

  span {
    color: #666;
    margin-left: 8px;
  }
`;

export const UploadCover = styled.button`
  padding: 4px 14px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  position: absolute;
  bottom: 10px;
  right: 130px;
  transition: all 0.2s ease;

  &:hover {
    background: #f8f9fa;
  }
`;

export const NavigationTabs = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  @media (max-width: 768px) {
    overflow-x: auto;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;
  }
`;

export const TabButton = styled.button`
  padding: 12px 24px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 16px;
  color: #666;
  position: relative;

  &.active {
    color: #1a73e8;
    font-weight: 500;

    &:after {
      content: "";
      position: absolute;
      bottom: -1px;
      left: 0;
      right: 0;
      height: 3px;
      border-radius: 3px;
      background: #1a73e8;
    }
  }

  &:hover {
    color: #1a73e8;
  }
`;

export const MainContent = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-bottom: 20px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

export const Introduction = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  h2 {
    margin: 0 0 16px 0;
    color: #333;
  }
`;

export const HugStats = styled.div`
  background: #f0f4f8;
  padding: 8px 16px;
  border-radius: 4px;
  display: inline-block;
  margin: 10px 0;
  color: #1a73e8;
  font-weight: 500;
`;

export const IntroText = styled.p`
  color: #666;
  line-height: 1.6;
`;

export const DoctorDetails = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const DetailItem = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }

  .icon {
    background: #f8f9fa;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50px;
    height: 50px;
    width: 50px;
  }

  h3 {
    margin: 0 0 4px 0;
    font-size: 16px;
    color: #333;
  }

  p {
    margin: 0;
    color: #666;
  }
`;

export const AppointmentSection = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  h2 {
    margin: 0 0 16px 0;
    color: #333;
  }
`;

export const ContactDetails = styled.div`
  h2 {
    margin: 0 0 16px 0;
    color: #333;
  }
`;

export const ContactInfo = styled.div`
  margin-bottom: 20px;

  p {
    margin: 8px 0;
    color: #666;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

export const Availability = styled.div`
  margin-bottom: 20px;

  h3 {
    margin: 0 0 8px 0;
    font-size: 16px;
    color: #333;
  }

  p {
    color: #666;
  }
`;

export const ActionButton = styled.button`
  width: 100%;
  padding: 12px;
  margin-top: 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;

  &.book-appointment {
    background: #1a73e8;
    color: white;

    &:hover {
      background: #1557b0;
    }
  }

  &.call-now {
    background: #34a853;
    color: white;

    &:hover {
      background: #2d8745;
    }
  }
`;

export const ServicesSection = styled.div`

  h2 {
    margin: 0 0 20px 0;
    color: #333;
  }
`;

export const ServicesGrid = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const SliderSection = styled.div`
  margin-top: 40px;
  .swiper {
    padding: 20px 40px;
  }

  .swiper-button-next,
  .swiper-button-prev {
    color: #1a73e8;
    background: white;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    &:after {
      font-size: 16px;
    }

    &.swiper-button-disabled {
      opacity: 0.5;
    }
  }
`;

export const SliderTitle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h2 {
    margin: 0;
    font-size: 24px;
    color: #333;
  }

  a {
    color: #1a73e8;
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
`;

export const SliderContainer = styled.div`
  position: relative;

  .swiper-slide {
    height: auto;
  }
`;
