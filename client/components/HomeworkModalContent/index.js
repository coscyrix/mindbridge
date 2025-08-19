"use client";
import React, { useEffect, useRef, useState } from "react";
import CustomModal from "../CustomModal";
import { HomeWorkModalWrapper } from "./style";
import CustomInputField from "../CustomInputField/index";
import { useForm, FormProvider, Controller } from "react-hook-form";
import CustomButton from "../CustomButton";
import { CrossIcon, UploadIcon } from "../../public/assets/icons";
import ApiConfig from "../../config/apiConfig";
import { api } from "../../utils/auth";
import { toast } from "react-toastify";
import { useReferenceContext } from "../../context/ReferenceContext";
const HomeworkModal = ({ isOpen, id, onClose, session_id }) => {
  const [selectedFile, setSelectedFile] = useState("Upload file");
  const methods = useForm();

  const handleSelectFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file.name);
    }
  };
  const { userObj } = useReferenceContext();
  const fetchHomeworkDetails = async () => {
    try {
      const response = await api.get(
        `${ApiConfig.homeworkUpload.gethomeworkdetail}/662`
      );
      if (response.status == 200) {
        console.log(response);
        setSelectedFile(response?.data[0]?.homework_filename);
        methods.setValue("homework_title", response?.data[0]?.homework_title);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };
  useEffect(() => {
    fetchHomeworkDetails();
  }, []);
  const handleUploadHomeWork = async (data) => {
    try {
      let payload = {
        homework_file: data.homework,
        homework_title: data.homework_title,
        tenant_id: userObj?.tenant_id,
        session_id: session_id,
      };
      console.log(data);
      const response = await api.post(
        ApiConfig.homeworkUpload.submitHomeworkdetails,
        payload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.status == 200) {
        toast.success(response?.data?.message);
        onClose();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  const handleReset = () => {
    methods.setValue("homework", null);
    setSelectedFile("Upload file");
  };

  useEffect(() => {
    if (!isOpen) {
      methods.reset();
    }
  }, [isOpen]);

  return (
    <CustomModal
      title={"Upload & Send Homework"}
      isOpen={isOpen}
      onRequestClose={onClose}
    >

      <FormProvider {...methods}>
        {console.log(methods.getValues("homework"))}
        <form onSubmit={methods.handleSubmit(handleUploadHomeWork)}>
          <HomeWorkModalWrapper>
            <div className="field">
              <label>Title of Homework Document:</label>
              <CustomInputField name="homework_title" placeholder="add title" />
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
                        // accept=".pdf"
                        onChange={(e) => {
                          field.onChange(e.target.files[0]);
                          handleSelectFile(e);
                        }}
                      />
                    )}
                  />
                </div>
                <div className="svg-text">
                  {selectedFile === "Upload file" && <UploadIcon />}
                  <p>{selectedFile}</p>
                </div>
                {selectedFile !== "Upload file" && (
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
              />
              {/* currently closing the modal on the the upload button */}
              <div>
                <button className="save-button" type="submit">
                  Upload & Send
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
