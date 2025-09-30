import React, { useCallback, useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import CustomInputField from "../components/CustomInputField";
import CustomButton from "../components/CustomButton";
import CustomMultiSelect from "../components/CustomMultiSelect";
import {
  useForm,
  FormProvider,
  Controller,
  useFormContext,
} from "react-hook-form";
import {
  FormContainer,
  RightPanel,
  Wrapper,
  LeftPanel,
  StepContent,
} from "../styles/onboarding";
import { toast } from "react-toastify";
import { api, logout, onBoarding, updateProfile } from "../utils/auth";
import styled from "styled-components";
import LicenseFileUpload from "../components/LicenseFileUpload";
import CommonServices from "../services/CommonServices";
import Cookies from "js-cookie";
import WeeklyAvailability from "../components/WeeklyAvailability";
import LocationSearch from "../components/LocationSearch";
import axios from "axios";
import { TREATMENT_TARGET } from "../utils/constants";
import Spinner from "../components/common/Spinner";
import ApiConfig from "../config/apiConfig";
import { FaRegFilePdf } from "react-icons/fa";
import { CiCircleRemove } from "react-icons/ci";

const StepIndicator = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 32px;
  position: relative;
  @media (max-width: 800px) {
    margin: 10px;
  }

  &::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 2px;
    background: #e0e0e0;
    z-index: 1;
  }

  .step {
    position: relative;
    z-index: 2;
    background: white;
    padding: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;

    .step-number {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      border: 2px solid #e0e0e0;
      background: white;
      color: #666;
      transition: all 0.3s ease;

      &.active {
        border-color: #2196f3;
        color: #2196f3;
      }

      &.completed {
        background: #2196f3;
        border-color: #2196f3;
        color: white;
      }
    }

    .step-label {
      font-size: 14px;
      color: #666;
      font-weight: 500;

      &.active {
        color: #2196f3;
      }
    }
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-evenly;
  // margin: 0px 64px;
  gap: 20px;
  button {
    min-width: 120px;
  }
`;

const ProfilePictureUpload = styled.div`
  margin-bottom: 24px;
  text-align: center;

  .profile-picture-container {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    margin: 0 auto 16px;
    position: relative;
    overflow: hidden;
    border: 2px dashed #ccc;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;

    &:hover {
      border-color: #2196f3;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .upload-icon {
      font-size: 24px;
      color: #666;
    }
  }

  input[type="file"] {
    display: none;
  }

  .error-message {
    color: #f44336;
    font-size: 14px;
    margin-top: 8px;
  }
`;

const DocumentUpload = styled.div`
  .document-slot {
    margin-top: 10px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    border: 1px solid #e0e0e0;
    padding: 1rem;
    border-radius: 12px;
    background: #fafafa;
    margin-bottom: 1rem;
    transition: all 0.3s ease;
  }

  .document-slot:hover {
    border-color: #007bff;
    background: #f5f9ff;
  }

  .upload-dropzone {
    border: 2px dashed #bbb;
    padding: 2rem;
    text-align: center;
    border-radius: 12px;
    background: #fdfdfd;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .upload-dropzone:hover {
    border-color: #007bff;
    background: #eef6ff;
  }
  .add-more-documents {
    margin-top: 1rem;
    margin-bottom: 10px;
    text-align: center;
  }

  .upload-label {
    color: blue;
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
  }

  .upload-icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  .file-item {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .file-preview {
    width: 60px;
    height: 60px;
    border-radius: 8px;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #f0f0f0;
    flex-shrink: 0;
  }

  .preview-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .pdf-preview {
    font-size: 2rem;
    color: #d9534f;
  }

  .file-meta {
    display: flex;
    flex-direction: column;
  }

  .file-name {
    font-weight: 500;
    font-size: 0.95rem;
  }

  .file-size {
    font-size: 0.8rem;
    color: #888;
  }

  .document-details {
    display: flex;
    gap: 1rem;
    margin-top: 0.5rem;
  }

  .document-details .document-name,
  .document-details .document-expiry {
    flex: 1;
  }

  .document-actions {
    margin-top: 0.5rem;
    text-align: right;
  }
`;

const FormField = styled.div`
  margin-bottom: 14px;
  width: 100%;

  &.half-width {
    width: calc(50% - 12px);
  }
`;

const FormRow = styled.div`
  display: flex;
  gap: 24px;
  // margin-bottom: 24px;
  width: 100%;
`;

const serviceOptions = [
  { value: "individual_therapy", label: "Individual Therapy" },
  { value: "group_therapy", label: "Group Therapy" },
  { value: "couples_counseling", label: "Couples Counseling" },
  { value: "family_therapy", label: "Family Therapy" },
  { value: "teen_counseling", label: "Teen Counseling" },
  { value: "online_therapy", label: "Online Therapy" },
];

const specialtiesOptions = [
  { value: "anxiety", label: "Anxiety" },
  { value: "depression", label: "Depression" },
  { value: "trauma", label: "Trauma" },
  { value: "ptsd", label: "PTSD" },
  { value: "relationship_issues", label: "Relationship Issues" },
  { value: "stress_management", label: "Stress Management" },
  { value: "grief_counseling", label: "Grief Counseling" },
];

const modalityOptions = [
  { value: "online", label: "Online" },
  { value: "in_person", label: "In Person" },
  { value: "phone", label: "Phone" },
];

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const raceOptions = [
  { value: "asian", label: "Asian" },
  { value: "black", label: "Black" },
  { value: "hispanic", label: "Hispanic" },
  { value: "white", label: "White" },
  { value: "other", label: "Other" },
];

const SignUp = () => {
  const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGES_BASE_URL;
  const router = useRouter();
  const { type } = router.query;
  const { userId } = router.query;

  const [servicesDropdown, setServicesDropdown] = useState([]);
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [profilePictureError, setProfilePictureError] = useState("");
  const [onBoardingDetails, setOnBoardingDetails] = useState("");
  const profilePictureInputRef = useRef(null);
  // const userData = Cookies.get("user");
  // const userObj = userData && JSON.parse(userData);
  const [userObj, setUserObj] = useState(null);
  const methods = useForm({
    mode: "onTouched",
    shouldUnregister: false,
    defaultValues: {
      location: "",
      public_phone: "",
      patients_seen: "",
      profile_notes: "",
      services_offered: [],
      service_modalities: [],
      specialties: [],
      gender: "",
      race: "",
      license_number: "",
      license_file_url: "",
      license_provider: "",
      availability: {},
      documentFiles: [],
      documentNames: [],
      documentExpiryDates: [],
    },
  });
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  const [documentFiles, setDocumentFiles] = useState([]);
  const [documentNames, setDocumentNames] = useState([]);
  const [documentExpiryDates, setDocumentExpiryDates] = useState([]);
  const [licenseFile, setLicenseFile] = useState(null);

  // Check if user profile exists
  useEffect(() => {
    const checkExistingProfile = async () => {
      if (userObj?.user_profile_id) {
        try {
          const response = await CommonServices.getCounselorProfile(
            userObj.user_profile_id
          );
          if (response.status === 200 && response.data?.rec?.length > 0) {
            console.log(response, "response.data");
            // router.push('/dashboard');
          }
        } catch (error) {
          console.error("Error checking profile:", error);
        }
      }
    };

    checkExistingProfile();
  }, [userObj?.user_profile_id, router]);
  const handleLicenseFileSelect = (file) => {
    setLicenseFile(file);
  };
  useEffect(() => {
    const data = localStorage.getItem("user");
    if (data) {
      const userDetails = JSON.parse(localStorage.getItem("user"));
      setUserObj(userDetails);
    }
  }, []);
  const validateStep = async (step) => {
    let fieldsToValidate = [];

    switch (step) {
      case 1:
        fieldsToValidate = [
          "location",
          "public_phone",
          "patients_seen",
          "profile_notes",
          "treatment_target",
          "service_modalities",
          "gender",
          "race",
          "license_number",
          "license_file_url",
          "license_provider",
        ];
        break;
      case 2:
        fieldsToValidate = ["license_number", "license_file_url"];
        break;
      case 3:
        fieldsToValidate = ["availability"];
        break;
      default:
        return false;
    }

    const result = await methods.trigger(fieldsToValidate);
    return result;
  };

  const handleProfilePictureChange = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      setProfilePicture(null);
      setProfilePictureFile(null);
      return;
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setProfilePictureError(
        "Invalid file type. Only JPEG, PNG and GIF are allowed."
      );
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setProfilePictureError("File too large. Maximum size is 5MB.");
      return;
    }

    setProfilePictureError("");
    setProfilePicture(URL.createObjectURL(file));
    setProfilePictureFile(file);
  };

  const onSubmit = async (formData) => {
    setLoading(true);
    try {
      const profileData = {
        user_profile_id: userObj?.user_profile_id,
        counselor_profile_id: onBoardingDetails?.counselor_profile_id,
        license_number: formData.license_number,
        license_provider: formData.license_provider,
        license_expiry_date: formData.license_expiry_date,
        // services_offered: JSON.stringify(
        //   Array.isArray(formData?.services_offered)
        //     ? formData.services_offered.map((s) => s.label)
        //     : []
        // ),
        // specialties: JSON.stringify(
        //   formData?.specialties?.map((s) => s.value) || []
        // ),
        service_modalities: JSON.stringify(
          Array.isArray(formData?.service_modalities)
            ? formData.service_modalities.map((s) => s.value)
            : []
        ),
        treatment_target: Array.isArray(formData?.treatment_target)
          ? formData.treatment_target.map((t) => t.value)
          : [],
        availability: JSON.stringify(formData.availability || {}),
        location: formData.location?.value,
        location_lat: formData.location?.lat,
        location_lng: formData.location?.lng,
        public_phone: formData.public_phone,
        patients_seen: parseInt(formData.patients_seen) || 0,
        gender: formData.gender?.value,
        race: formData.race?.value,
        profile_notes: formData.profile_notes,
      };

      const response = type
        ? await updateProfile(profileData, userId)
        : await onBoarding(profileData);
      if (response?.id || userId) {
        const idToUpdate = response?.id ? response?.id : userId;

        let profileImageSuccess = true;
        let licenseFileSuccess = true;
        let documentsSuccess = true;

        // Upload profile picture if selected
        if (profilePictureFile) {
          try {
            const formData = new FormData();
            formData.append("image", profilePictureFile);
            await CommonServices.uploadProfileImage(idToUpdate, formData);
          } catch (error) {
            profileImageSuccess = false;
            console.error("Error uploading profile picture:", error);
            toast.error("Failed to upload profile picture");
          }
        }

        // Upload license file if selected
        if (licenseFile && typeof licenseFile !== "string") {
          try {
            const formData = new FormData();
            formData.append("license", licenseFile);
            await CommonServices.uploadLicenseFile(idToUpdate, formData);
          } catch (error) {
            licenseFileSuccess = false;
            console.error("Error uploading license file:", error);
            toast.error("Failed to upload license file");
          }
        }

        // Upload additional documents
        if (documentFiles.length > 0) {
          const documentUploadPromises = documentFiles.map(
            async (file, index) => {
              try {
                if (!(file instanceof File)) {
                  return true;
                }

                const formData = new FormData();
                formData.append("counselor_profile_id", idToUpdate);
                formData.append("document_type", "other");
                formData.append("document_name", documentNames[index]);
                formData.append("expiry_date", documentExpiryDates[index]);
                formData.append("document", file);

                await CommonServices.uploadOnboardingDocuments(formData);
                return true;
              } catch (error) {
                toast.error(error?.message);
                console.error(`Error uploading document ${index + 1}:`, error);
                return false;
              }
            }
          );

          const documentResults = await Promise.all(documentUploadPromises);
          const documentsSuccess = documentResults.every((result) => result);

          if (!documentsSuccess) {
            toast.warning("Some documents failed to upload");
          }
        }
        if (profileImageSuccess && licenseFileSuccess && documentsSuccess) {
          toast.success(
            type
              ? "Profile updated successfully"
              : "Profile created successfully",
            { position: "top-right" }
          );

          if (!type) {
            toast.success("Onboarding Success Please login again");
            logout();
          } else {
            router.push("/dashboard");
          }
        }
      } else if (
        response?.message === "Counselor profile updated successfully"
      ) {
        toast.success(response?.message, {
          position: "top-right",
        });
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error(error?.response?.data?.message || "Something went wrong", {
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const renderStepIndicator = () => (
    <StepIndicator>
      <div className="step">
        <div
          className={`step-number ${currentStep >= 1 ? "active" : ""} ${
            currentStep > 1 ? "completed" : ""
          }`}
        >
          1
        </div>
        <div className={`step-label ${currentStep === 1 ? "active" : ""}`}>
          Basic Details
        </div>
      </div>
      <div className="step">
        <div
          className={`step-number ${currentStep >= 2 ? "active" : ""} ${
            currentStep > 2 ? "completed" : ""
          }`}
        >
          2
        </div>
        <div className={`step-label ${currentStep === 2 ? "active" : ""}`}>
          License Information
        </div>
      </div>
      <div className="step">
        <div className={`step-number ${currentStep >= 3 ? "active" : ""}`}>
          3
        </div>
        <div className={`step-label ${currentStep === 3 ? "active" : ""}`}>
          Availability
        </div>
      </div>
    </StepIndicator>
  );

  const handleUploadComplete = (fileUrl) => {
    methods.setValue("license_file_url", fileUrl);
  };

  const handleAddMoreDocument = () => {
    setDocumentFiles((prev) => [...prev, null]);
    setDocumentNames((prev) => [...prev, ""]);
    setDocumentExpiryDates((prev) => [...prev, ""]);
  };

  const handleDocumentFileChange = (index, file) => {
    const newFiles = [...documentFiles];
    newFiles[index] = file;
    setDocumentFiles(newFiles);
    methods.setValue("documentFiles", newFiles);
  };

  const handleDocumentNameChange = (index, name) => {
    const newNames = [...documentNames];
    newNames[index] = name;
    setDocumentNames(newNames);
    methods.setValue(`documentNames.${index}`, name);
  };

  const handleDocumentExpiryChange = (index, date) => {
    const newDates = [...documentExpiryDates];
    newDates[index] = date;
    setDocumentExpiryDates(newDates);
    methods.setValue(`documentExpiryDates.${index}`, date);
  };
  const handleDeleteDocument = async (index) => {
    try {
      const document_id = documentFiles[index]?.id;
      console.log(document_id);
      if (document_id) {
        const response = await api.delete(
          `${ApiConfig.onboarding.uploadDocuments}/${document_id}`
        );
        if (response.status === 200) {
          toast.success(response?.data?.message);
          const newFiles = [...documentFiles];
          const newNames = [...documentNames];
          const newDates = [...documentExpiryDates];
          newFiles.splice(index, 1);
          newNames.splice(index, 1);
          newDates.splice(index, 1);
          setDocumentFiles(newFiles);
          setDocumentNames(newNames);
          setDocumentExpiryDates(newDates);
          // fetchDocuments();
        }
      } else {
        const newFiles = [...documentFiles];
        const newNames = [...documentNames];
        const newDates = [...documentExpiryDates];
        newFiles.splice(index, 1);
        newNames.splice(index, 1);
        newDates.splice(index, 1);
        setDocumentFiles(newFiles);
        setDocumentNames(newNames);
        setDocumentExpiryDates(newDates);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  const uploadAllDocuments = async (counselorProfileId) => {
    const uploadPromises = documentFiles.map(async (file, index) => {
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("document_name", documentNames[index]);
        formData.append("expiry_date", documentExpiryDates[index]);
        formData.append("counselor_profile_id", counselorProfileId);

        try {
          await CommonServices.uploadOnboardingDocuments(formData);
          return true;
        } catch (error) {
          console.error(`Error uploading document ${index + 1}:`, error);
          return false;
        }
      }
      return true;
    });

    const results = await Promise.all(uploadPromises);
    return results.every((result) => result);
  };
  const fetchDocuments = async () => {
    try {
      if (!onBoardingDetails?.documents?.length) return;

      const results = await Promise.allSettled(
        onBoardingDetails.documents.map(async (doc) => {
          const response = await axios.get(
            `${imageBaseUrl}${doc.document_url}`,
            {
              responseType: "blob",
            }
          );
          const blob = response.data;
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve({
                base64: reader.result,
                name: doc.document_name,
                expiry: doc.expiry_date,
                type: doc.document_type,
                id: doc.document_id,
              });
            };
            reader.readAsDataURL(blob);
          });
        })
      );
      const successfulFiles = results
        .filter((r) => r.status === "fulfilled")
        .map((r) => r.value);
      setDocumentFiles(successfulFiles);
      setDocumentNames(successfulFiles.map((f) => f.name));
      setDocumentExpiryDates(successfulFiles.map((f) => f.expiry));
      methods.setValue(
        "documentNames",
        successfulFiles.map((f) => f.name)
      );
      methods.setValue(
        "documentExpiryDates",
        successfulFiles.map((f) => f.expiry)
      );
      console.log("Prefilled docs:", successfulFiles);
    } catch (err) {
      console.error("Error fetching documents:", err);
    }
  };

  useEffect(() => {
    if (type && userId) {
      getProfileData();
    }
  }, [type, userId]);

  // Add new useEffect for form prefilling
  useEffect(() => {
    if (onBoardingDetails) {
      const servicesOffered = onBoardingDetails?.services_offered?.map(
        (service) => ({
          value: service.service_id,
          label: service.service_name,
        })
      );

      const specialties = onBoardingDetails.specialties?.map((specialty) => ({
        value: specialty.service_id,
        label: specialty.service_name,
      }));

      const serviceModalities = onBoardingDetails.service_modalities?.map(
        (modality) => ({
          value: modality.toLowerCase().replace(" ", "_"),
          label: modality,
        })
      );
      const treatment_target = onBoardingDetails.target_outcomes?.map(
        (item) => ({
          label: item.target_name,
          value: item.target_outcome_id,
        })
      );

      methods.reset({
        location: {
          value: onBoardingDetails.location,
          label: onBoardingDetails.location,
        },
        public_phone: onBoardingDetails.public_phone,
        patients_seen: onBoardingDetails.patients_seen.toString(),
        profile_notes: onBoardingDetails.profile_notes,
        services_offered: servicesOffered,
        specialties: specialties,
        service_modalities: serviceModalities,
        gender: {
          value: onBoardingDetails.gender.toLowerCase(),
          label:
            onBoardingDetails.gender.charAt(0).toUpperCase() +
            onBoardingDetails.gender.slice(1),
        },
        race: {
          value: onBoardingDetails.race.toLowerCase(),
          label: onBoardingDetails.race,
        },
        license_number: onBoardingDetails.license_number,
        license_provider: onBoardingDetails.license_provider,
        license_file_url: onBoardingDetails.license_file_url,
        availability: onBoardingDetails.availability || {},
        treatment_target: treatment_target || [],
      });

      const fetchProfileImage = async () => {
        if (onBoardingDetails.profile_picture_url) {
          try {
            const response = await axios.get(
              `${imageBaseUrl}${onBoardingDetails.profile_picture_url}`,
              {
                responseType: "blob", // Important: get raw binary data
                // headers: {
                //   "ngrok-skip-browser-warning": "true",
                // },
              }
            );

            const blob = response.data;

            const reader = new FileReader();
            reader.onloadend = () => {
              const base64data = reader.result; // Data URL (base64)
              setProfilePicture(base64data); // Now usable as <img src={profilePicture} />
            };

            reader.readAsDataURL(blob);
          } catch (error) {
            console.error(error);
          }
        }
      };

      if (onBoardingDetails?.profile_picture_url) {
        fetchProfileImage();
      }

      const fetchLicenseImage = async () => {
        if (onBoardingDetails.license_file_url) {
          try {
            const response = await axios.get(
              `${imageBaseUrl}${onBoardingDetails.license_file_url}`,
              {
                responseType: "blob",
                // headers: {
                //   "ngrok-skip-browser-warning": "true",
                // },
              }
            );

            const blob = response.data;

            const reader = new FileReader();
            reader.onloadend = () => {
              const base64data = reader.result;
              setLicenseFile(base64data);
            };

            reader.readAsDataURL(blob);
          } catch (error) {
            console.log(error);
          }
        }
      };

      if (onBoardingDetails.license_file_url) {
        fetchLicenseImage();
      }
      if (
        onBoardingDetails.documents &&
        onBoardingDetails.documents.length > 0
      ) {
        fetchDocuments();
      }
    }
  }, [onBoardingDetails]);

  const renderStepContent = (step = currentStep) => {
    switch (step) {
      case 1:
        return (
          <>
            <ProfilePictureUpload>
              <div
                className="profile-picture-container"
                onClick={() => profilePictureInputRef.current?.click()}
              >
                {profilePicture ? (
                  <img src={profilePicture} alt="Profile" />
                ) : (
                  <span className="upload-icon">📷</span>
                )}
              </div>
              <input
                id="profile-picture-input"
                type="file"
                accept="image/jpeg,image/png,image/gif"
                onChange={handleProfilePictureChange}
                ref={profilePictureInputRef}
              />
              {profilePictureError && (
                <div className="error-message">{profilePictureError}</div>
              )}
            </ProfilePictureUpload>

            <FormRow
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <FormField className="half-width">
                <Controller
                  name="license_number"
                  control={methods.control}
                  rules={{ required: "License number is required" }}
                  render={({ field, fieldState: { error } }) => (
                    <CustomInputField
                      {...field}
                      label="License Number"
                      required
                      customClass="license-input"
                      placeholder="Enter your license number"
                      error={error?.message}
                    />
                  )}
                />
              </FormField>
              <FormField className="half-width">
                <Controller
                  name="license_provider"
                  control={methods.control}
                  rules={{ required: "License provider is required" }}
                  render={({ field, fieldState: { error } }) => (
                    <CustomInputField
                      {...field}
                      label="License Provider*"
                      required
                      customClass="license-provider-input"
                      placeholder="Enter your license provider"
                      error={error?.message}
                    />
                  )}
                />
              </FormField>
            </FormRow>
            <FormField>
              <Controller
                name="location"
                control={methods.control}
                rules={{ required: "Location is required" }}
                render={({ field, fieldState: { error } }) => (
                  <LocationSearch
                    {...field}
                    label="Location"
                    error={error?.message}
                  />
                )}
              />
            </FormField>

            <FormRow>
              <FormField className="half-width">
                <Controller
                  name="public_phone"
                  control={methods.control}
                  rules={{
                    required: "Phone number is required",
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: "Please enter a valid 10-digit phone number",
                    },
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <CustomInputField
                      {...field}
                      label="Public Phone Number"
                      required
                      customClass="phone-input"
                      placeholder="Enter your public phone number"
                      error={error?.message}
                    />
                  )}
                />
              </FormField>
              <FormField className="half-width">
                <Controller
                  name="patients_seen"
                  control={methods.control}
                  rules={{
                    required: "Number of patients is required",
                    min: {
                      value: 0,
                      message: "Number of patients cannot be negative",
                    },
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <CustomInputField
                      {...field}
                      label="Number of Patients Seen"
                      type="number"
                      required
                      customClass="patients-input"
                      placeholder="Enter number of patients seen"
                      error={error?.message}
                    />
                  )}
                />
              </FormField>
            </FormRow>

            <FormField>
              <Controller
                name="profile_notes"
                control={methods.control}
                rules={{ required: "Profile notes are required" }}
                render={({ field, fieldState: { error } }) => (
                  <CustomInputField
                    {...field}
                    label="Profile Notes"
                    required
                    customClass="notes-input"
                    placeholder="Enter your professional profile notes"
                    error={error?.message}
                  />
                )}
              />
            </FormField>

            {/* <FormRow>
              <FormField className="half-width">
                <Controller
                  name="services_offered"
                  control={methods.control}
                  rules={{ required: "Services offered is required" }}
                  render={({ field, fieldState: { error } }) => (
                    <CustomMultiSelect
                      {...field}
                      label="Services Offered*"
                      placeholder="Select services offered"
                      isMulti={true}
                      options={servicesDropdown}
                      error={error?.message}
                    />
                  )}
                />
              </FormField>
            </FormRow> */}

            <FormRow>
              <FormField className="half-width">
                <Controller
                  name="gender"
                  control={methods.control}
                  rules={{ required: "Gender is required" }}
                  render={({ field, fieldState: { error } }) => (
                    <CustomMultiSelect
                      {...field}
                      label="Gender*"
                      placeholder="Select your gender"
                      isMulti={false}
                      options={genderOptions}
                      error={error?.message}
                    />
                  )}
                />
              </FormField>
              <FormField className="half-width">
                <Controller
                  name="race"
                  control={methods.control}
                  rules={{ required: "Race/Ethnicity is required" }}
                  render={({ field, fieldState: { error } }) => (
                    <CustomMultiSelect
                      {...field}
                      label="Race/Ethnicity*"
                      placeholder="Select your race/ethnicity"
                      isMulti={false}
                      options={raceOptions}
                      error={error?.message}
                    />
                  )}
                />
              </FormField>
            </FormRow>

            <FormRow>
              <FormField className="half-width">
                <Controller
                  name="service_modalities"
                  control={methods.control}
                  rules={{ required: "Service modalities are required" }}
                  render={({ field, fieldState: { error } }) => (
                    <CustomMultiSelect
                      {...field}
                      label="Service Modalities*"
                      placeholder="Select service modalities"
                      isMulti={true}
                      options={modalityOptions}
                      error={error?.message}
                    />
                  )}
                />
              </FormField>
              <FormField className="half-width">
                <Controller
                  name="treatment_target"
                  control={methods.control}
                  rules={{ required: "Treatment target is required" }}
                  render={({ field, fieldState: { error } }) => (
                    <CustomMultiSelect
                      {...field}
                      className="min-multi"
                      label="Treatment Target"
                      placeholder="Select Treatment Target"
                      isMulti={true}
                      options={TREATMENT_TARGET}
                      error={error?.message}
                    />
                  )}
                />
              </FormField>
            </FormRow>
            <FormRow>
              <FormField>
                <label>License File</label>
                <Controller
                  name="license_file_url"
                  control={methods.control}
                  rules={{ required: "License file is required" }}
                  render={({ field, fieldState: { error } }) => (
                    <LicenseFileUpload
                      counselorProfileId={123}
                      onUploadComplete={handleUploadComplete}
                      errormsg={error?.message}
                      label="License Number"
                      onFileSelect={handleLicenseFileSelect}
                      hideUploadButton={true}
                      licenseFile={licenseFile}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </FormField>
            </FormRow>
          </>
        );
      case 2:
        return (
          <>
            <DocumentUpload>
              <h3>Additional Documents</h3>
              <p>
                Upload any additional certifications, insurance documents, or
                other relevant files.
              </p>
              {documentFiles.map((file, index) => (
                <div key={index} className="document-slot">
                  {!file && (
                    <div
                      className="upload-dropzone"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (e.dataTransfer.files.length > 0) {
                          handleDocumentFileChange(
                            index,
                            e.dataTransfer.files[0]
                          );
                        }
                      }}
                    >
                      <input
                        accept="image/*,.pdf"
                        id={`document-upload-${index}`}
                        type="file"
                        style={{ display: "none" }}
                        onChange={(e) =>
                          e.target.files?.[0] &&
                          handleDocumentFileChange(index, e.target.files[0])
                        }
                      />
                      <label
                        htmlFor={`document-upload-${index}`}
                        className="upload-label"
                      >
                        <span className="upload-icon">⬆️</span>
                        <p>
                          Drag and Drop here
                          <br />
                          or <span className="browse-link">Browse files</span>
                        </p>
                      </label>
                    </div>
                  )}
                  {file && (
                    <div className="file-item">
                      <div className="file-preview">
                        {file?.type?.startsWith("image/") ||
                        file?.base64?.startsWith("data:image") ? (
                          <img
                            src={
                              file.base64
                                ? file.base64
                                : URL.createObjectURL(file)
                            }
                            alt={file.name || "document"}
                            className="preview-image"
                            onLoad={(e) => {
                              if (file instanceof File) {
                                URL.revokeObjectURL(e.currentTarget.src);
                              }
                            }}
                          />
                        ) : (
                          <FaRegFilePdf color="red" />
                        )}
                      </div>

                      <div className="file-meta">
                        <p className="file-name">{file.name}</p>
                      </div>
                      {file instanceof File && (
                        <CiCircleRemove
                          size={30}
                          color="red"
                          onClick={() => {
                            const updatedFiles = [...documentFiles];
                            updatedFiles[index] = null;
                            setDocumentFiles(updatedFiles);
                          }}
                        />
                      )}
                    </div>
                  )}

                  <div className="document-details">
                    <div className="document-name">
                      <Controller
                        name={`documentNames.${index}`}
                        control={methods.control}
                        rules={{ required: "Document name is required" }}
                        render={({ field, fieldState: { error } }) => (
                          <CustomInputField
                            disabled={documentFiles[index]?.id ? true : false}
                            {...field}
                            label="Document Name"
                            required
                            customClass="document-name-input"
                            placeholder="Enter document name"
                            error={error?.message}
                            onChange={(e) =>
                              handleDocumentNameChange(index, e.target.value)
                            }
                          />
                        )}
                      />
                    </div>

                    <div className="document-expiry">
                      <Controller
                        disabled={documentFiles[index]?.id ? true : false}
                        name={`documentExpiryDates.${index}`}
                        control={methods.control}
                        rules={{ required: "Document expiry date is required" }}
                        render={({ field, fieldState: { error } }) => (
                          <CustomInputField
                            {...field}
                            label="Expiry Date"
                            required
                            customClass="document-expiry-input"
                            placeholder="DD-MM-YYYY"
                            error={error?.message}
                            onChange={(e) =>
                              handleDocumentExpiryChange(index, e.target.value)
                            }
                          />
                        )}
                      />
                    </div>
                  </div>

                  <div className="document-actions">
                    <CustomButton
                      title="Delete"
                      type="button"
                      onClick={() => handleDeleteDocument(index)}
                      className="secondary-button"
                    />
                  </div>
                </div>
              ))}

              <div className="add-more-documents">
                <CustomButton
                  title="Add More Documents"
                  type="button"
                  onClick={handleAddMoreDocument}
                  className="secondary-button"
                />
              </div>
            </DocumentUpload>
            <div className="skip-add-more-documents">
              <CustomButton
                title="Skip Documents"
                type="button"
                onClick={() => {
                  setDocumentFiles([]);
                  setDocumentNames([]);
                  setDocumentExpiryDates([]);
                  setCurrentStep(3);
                }}
                className="secondary-button"
              />
            </div>
          </>
        );
      case 3:
        return (
          <StepContent>
            <h2>Availability</h2>
            {/* <p>Please set your weekly availability for sessions.</p> */}
            <Controller
              name="availability"
              control={methods.control}
              defaultValue={{}}
              render={({ field }) => (
                <WeeklyAvailability
                  control={methods.control}
                  value={onBoardingDetails?.availability || {}}
                />
              )}
            />
          </StepContent>
        );
      default:
        return null;
    }
  };

  // Helper to get step from type
  const getStepFromType = (type) => {
    if (type === "basic") return 1;
    if (type === "license") return 2;
    if (type === "availability") return 3;
    return currentStep;
  };

  const fetchServicesData = async () => {
    try {
      const servicesResponse = await CommonServices.getServices();
      if (servicesResponse.status === 200) {
        // Map all services for both dropdowns
        const allServices = servicesResponse?.data?.rec?.map((service) => ({
          value: service.service_id,
          label: service.service_name,
          is_report: service.is_report,
          is_additional: service.is_additional,
        }));

        // Filter services for regular services dropdown (non-report, non-additional)
        const regularServices = allServices?.filter(
          (service) => service.is_report === 0 && service.is_additional === 0
        );
        setServicesDropdown(regularServices);
      }
    } catch (error) {
      console.log("Error fetching all the services", error);
      toast.error("Failed to load services. Please try again.");
    }
  };

  const getProfileData = async () => {
    try {
      const { data, status } = await CommonServices.getCounselorProfile(userId);
      if (data && status === 200) {
        const profile = data?.rec?.[0] || {};
        const documents = data?.documents || [];
        setOnBoardingDetails({
          ...profile,
          documents,
        });
      }
    } catch (error) {
      console.log("Error while fetching counselor details:", error);
      setOnBoardingDetails(null);
    }
  };

  useEffect(() => {
    fetchServicesData();
  }, []);

  return (
    <Wrapper>
      {/* <LeftPanel>
        <div className="company-greetings">
          <img src="/assets/images/Mindbridge_logo_1.svg" alt="company-logo" />
          <div>
            <h1>Welcome to Mind Bridge! 👋</h1>
            <p>
              Your secure intelligent platform for streamlined counseling and
              client management.
            </p>
            <ul>
              <li>
                <b>Effortless Navigation: </b>Access client-sessions, treatment
                tools and actionable insights with minimal clicks.
              </li>
              <li>
                <b>Crisis Response: </b>A <b>one-click</b> link to &ldquo;
                <b>Responding to a Suicidal Client</b>
                &rdquo; is available on all main screens for immediate guidance.
              </li>
              <li>
                <b>Data-Driven Decisions: </b>Track client progress, automate
                SMART goal templates, and generate visual insights.
              </li>
              <li>
                <b>Seamless Session Management: </b>Schedule, monitor, and
                adjust treatment plans efficiently.
              </li>
            </ul>
            <p>Login now and bridge the gap between care and innovation</p>
          </div>
        </div>
        <span>© 2024 MindBridge. All rights reserved.</span>
      </LeftPanel> */}
      <RightPanel>
        <FormContainer>
          <h2>On Boarding</h2>
          {!type && renderStepIndicator()}
          <FormProvider {...methods}>
            <form>
              {type
                ? renderStepContent(getStepFromType(currentStep))
                : renderStepContent()}
              {/* {type && (
                <CustomButton
                  title="Submit"
                  type="button"
                  onClick={methods.handleSubmit(onSubmit)}
                  className="primary-button"
                  disabled={loading}
                />
              )} */}
              {
                <ButtonContainer>
                  {currentStep === 1 && (
                    <CustomButton
                      title="Back"
                      type="button"
                      onClick={() => {
                        router.push("/dashboard");
                      }}
                      customClass="secondary-button"
                      onboardingStep={true}
                    />
                  )}
                  {currentStep > 1 && (
                    <CustomButton
                      title="Previous"
                      type="button"
                      onClick={prevStep}
                      className="secondary-button"
                    />
                  )}
                  {currentStep < totalSteps ? (
                    <CustomButton
                      title="Next"
                      type="button"
                      onClick={nextStep}
                      customClass="primary-button"
                      onboardingStep={true}
                    />
                  ) : loading ? (
                    <Spinner color="#628acdff" position="end" />
                  ) : (
                    <CustomButton
                      title="Submit"
                      type="button"
                      onClick={methods.handleSubmit(onSubmit)}
                      className="primary-button"
                      disabled={loading}
                    />
                  )}
                </ButtonContainer>
              }
            </form>
          </FormProvider>
        </FormContainer>
      </RightPanel>
      <style jsx>{`
        .document-upload-section {
          margin-top: 2rem;
        }

        .document-upload-item {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .document-upload-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .document-upload-header h3 {
          margin: 0;
          font-size: 1.1rem;
          color: #333;
        }

        .document-upload-fields {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .file-upload-container {
          grid-column: 1 / -1;
        }

        .file-input {
          display: none;
        }

        .file-upload-label {
          display: inline-block;
          padding: 0.75rem 1.5rem;
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .file-upload-label:hover {
          background: #f0f0f0;
        }

        .add-more-documents {
          margin-top: 1rem;
          margin-bottom: 10px;
          text-align: center;
        }

        .form-actions {
          display: flex;
          justify-content: space-between;
          margin-top: 2rem;
        }

        @media (max-width: 768px) {
          .document-upload-fields {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </Wrapper>
  );
};

export default SignUp;
