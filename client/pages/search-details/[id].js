import React, { useEffect, useState } from "react";
import VerifiedBadge from "../../components/SearchDetailsComponents/VerifiedBadge";
import ServiceCard from "../../components/SearchDetailsComponents/ServiceCard";
import DateSelector from "../../components/SearchDetailsComponents/DateSelector";
import { Tooltip } from "react-tooltip";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { GoArrowLeft } from "react-icons/go";
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
import CustomModal from "../../components/CustomModal";
import { useForm, FormProvider } from "react-hook-form";
import { api } from "../../utils/auth";
import { toast } from "react-toastify";
import axios from "axios";
import CustomLoader from "../../components/Loader/CustomLoader";
import CustomButton from "../../components/CustomButton";
import { bookAppointmentSchema } from "../../utils/validationSchema/validationSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { TREATMENT_TARGET } from "../../utils/constants";
const SearchDetails = () => {
  const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGES_BASE_URL;

  const [selectedTab, setSelectedTab] = useState("Overview");
  const [selectedDate, setSelectedDate] = useState(null);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const methods = useForm({
    resolver: zodResolver(bookAppointmentSchema),
    mode: "onTouched",
    defaultValues: {
      customer_name: "",
      customer_email: "",
      contact_number: "",
      service: "",
      appointment_date: null,
      description: "",
    },
  });

  const [selectedService, setSelectedService] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [isSendingAppointment, setIsSendingAppointment] = useState(false);

  const router = useRouter();
  const { id } = router.query;
  const [counselorDetails, setCounselorDetails] = useState(null);
  const [relatedCounselors, setRelatedCounselors] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profilePicture, setProfilePicture] = useState("");

  const getCounselorDetails = async () => {
    try {
      if (id) {
        const response = await CommonServices.getCounselorProfile(id);
        if (response.status === 200 && response.data && response.data.rec) {
          setCounselorDetails(response.data.rec);
          setRelatedCounselors(response.data.related_counselors);
        } else {
          setCounselorDetails(null);
        }
      }
    } catch (error) {
      console.log("Error while fetching counselor details:", error);
      setCounselorDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const counselor = counselorDetails?.at(0);

  const fetchProfilePicture = async () => {
    try {
      const response = await axios.get(
        `${imageBaseUrl}${counselor?.profile_picture_url}`,
        {
          responseType: "blob",
        }
      );

      const blob = response.data;

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result;
        setProfilePicture(base64data);
      };

      reader.readAsDataURL(blob);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (router.isReady) {
      getCounselorDetails();
    }
  }, [router.isReady, id]);

  useEffect(() => {
    if (id && counselor) {
      fetchProfilePicture();
    }
  }, [id, counselor]);

  if (loading) {
    return (
      <CustomLoader style={{ top: "40vh", left: "60vw", height: "50vh" }} />
    );
  }

  if (!counselorDetails || counselorDetails.length === 0) {
    return <div>Counselor not found</div>;
  }

  const formatAvailability = (availability) => {
    return Object.entries(availability)
      .filter(([_, times]) => times.length > 0)
      .map(([day, times]) => ({
        day: day.charAt(0).toUpperCase() + day.slice(1),
        times: times.join(", "),
      }));
  };

  const baseDate = new Date("2025-06-30");
  const dates = Array.from({ length: 7 }).map((_, i) => {
    const currentDate = new Date(baseDate);
    currentDate.setDate(baseDate.getDate() + i);

    return {
      day: currentDate.toLocaleDateString("en-US", { weekday: "short" }),
      date: currentDate.toISOString().split("T")[0],
    };
  });

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const services = (counselor.services_offered || []).map((service) => ({
    name: service.service_name || service,
    category: service.is_specialty ? "Specialty" : "Therapy",
    type: service.is_report ? "Report" : "Consultation",
    code: service.service_code ? service.service_code : "",
    price: service.total_invoice ? `$${service.total_invoice}` : "",
  }));

  const specialties = (counselor.specialties || []).map(
    (specialty) => specialty.service_name || specialty
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

  const serviceOptions = counselor?.services_offered?.map((service) => ({
    option: service.service_name,
  }));

  const handleBookAppointmentOpen = () => setIsBookModalOpen(true);
  const handleBookAppointmentClose = () => {
    setIsBookModalOpen(false);
    methods.reset();
    setSelectedService("");
    setAppointmentDate("");
  };

  const onSubmit = async (values) => {
    try {
      console.log("Form submitted with values:", values);
      setIsSendingAppointment(true);
      const payload = {
        counselor_profile_id: id,
        customer_name: values?.customer_name,
        customer_email: values?.customer_email,
        service: values.service,
        appointment_date: values.appointment_date,
        contact_number: values.contact_number,
        description: values.description,
      };
      console.log("Sending payload:", payload);
      const { data, status } = await api.post(
        "counselor-profile/send-appointment-email",
        payload
      );
      console.log("API response:", { data, status });
      if (data && status) {
        toast.success(data?.message);
        handleBookAppointmentClose();
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error(error.response?.data?.message || "An error occurred while sending the appointment request");
    } finally {
      setIsSendingAppointment(false);
    }
  };

  return (
    <>
      <HeaderWrapperBackground>
        <ProfileImage>
          <CameraIcon>📷</CameraIcon>
          <img
            src={
              profilePicture ? profilePicture : "/assets/images/drImage2.png"
            }
            alt={counselor.user_first_name}
          />
        </ProfileImage>
        {/* <UploadCover>📷 Upload a cover image</UploadCover> */}
      </HeaderWrapperBackground>
      <SearchDetailsWrapper>
        <ProfileHeader>
          <GoArrowLeft
            onClick={() => {
              router.back();
            }}
            size={50}
          />
          <ProfileInfo>
            <DoctorInfo>
              <div>
                <NameBadges>
                  <h1>{`${counselor.user_first_name} ${counselor.user_last_name}`}</h1>
                  {/* <Badges>
                    {counselor.is_verified && <VerifiedBadge type="verified" />}
                  </Badges> */}
                </NameBadges>
                <Address>{counselor.location}</Address>
              </div>
              {/* <Rating>
                {"★".repeat(Math.floor(counselor.average_rating))}
                {"☆".repeat(5 - Math.floor(counselor.average_rating))}
                <span>{counselor.review_count || 0} Reviews</span>
              </Rating> */}
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
                    {TREATMENT_TARGET.map((specialties, index) => (
                      <p key={specialties.label}> {specialties.label}</p>
                    ))}
                    {/* <p>{specialties.join(", ")}</p> */}
                  </div>
                </DetailItem>
                <DetailItem>
                  <span className="icon">
                    <img src="/assets/icons/fontisto_person.svg" />
                  </span>s
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
              <div>
                <h2>
                  Select Time Slot
                  <span
                    className="tooltip-icon"
                    data-tooltip-id="info-tooltip"
                    data-tooltip-content="If the counselor is available, you can select a date to book your appointment."
                  >
                    i
                  </span>
                </h2>

                <Tooltip id="info-tooltip" place="top" />
              </div>

              <DateSelector
                dates={dates}
                availability={counselor.availability}
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
                <ActionButton
                  className="book-appointment"
                  onClick={handleBookAppointmentOpen}
                >
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

        <SliderSection>
          <SliderTitle>
            <h2>Other Counsellors</h2>
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
              {relatedCounselors?.map((counselor, index) => (
                <SwiperSlide key={index}>
                  <CounselorCard
                    counselorId={counselor?.counselor_profile_id}
                    image="/assets/images/drImage2.png"
                    key={counselor.id}
                    {...counselor}
                    onBookAppointment={() =>
                      handleBookAppointmentOpen(counselor.id)
                    }
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </SliderContainer>
        </SliderSection>
      </SearchDetailsWrapper>
      <CustomModal
        isOpen={isBookModalOpen}
        onRequestClose={handleBookAppointmentClose}
        title="Book Appointment"
      >
        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(onSubmit)}
            style={{ padding: "0 20px", minWidth: 320 }}
          >
            <div style={{ marginBottom: 18 }}>
              <label
                htmlFor="customer_name"
                style={{ display: "block", fontWeight: 500, marginBottom: 6 }}
              >
                Customer Name
              </label>
              <input
                id="customer_name"
                {...methods.register("customer_name")}
                type="text"
                placeholder="Enter your name"
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: 6,
                  border: "1px solid #e7e7e9",
                  fontSize: 15,
                }}
              />
              {methods.formState.errors.customer_name && (
                <p
                  style={{
                    color: "#f04438",
                    margin: "6px 0 0 2px",
                    fontSize: 13,
                  }}
                >
                  {methods.formState.errors.customer_name.message}
                </p>
              )}
            </div>

            <div style={{ marginBottom: 18 }}>
              <label
                htmlFor="customer_email"
                style={{ display: "block", fontWeight: 500, marginBottom: 6 }}
              >
                Customer Email
              </label>
              <input
                id="customer_email"
                {...methods.register("customer_email")}
                type="email"
                placeholder="Enter your email"
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: 6,
                  border: "1px solid #e7e7e9",
                  fontSize: 15,
                }}
              />
              {methods.formState.errors.customer_email && (
                <p
                  style={{
                    color: "#f04438",
                    margin: "6px 0 0 2px",
                    fontSize: 13,
                  }}
                >
                  {methods.formState.errors.customer_email.message}
                </p>
              )}
            </div>

            <div style={{ marginBottom: 18 }}>
              <label
                htmlFor="contact_number"
                style={{ display: "block", fontWeight: 500, marginBottom: 6 }}
              >
                Customer Contact No.
              </label>
              <input
                id="contact_number"
                {...methods.register("contact_number")}
                type="text"
                placeholder="Enter your number"
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: 6,
                  border: "1px solid #e7e7e9",
                  fontSize: 15,
                }}
              />
              {methods.formState.errors.contact_number && (
                <p
                  style={{
                    color: "#f04438",
                    margin: "6px 0 0 2px",
                    fontSize: 13,
                  }}
                >
                  {methods.formState.errors.contact_number.message}
                </p>
              )}
            </div>

            <div style={{ marginBottom: 18 }}>
              <label
                htmlFor="service"
                style={{ display: "block", fontWeight: 500, marginBottom: 6 }}
              >
                Select Service
              </label>
              <select
                id="service"
                {...methods.register("service")}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: 6,
                  border: "1px solid #e7e7e9",
                  fontSize: 15,
                }}
              >
                <option value="">Select a service</option>
                {TREATMENT_TARGET?.map((opt, idx) => (
                  <option key={idx} value={opt.label}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {methods.formState.errors.service && (
                <p
                  style={{
                    color: "#f04438",
                    margin: "6px 0 0 2px",
                    fontSize: 13,
                  }}
                >
                  {methods.formState.errors.service.message}
                </p>
              )}
            </div>

            <div style={{ marginBottom: 18 }}>
              <label
                htmlFor="appointment_date"
                style={{ display: "block", fontWeight: 500, marginBottom: 6 }}
              >
                Appointment Date
              </label>
              <input
                id="appointment_date"
                type="date"
                min={new Date().toISOString().split("T")[0]}
                {...methods.register("appointment_date")}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: 6,
                  border: "1px solid #e7e7e9",
                  fontSize: 15,
                }}
              />
              {methods.formState.errors.appointment_date && (
                <p
                  style={{
                    color: "#f04438",
                    margin: "6px 0 0 2px",
                    fontSize: 13,
                  }}
                >
                  {methods.formState.errors.appointment_date.message}
                </p>
              )}
            </div>
            <div style={{ marginBottom: 18 }}>
              <label
                htmlFor="description"
                style={{ display: "block", fontWeight: 500, marginBottom: 6 }}
              >
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                {...methods.register("description")}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: 6,
                  border: "1px solid #e7e7e9",
                  fontSize: 15,
                }}
              />
              {methods.formState.errors.description && (
                <p
                  style={{
                    color: "#f04438",
                    margin: "6px 0 0 2px",
                    fontSize: 13,
                  }}
                >
                  {methods.formState.errors.description.message}
                </p>
              )}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 24,
              }}
            >
              <button
                type="button"
                onClick={handleBookAppointmentClose}
                style={{
                  padding: "10px 24px",
                  borderRadius: 6,
                  border: "1px solid #e1e1e1",
                  background: "#fff",
                  cursor: "pointer",
                  minWidth: 107,
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSendingAppointment}
                style={{
                  padding: "10px 24px",
                  borderRadius: 6,
                  border: "none",
                  background: "var(--primary-button-color)",
                  color: "#fff",
                  cursor: "pointer",
                  minWidth: 107,
                }}
              >
                {isSendingAppointment ? "Sending..." : "Send"}
              </button>
            </div>
          </form>
        </FormProvider>
      </CustomModal>
    </>
  );
};

export default SearchDetails;
