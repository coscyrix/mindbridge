"use client";
import React, { useEffect, useState } from "react";
import CustomModal from "../CustomModal";
import { HomeWorkModalWrapper } from "./style";
import CustomInputField from "../CustomInputField/index";
import { useForm, FormProvider, Controller } from "react-hook-form";
import CustomButton from "../CustomButton";
import { CrossIcon, UploadIcon } from "../../public/assets/icons";
import ApiConfig from "../../config/apiConfig";
import { api } from "../../utils/auth";
import { useReferenceContext } from "../../context/ReferenceContext";
import { getHomeworkAssignments } from "./homeworkAssignments";
import Select from "react-select";
import { selectStyles } from "./selectStyles";
import { useMutationData } from "../../utils/hooks/useMutationData";
import { useQueryData } from "../../utils/hooks/useQueryData";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

interface HomeworkModalProps {
  isOpen: boolean;
  id?: {
    treatment_target?: string;
    [key: string]: any;
  } | null;
  onClose: () => void;
  session_id: number | string | null;
}

interface HomeworkFormData {
  homework_title: string;
  custom_homework_title?: string;
  homework: File | null;
}

interface HomeworkDetail {
  homework_id?: number;
  homework_filename?: string;
  homework_title?: string;
  homework_file_path?: string;
  session_id?: number;
  tenant_id?: number;
  file_size?: number;
  file_type?: string;
  created_at?: string;
}

const HomeworkModal: React.FC<HomeworkModalProps> = ({
  isOpen,
  id,
  onClose,
  session_id,
}) => {
  const [selectedFile, setSelectedFile] = useState<string>("Upload file");
  const [sentHomeworkTitles, setSentHomeworkTitles] = useState<string[]>([]);
  const [showAllHomework, setShowAllHomework] = useState<boolean>(false);
  const methods = useForm<HomeworkFormData>();
  const { userObj } = useReferenceContext() as {
    userObj?: { tenant_id?: number };
  };

  const treatmentTarget = id?.treatment_target || null;
  const queryClient = useQueryClient();

  // Get all homework assignments for the treatment target
  const allHomeworkAssignments = getHomeworkAssignments(treatmentTarget);

  // Filter homework options based on toggle state
  const availableHomeworkOptions = allHomeworkAssignments
    .filter((title) => {
      // Always include "Other Assignment"
      if (title === "Other Assignment") return true;
      // If showAllHomework is true, show all options
      if (showAllHomework) return true;
      // Otherwise, exclude if already sent
      return !sentHomeworkTitles.some(
        (sentTitle) => sentTitle.trim() === title.trim()
      );
    })
    .map((title) => {
      // Mark sent items in the label
      const isSent = sentHomeworkTitles.some(
        (sentTitle) => sentTitle.trim() === title.trim()
      );
      return {
        label: isSent && showAllHomework ? `${title} (Already Sent)` : title,
        value: title,
      };
    });
  const selectedHomeworkTitle = methods.watch("homework_title");
  const isOtherAssignment = selectedHomeworkTitle === "Other Assignment";

  const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file.name);
  };

  const handleReset = () => {
    methods.setValue("homework", null);
    setSelectedFile("Upload file");
  };

  // Fetch all homework details for the session using React Query
  const { data: allHomeworkDetails, isPending: isLoadingDetails } =
    useQueryData(
      ["homework-details", session_id],
      async () => {
        if (!session_id) return [];
        const response = await api.get(
          `${ApiConfig.homeworkUpload.gethomeworkdetail}/${session_id}`
        );
        return (response.data || []) as HomeworkDetail[];
      },
      !!session_id && isOpen
    );

  // Store sent homework titles in state
  useEffect(() => {
    if (allHomeworkDetails && Array.isArray(allHomeworkDetails)) {
      const titles = allHomeworkDetails
        .map((homework: HomeworkDetail) => homework.homework_title?.trim())
        .filter((title): title is string => !!title);
      setSentHomeworkTitles(titles);
    }
  }, [allHomeworkDetails]);

  // Submit homework using React Query mutation
  const { mutate: submitHomework, isPending: isSubmitting } = useMutation({
    mutationKey: ["submit-homework"],
    mutationFn: async (payload: {
      data: HomeworkFormData;
      finalTitle: string;
    }) => {
      const formData = new FormData();
      if (payload.data.homework) {
        formData.append("homework_file", payload.data.homework);
      }
      formData.append("homework_title", payload.finalTitle);
      formData.append("tenant_id", String(userObj?.tenant_id || ""));
      formData.append("session_id", String(session_id || ""));
      formData.append("email", "client@yopmail.com");

      const response = await api.post(
        ApiConfig.homeworkUpload.submitHomeworkdetails,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      // Throw error if response is not successful
      if (response.status !== 200 && response.status !== 201) {
        throw new Error(response.data?.message || "Failed to submit homework");
      }

      return response;
    },
    onSuccess: (data) => {
      // Show success toast
      toast.success(data?.data?.message || "Homework uploaded successfully");

      // Invalidate homework details query
      queryClient.invalidateQueries({ queryKey: ["homework-details"] });

      // Reset form
      methods.reset();
      setSelectedFile("Upload file");
      setShowAllHomework(false);

      // Close modal after successful submission
      onClose();
    },
    onError: (error: any) => {
      // Handle error responses
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "An error occurred while uploading homework";
      toast.error(errorMessage);
    },
  }); 

  const handleUploadHomeWork = (data: HomeworkFormData) => {
    const finalTitle =
      data.homework_title === "Other Assignment"
        ? data.custom_homework_title?.trim() || ""
        : data.homework_title?.trim() || "";

    if (!finalTitle) {
      toast.error("Please enter a homework title");
      return;
    }

    if (
      data.homework_title === "Other Assignment" &&
      !data.custom_homework_title?.trim()
    ) {
      toast.error("Please enter a custom homework title");
      return;
    }

    if (!data.homework) {
      toast.error("Please select a homework file");
      return;
    }

    submitHomework({ data, finalTitle });
  };

  useEffect(() => {
    if (!isOpen) {
      methods.reset();
      setSelectedFile("Upload file");
      setShowAllHomework(false);
    }
  }, [isOpen, methods]);

  return (
    <CustomModal
      title={"Upload & Send Homework"}
      isOpen={isOpen}
      onRequestClose={onClose}
      icon={null}
    >
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleUploadHomeWork)}>
          <HomeWorkModalWrapper>
            {treatmentTarget && (
              <div className="field">
                <div className="treatment-target-label">
                  Treatment Target: {treatmentTarget}
                </div>
              </div>
            )}
            <div className="field">
              <label>Title of Homework Document:</label>
              {availableHomeworkOptions.length > 0 ? (
                <>
                  {sentHomeworkTitles.length > 0 && (
                    <div className="show-all-toggle">
                      <label className="toggle-label">
                        <input
                          type="checkbox"
                          checked={showAllHomework}
                          onChange={(e) => setShowAllHomework(e.target.checked)}
                          disabled={isSubmitting || isLoadingDetails}
                        />
                        <span>Show all homework (including already sent)</span>
                      </label>
                    </div>
                  )}
                  <div className="homework-select-wrapper">
                    <Controller
                      control={methods.control}
                      name="homework_title"
                      render={({ field }) => (
                        <Select
                          {...field}
                          options={availableHomeworkOptions}
                          placeholder="Select homework assignment"
                          value={
                            availableHomeworkOptions.find(
                              (opt) => opt.value === field.value
                            ) || null
                          }
                          onChange={(option) => {
                            field.onChange(option?.value || "");
                            if (option?.value !== "Other Assignment") {
                              methods.setValue("custom_homework_title", "");
                            }
                          }}
                          styles={selectStyles}
                          menuPortalTarget={
                            typeof document !== "undefined"
                              ? document.body
                              : undefined
                          }
                          menuPosition="fixed"
                          isDisabled={isSubmitting || isLoadingDetails}
                        />
                      )}
                    />
                  </div>
                  {isOtherAssignment && (
                    <div className="custom-title-wrapper">
                      <CustomInputField
                        name="custom_homework_title"
                        placeholder="Enter custom homework title"
                        disabled={isSubmitting}
                        label=""
                        icon={null}
                        helperText=""
                        handleShowPassword={() => {}}
                        value=""
                        prefix=""
                      />
                    </div>
                  )}
                </>
              ) : (
                <CustomInputField
                  name="homework_title"
                  placeholder="add title"
                  disabled={isSubmitting}
                  label=""
                  icon={null}
                  helperText=""
                  handleShowPassword={() => {}}
                  value=""
                  prefix=""
                />
              )}
            </div>
            <div className="field">
              <label>Homework Document:</label>
              <div className="icon-input-container">
                <div className="upload-input-field">
                  <Controller
                    control={methods.control}
                    name="homework"
                    defaultValue={null}
                    render={({ field }) => (
                      <input
                        type="file"
                        disabled={isSubmitting}
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          field.onChange(file);
                          if (file) {
                            setSelectedFile(file.name);
                          }
                        }}
                      />
                    )}
                  />
                </div>
                <div className="svg-text">
                  {selectedFile === "Upload file" && <UploadIcon />}
                  <p>{selectedFile}</p>
                </div>
                {selectedFile !== "Upload file" && !isSubmitting && (
                  <div className="reset-icon" onClick={handleReset}>
                    <CrossIcon />
                  </div>
                )}
              </div>
            </div>
            <div className="modal-buttons">
              <CustomButton
                onClick={onClose}
                customClass="cancel-button"
                title="Cancel"
                icon={null}
              />
              <div>
                <button
                  className="save-button"
                  type="submit"
                  disabled={isSubmitting || isLoadingDetails}
                  style={{
                    opacity: isSubmitting || isLoadingDetails ? 0.6 : 1,
                    cursor:
                      isSubmitting || isLoadingDetails
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {isSubmitting ? "Uploading..." : "Upload & Send"}
                </button>
              </div>
            </div>
          </HomeWorkModalWrapper>
        </form>
      </FormProvider>
    </CustomModal>
  );
};

export default HomeworkModal;
