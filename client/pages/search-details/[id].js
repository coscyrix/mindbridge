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
  AppointmentForm,
  FormField,
  FormFieldRow,
  FormLabel,
  FormInput,
  FormSelect,
  FormTextarea,
  FormError,
  FormFooter,
  FormButtonCancel,
  FormButtonSubmit,
  PhoneInputWrapper,
} from "../../styles/search-details";
import CounselorCard from "../../components/SearchListingComponents/CounselorCard";
import { useRouter } from "next/router";
import CommonServices from "../../services/CommonServices";
import CustomModal from "../../components/CustomModal";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { api } from "../../utils/auth";
import { toast } from "react-toastify";
import axios from "axios";
import CustomLoader from "../../components/Loader/CustomLoader";
import CustomButton from "../../components/CustomButton";
import { bookAppointmentSchema } from "../../utils/validationSchema/validationSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { TREATMENT_TARGET, IMAGE_BASE_URL } from "../../utils/constants";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
const SearchDetails = () => {
  const imageBaseUrl = IMAGE_BASE_URL;

  const [selectedTab, setSelectedTab] = useState("Overview");
  const [selectedDate, setSelectedDate] = useState(null);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const methods = useForm({
    resolver: zodResolver(bookAppointmentSchema),
    mode: "onTouched",
    defaultValues: {
      client_first_name: "",
      client_last_name: "",
      client_email: "",
      contact_number: "",
      service: "",
      appointment_date: null,
      description: "",
    },
  });

  useEffect(() => {
    if (selectedDate) {
      methods.reset({
        ...methods.getValues(),
        appointment_date: selectedDate,
      });
    }
  }, [selectedDate]);

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
    setSelectedDate(null);
  };

  const onSubmit = async (values) => {
    try {
      console.log("Form submitted with values:", values);
      setIsSendingAppointment(true);
      const payload = {
        counselor_profile_id: id,
        client_name: `${values?.client_first_name} ${values?.client_last_name}`,
        client_email: values?.client_email,
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
      toast.error(
        error.response?.data?.message ||
          "An error occurred while sending the appointment request"
      );
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
                <Address>
                  {(() => {
                    const parts = counselor.location
                      ?.split(",")
                      .map((p) => p.trim());
                    return parts?.length >= 2
                      ? `${parts[parts.length - 2]}, ${parts[parts.length - 1]}`
                      : counselor.location;
                  })()}
                </Address>
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
                    <img src="/assets/images/specialist.png" alt="Specialties" className="detail-icon" />
                  </span>
                  <div>
                    <h3>Specialties</h3>

                    {counselor?.target_outcomes?.map((item, index) => (
                      <p key={index}>
                        {item.target_name}
                        {index < counselor.target_outcomes.length - 1 && ", "}
                      </p>
                    ))}

                    {/* <p>{specialties.join(", ")}</p> */}
                  </div>
                </DetailItem>
                <DetailItem>
                  <span className="icon">
                    <img src={counselor.service_modalities == 'online' ? '/assets/images/online.png' : '/assets/images/offline.png'} alt="Service Modalities" className="detail-icon" />
                  </span>
                  <div>
                    <h3>Service Modalities</h3>
                    <p>{(counselor.service_modalities || []).join(", ")}</p>
                  </div>
                </DetailItem>
                <DetailItem>
                  <span className="icon">
                    <img src="/assets/images/availability.png" alt="Availability" className="detail-icon" />
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
                    <img src="/assets/images/crowd.png" alt="Seen by Patient" className="detail-icon" />
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
          <AppointmentForm onSubmit={methods.handleSubmit(onSubmit)}>
            <FormFieldRow>
              <FormField>
                <FormLabel htmlFor="client_first_name">
                  First Name
                </FormLabel>
                <FormInput
                  id="client_first_name"
                  {...methods.register("client_first_name")}
                  type="text"
                  placeholder="Enter your first name"
                />
                {methods.formState.errors.client_first_name && (
                  <FormError>
                    {methods.formState.errors.client_first_name.message}
                  </FormError>
                )}
              </FormField>

              <FormField>
                <FormLabel htmlFor="client_last_name">
                  Last Name
                </FormLabel>
                <FormInput
                  id="client_last_name"
                  {...methods.register("client_last_name")}
                type="text"
                  placeholder="Enter your last name"
              />
                {methods.formState.errors.client_last_name && (
                  <FormError>
                    {methods.formState.errors.client_last_name.message}
                  </FormError>
              )}
              </FormField>
            </FormFieldRow>

            <FormField>
              <FormLabel htmlFor="client_email">
                Client Email
              </FormLabel>
              <FormInput
                id="client_email"
                {...methods.register("client_email")}
                type="email"
                placeholder="Enter your email"
              />
              {methods.formState.errors.client_email && (
                <FormError>
                  {methods.formState.errors.client_email.message}
                </FormError>
              )}
            </FormField>

            <FormField>
              <FormLabel htmlFor="contact_number">
                Client Contact No.
              </FormLabel>
              <Controller
                name="contact_number"
                control={methods.control}
                render={({ field, fieldState }) => (
                  <PhoneInputWrapper className="phone-input-wrapper">
                    <PhoneInput
                      international
                      defaultCountry="US"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      className={fieldState.error ? "phone-input-error" : ""}
              />
                    {fieldState.error && (
                      <FormError>
                        {fieldState.error.message}
                      </FormError>
              )}
                  </PhoneInputWrapper>
                )}
              />
            </FormField>

            <FormField>
              <FormLabel htmlFor="service">
                Select Service
              </FormLabel>
              <FormSelect
                id="service"
                {...methods.register("service")}
              >
                <option value="">Select a service</option>
                {TREATMENT_TARGET?.map((opt, idx) => (
                  <option key={idx} value={opt.label}>
                    {opt.label}
                  </option>
                ))}
              </FormSelect>
              {methods.formState.errors.service && (
                <FormError>
                  {methods.formState.errors.service.message}
                </FormError>
              )}
            </FormField>

            <FormField>
              <FormLabel htmlFor="appointment_date">
                Appointment Date
              </FormLabel>
              <FormInput
                id="appointment_date"
                type="date"
                min={new Date().toISOString().split("T")[0]}
                {...methods.register("appointment_date")}
              />
              {methods.formState.errors.appointment_date && (
                <FormError>
                  {methods.formState.errors.appointment_date.message}
                </FormError>
              )}
            </FormField>
            <FormField>
              <FormLabel htmlFor="description">
                Description
              </FormLabel>
              <FormTextarea
                id="description"
                rows={4}
                {...methods.register("description")}
              />
              {methods.formState.errors.description && (
                <FormError>
                  {methods.formState.errors.description.message}
                </FormError>
              )}
            </FormField>

            <FormFooter>
              <FormButtonCancel
                type="button"
                onClick={handleBookAppointmentClose}
              >
                Cancel
              </FormButtonCancel>
              <FormButtonSubmit
                type="submit"
                disabled={isSendingAppointment}
              >
                {isSendingAppointment ? "Sending..." : "Send"}
              </FormButtonSubmit>
            </FormFooter>
          </AppointmentForm>
        </FormProvider>
      </CustomModal>
    </>
  );
};

export default SearchDetails;
