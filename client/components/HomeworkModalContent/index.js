"use client";
import React, { useEffect, useRef, useState } from "react";
import CustomModal from "../CustomModal";
import { HomeWorkModalWrapper } from "./style";
import CustomInputField from "../CustomInputField/index";
import { useForm, FormProvider, Controller } from "react-hook-form";
import CustomButton from "../CustomButton";
import { CrossIcon, UploadIcon } from "../../public/assets/icons";
const HomeworkModal = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState("Upload file");
  const methods = useForm();

  const handleSelectFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file.name);
    }
  };
  

  const handleUploadHomeWork = (data) => {
    console.log("Title:", data.homework_title);
    console.log("File:", data.homework); 
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
                        accept=".pdf"
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
