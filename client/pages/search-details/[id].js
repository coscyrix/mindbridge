import React, { useEffect, useState } from "react";
import VerifiedBadge from "../../components/SearchDetailsComponents/VerifiedBadge";
import ServiceCard from "../../components/SearchDetailsComponents/ServiceCard";
import DateSelector from "../../components/SearchDetailsComponents/DateSelector";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import {
  SearchDetailsWrapper,
  ProfileHeader,
  ProfileInfo,
  ProfileImage,
  CameraIcon,
  DoctorInfo,
  NameBadges,
  Badges,
  Address,
  Rating,
  UploadCover,
  NavigationTabs,
  TabButton,
  MainContent,
  Introduction,
  HugStats,
  IntroText,
  DoctorDetails,
  DetailItem,
  AppointmentSection,
  ContactDetails,
  ContactInfo,
  Availability,
  ActionButton,
  ServicesSection,
  ServicesGrid,
  HeaderWrapperBackground,
  SliderSection,
  SliderTitle,
  SliderContainer,
} from "../../styles/search-details";
import CounselorCard from "../../components/SearchListingComponents/CounselorCard";
import { useRouter } from "next/router";
import CommonServices from "../../services/CommonServices";

const SearchDetails = () => {
  const [selectedTab, setSelectedTab] = useState("Overview");
  const [selectedDate, setSelectedDate] = useState(null);

  const router = useRouter();
  const { id } = router.query;
  const [counselorDetails, setCounselorDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const categories = [
    "Gynaecologist",
    "Surgery",
    "General Practitioners",
    "Specialists",
    "Hospital",
  ];

  const getCounselorDetails = async () => {
    try {
      if (id) {
        const response = await CommonServices.getCounselorProfile(id);
        if (response.status === 200 && response.data && response.data.rec) {
          setCounselorDetails(response.data.rec);
        } else {
          setCounselorDetails(null);
        }
      }
    } catch (error) {
      console.log('Error while fetching counselor details:', error);
      setCounselorDetails(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (router.isReady) {
      getCounselorDetails();
    }
  }, [router.isReady, id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!counselorDetails || counselorDetails.length === 0) {
    return <div>Counselor not found</div>;
  }

  const counselor = counselorDetails[0];

  const formatAvailability = (availability) => {
    return Object.entries(availability)
      .filter(([_, times]) => times.length > 0)
      .map(([day, times]) => ({
        day: day.charAt(0).toUpperCase() + day.slice(1),
        times: times.join(", "),
      }));
  };

  const dates = [
    { day: "Sun", date: "01" },
    { day: "Mon", date: "02" },
    { day: "Tue", date: "03" },
    { day: "Wed", date: "04" },
    { day: "Thu", date: "05" },
    { day: "Fri", date: "06" },
  ];

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const services = (counselor.services_offered || []).map((service) => ({
    name: service.service_name || service,
    category: service.is_specialty ? 'Specialty' : 'Therapy',
    type: service.is_report ? 'Report' : 'Consultation',
    code: service.service_code ? service.service_code : '',
    price: service.total_invoice ? `$${service.total_invoice}` : '',
  }));

  const specialties = (counselor.specialties || []).map((specialty) =>
    specialty.service_name || specialty
  );

  const counselors = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      speciality: "HCII, CIII, YUUI",
      location: "New York, NY",
      rating: 4.8,
      reviews: 156,
      availability: "9:00 AM - 5:00 PM",
      contact: "+1 (555) 123-4567",
      email: "sarah.johnson@example.com",
      services: "HCII, CIII, YUUI",
      available: "In-Person",
    },
    {
      id: 2,
      name: "Dr. Sarah Johnson",
      speciality: "HCII, CIII, YUUI",
      location: "New York, NY",
      rating: 4.8,
      reviews: 156,
      availability: "9:00 AM - 5:00 PM",
      contact: "+1 (555) 123-4567",
      email: "sarah.johnson@example.com",
      services: "HCII, CIII, YUUI",
      available: "In-Person",
    },
  ];

  return (
    <>
      <HeaderWrapperBackground>
        <ProfileImage>
          <CameraIcon>📷</CameraIcon>
          <img
            src={"/assets/images/drImage2.png" || counselor.profile_picture_url}
            alt={counselor.user_first_name}
          />
        </ProfileImage>
        <UploadCover>📷 Upload a cover image</UploadCover>
      </HeaderWrapperBackground>
      <SearchDetailsWrapper>
        <ProfileHeader>
          <ProfileInfo>
            <DoctorInfo>
              <div>
                <NameBadges>
                  <h1>{`${counselor.user_first_name} ${counselor.user_last_name}`}</h1>
                  <Badges>
                    {counselor.is_verified && <VerifiedBadge type="verified" />}
                  </Badges>
                </NameBadges>
                <Address>{counselor.location}</Address>
              </div>
              <Rating>
                {"★".repeat(Math.floor(counselor.average_rating))}
                {"☆".repeat(5 - Math.floor(counselor.average_rating))}
                <span>{counselor.review_count} Reviews</span>
              </Rating>
            </DoctorInfo>
          </ProfileInfo>
        </ProfileHeader>

        <NavigationTabs>
          <TabButton
            className={selectedTab === "Overview" ? "active" : ""}
            onClick={() => setSelectedTab("Overview")}
          >
            Overview
          </TabButton>
        </NavigationTabs>

        <MainContent>
          <div>
            <Introduction>
              <h2>My Introduction</h2>
              <HugStats>{counselor.patients_seen} Patients Seen</HugStats>
              <IntroText>{counselor.profile_notes}</IntroText>

              <DoctorDetails>
                <DetailItem>
                  <span className="icon">
                    <img src="/assets/icons/gynecology.svg" />
                  </span>
                  <div>
                    <h3>Specialties</h3>
                    <p>{specialties.join(", ")}</p>
                  </div>
                </DetailItem>
                <DetailItem>
                  <span className="icon">
                    <img src="/assets/icons/fontisto_person.svg" />
                  </span>
                  <div>
                    <h3>Service Modalities</h3>
                    <p>{(counselor.service_modalities || []).join(", ")}</p>
                  </div>
                </DetailItem>
                <DetailItem>
                  <span className="icon">
                    <img src="/assets/icons/date-today.svg" />
                  </span>
                  <div>
                    <h3>Availability</h3>
                    <p>
                      {formatAvailability(counselor.availability || {})
                        .map((slot) => `${slot.day}: ${slot.times}`)
                        .join(" | ")}
                    </p>
                  </div>
                </DetailItem>
                <DetailItem>
                  <span className="icon">
                    <img src="/assets/icons/lineicons_eye.svg" />
                  </span>
                  <div>
                    <h3>Seen by Patient</h3>
                    <p>{counselor.patients_seen} Views</p>
                  </div>
                </DetailItem>
              </DoctorDetails>
            </Introduction>
          </div>

          <div>
            <AppointmentSection>
              <h2>Select Time Slot</h2>
              <DateSelector
                dates={dates}
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
              />
              <ContactDetails>
                <h2>Contact Details</h2>
                <ContactInfo>
                  <p>📍 {counselor.location}</p>
                  <p>📞 {counselor.public_phone}</p>
                  <p>📧 {counselor.email}</p>
                </ContactInfo>
                <Availability>
                  <h3>Availability Hours</h3>
                  <p>
                    {formatAvailability(counselor.availability || {})
                      .map((slot) => `${slot.day}: ${slot.times}`)
                      .join(" | ")}
                  </p>
                </Availability>
                <ActionButton className="book-appointment">
                  Book Appointment
                </ActionButton>
                <ActionButton className="call-now">Call Us Now</ActionButton>
              </ContactDetails>
            </AppointmentSection>
          </div>
        </MainContent>

        <ServicesSection>
          <h2>Services</h2>
          <ServicesGrid>
            {services.map((service, index) => (
              <ServiceCard key={index} service={service} />
            ))}
          </ServicesGrid>
        </ServicesSection>

        <SliderSection>
          <SliderTitle>
            <h2>Other Counsellors</h2>
            <a href="#">View all</a>
          </SliderTitle>
          <SliderContainer>
            <Swiper
              modules={[Navigation]}
              spaceBetween={20}
              slidesPerView={1}
              navigation
              breakpoints={{
                768: {
                  slidesPerView: 2,
                },
                1200: {
                  slidesPerView: 1.5,
                },
              }}
            >
              {counselors.map((counselor, index) => (
                <SwiperSlide key={index}>
                  <CounselorCard
                    image="/assets/images/drImage2.png"
                    key={counselor.id}
                    {...counselor}
                    onBookAppointment={() =>
                      handleBookAppointment(counselor.id)
                    }
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </SliderContainer>
        </SliderSection>
      </SearchDetailsWrapper>
    </>
  );
};

export default SearchDetails;
