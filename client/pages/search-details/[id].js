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
  const [counselorDetails, setCounselorDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedCounselors, setRelatedCounselors] = useState([]);

  const router = useRouter();
  const { id } = router.query;

  const getCounselorDetails = async () => {
    try {
      if (id) {
        const response = await CommonServices.getCounselorProfile(id);
        if (response.status === 200) {
          setCounselorDetails(response.data.rec[0]);
          setRelatedCounselors(response.data.related_counselors);
        }
      }
    } catch (error) {
      console.log('Error while fetching counselor details:', error);
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

  if (!counselorDetails) {
    return <div>Counselor not found</div>;
  }

  const formatAvailability = (availability) => {
    return Object.entries(availability)
      .filter(([_, times]) => times.length > 0)
      .map(([day, times]) => ({
        day: day.charAt(0).toUpperCase() + day.slice(1),
        times: times.join(", ")
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

  const services = counselorDetails.services_offered.map(service => ({
    name: service,
    category: "Therapy",
    type: "Consultation",
    code: "$24",
    price: "$129.90",
  }));

  return (
    <>
      <HeaderWrapperBackground>
        <ProfileImage>
          <CameraIcon>📷</CameraIcon>
          <img src={counselorDetails.profile_picture_url || "/assets/images/drImage2.png"} alt={counselorDetails.user_first_name} />
        </ProfileImage>
      </HeaderWrapperBackground>
      <SearchDetailsWrapper>
        <ProfileHeader>
          <ProfileInfo>
            <DoctorInfo>
              <div>
                <NameBadges>
                  <h1>{`${counselorDetails.user_first_name} ${counselorDetails.user_last_name}`}</h1>
                  <Badges>
                    {counselorDetails.is_verified && <VerifiedBadge type="verified" />}
                  </Badges>
                </NameBadges>
                <Address>{counselorDetails.location}</Address>
              </div>
              <Rating>
                {"★".repeat(Math.floor(counselorDetails.average_rating || 0))}
                {"☆".repeat(5 - Math.floor(counselorDetails.average_rating || 0))}
                <span>{counselorDetails.review_count || 0} Reviews</span>
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
          {/* <TabButton
            className={selectedTab === "Special Features" ? "active" : ""}
            onClick={() => setSelectedTab("Special Features")}
          >
            Special Features
          </TabButton>
          <TabButton
            className={selectedTab === "Notes" ? "active" : ""}
            onClick={() => setSelectedTab("Notes")}
          >
            Notes
          </TabButton>
          <TabButton
            className={selectedTab === "Client Reviews" ? "active" : ""}
            onClick={() => setSelectedTab("Client Reviews")}
          >
            Client Reviews
          </TabButton> */}
        </NavigationTabs>

        <MainContent>
          <div>
            <Introduction>
              <h2>My Introduction</h2>
              <HugStats>{counselorDetails.patients_seen} Patients Seen</HugStats>
              <IntroText>{counselorDetails.profile_notes}</IntroText>

              <DoctorDetails>
                <DetailItem>
                  <span className="icon">
                    <img src="/assets/icons/gynecology.svg" />
                  </span>
                  <div>
                    <h3>Specialties</h3>
                    <p>{counselorDetails.specialties.join(", ")}</p>
                  </div>
                </DetailItem>
                <DetailItem>
                  <span className="icon">
                    <img src="/assets/icons/fontisto_person.svg" />
                  </span>
                  <div>
                    <h3>Service Modalities</h3>
                    <p>{counselorDetails.service_modalities.join(", ")}</p>
                  </div>
                </DetailItem>
                <DetailItem>
                  <span className="icon">
                    <img src="/assets/icons/date-today.svg" />
                  </span>
                  <div>
                    <h3>Availability</h3>
                    <p>{formatAvailability(counselorDetails.availability).map(slot => `${slot.day}: ${slot.times}`).join(" | ")}</p>
                  </div>
                </DetailItem>
                <DetailItem>
                  <span className="icon">
                    <img src="/assets/icons/lineicons_eye.svg" />
                  </span>
                  <div>
                    <h3>Seen by Patient</h3>
                    <p>{counselorDetails.patients_seen} Views</p>
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
                  <p>📍 {counselorDetails.location}</p>
                  <p>📞 {counselorDetails.public_phone}</p>
                  <p>📧 {counselorDetails.email}</p>
                </ContactInfo>
                <Availability>
                  <h3>Availability Hours</h3>
                  <p>{formatAvailability(counselorDetails.availability).map(slot => `${slot.day}: ${slot.times}`).join(" | ")}</p>
                </Availability>
                <ActionButton className="book-appointment">
                  Book Appointment
                </ActionButton>
                {/* <ActionButton className="call-now">Call Us Now</ActionButton> */}
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

        {relatedCounselors?.length > 0 && (
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
                {relatedCounselors.map((counselor, index) => (
                  <SwiperSlide key={index}>
                    <CounselorCard
                      image={counselor.profile_picture_url || "/assets/images/drImage2.png"}
                      key={counselor.counselor_profile_id}
                      {...counselor}
                      onBookAppointment={() => router.push(`/search-details/${counselor.counselor_profile_id}`)}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </SliderContainer>
          </SliderSection>
        )}
      </SearchDetailsWrapper>
    </>
  );
};

export default SearchDetails;
