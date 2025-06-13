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
  // const { id } = router.query;
  // const [counselorDetails, setCounselorDetails] = useState(null);
  // const [loading, setLoading] = useState(true);

  const counselorDetails = [
    {
      counselor_profile_id: 7,
      user_profile_id: 6,
      profile_picture_url: "https://example.com/profile.jpg",
      license_number: "LIC123456",
      license_file_url: "https://example.com/license.pdf",
      profile_notes: "Experienced counselor specializing in anxiety and depression. Certified in CBT and DBT. Fluent in English and Spanish.",
      location: "New York, NY",
      services_offered: [
        "Individual Therapy",
        "Group Therapy",
        "Couples Counseling",
        "Family Therapy",
        "Teen Counseling",
        "Online Therapy"
      ],
      specialties: [
        "Anxiety",
        "Depression",
        "Trauma",
        "PTSD",
        "Relationship Issues",
        "Stress Management",
        "Grief Counseling"
      ],
      service_modalities: [
        "Online",
        "In Person",
        "Phone"
      ],
      availability: {
        "friday": [
          "09:00",
          "10:00",
          "11:00",
          "14:00",
          "15:00",
          "16:00"
        ],
        "monday": [
          "09:00",
          "10:00",
          "11:00",
          "14:00",
          "15:00",
          "16:00"
        ],
        "sunday": [],
        "tuesday": [
          "09:00",
          "10:00",
          "11:00",
          "14:00",
          "15:00",
          "16:00"
        ],
        "saturday": [
          "10:00",
          "11:00",
          "12:00"
        ],
        "thursday": [
          "09:00",
          "10:00",
          "11:00",
          "14:00",
          "15:00",
          "16:00"
        ],
        "wednesday": [
          "09:00",
          "10:00",
          "11:00",
          "14:00",
          "15:00",
          "16:00"
        ]
      },
      is_verified: 1,
      patients_seen: 150,
      gender: "female",
      race: "Asian",
      public_phone: "+1234567890",
      created_at: "2025-06-06 08:14:04",
      updated_at: "2025-06-06 08:14:04",
      user_first_name: "counselor",
      user_last_name: "test",
      email: "akhand@deliverable.services",
      average_rating: 4.8,
      review_count: 0
    }
  ];

  const categories = [
    "Gynaecologist",
    "Surgery",
    "General Practitioners",
    "Specialists",
    "Hospital",
  ];

  // const getCounselorDetails = async () => {
  //   try {
  //     if (id) {
  //       const response = await CommonServices.getCounselorProfile(id);
  //       if (response.status === 200) {
  //         setCounselorDetails(response.data);
  //       }
  //     }
  //   } catch (error) {
  //     console.log('Error while fetching counselor details:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   if (router.isReady) {
  //     getCounselorDetails();
  //   }
  // }, [router.isReady, id]);

  // if (loading) {
  //   return <div>Loading...</div>;
  // }

  if (!counselorDetails) {
    return <div>Counselor not found</div>;
  }

  const counselor = counselorDetails[0];

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

  const services = counselor.services_offered.map(service => ({
    name: service,
    category: "Therapy",
    type: "Consultation",
    code: "$24",
    price: "$129.90",
  }));

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
          <img src={"/assets/images/drImage2.png"||counselor.profile_picture_url} alt={counselor.user_first_name} />
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
          <TabButton
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
                    <p>{counselor.specialties.join(", ")}</p>
                  </div>
                </DetailItem>
                <DetailItem>
                  <span className="icon">
                    <img src="/assets/icons/fontisto_person.svg" />
                  </span>
                  <div>
                    <h3>Service Modalities</h3>
                    <p>{counselor.service_modalities.join(", ")}</p>
                  </div>
                </DetailItem>
                <DetailItem>
                  <span className="icon">
                    <img src="/assets/icons/date-today.svg" />
                  </span>
                  <div>
                    <h3>Availability</h3>
                    <p>{formatAvailability(counselor.availability).map(slot => `${slot.day}: ${slot.times}`).join(" | ")}</p>
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
                  <p>{formatAvailability(counselor.availability).map(slot => `${slot.day}: ${slot.times}`).join(" | ")}</p>
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
