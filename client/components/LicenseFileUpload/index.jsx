import React, { useState, useRef } from 'react';
import CustomButton from '../CustomButton';
import { toast } from 'react-toastify';
import CustomInputField from '../CustomInputField';
import { useFormContext, Controller } from 'react-hook-form';
import CommonServices from '../../services/CommonServices';
import { ErrorMessage, FileInfo, FileInput, UploadButton, UploadContainer } from './style';

const LicenseFileUpload = ({ counselorProfileId, onUploadComplete }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedFileUrl, setUploadedFileUrl] = useState('');
  const fileInputRef = useRef(null);
  const { control, getValues } = useFormContext();

  const validateFile = (file) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];

    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a PDF, JPEG, or PNG file');
      return false;
    }

    if (file.size > maxSize) {
      setError('File size should be less than 5MB');
      return false;
    }

    setError('');
    return true;
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    
    const file = event.dataTransfer.files[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
  };

  const handleUploadClick = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    try {
      setIsUploading(true);
      setError('');
      
      const formValues = getValues();
      const { document_name, document_type, expiry_date } = formValues;

      if (!document_name || !document_type || !expiry_date) {
        setError('Please fill in all document details');
        setIsUploading(false);
        return;
      }
      
      const formData = new FormData();
      formData.append('document', selectedFile);
      formData.append('counselor_profile_id', counselorProfileId);
      formData.append('document_type', document_type);
      formData.append('document_name', document_name);
      formData.append('expiry_date', expiry_date);

      const response = await CommonServices.uploadOnboardingDocuments(formData);
      
      if (response.data) {
        setUploadedFileUrl(response.data.fileUrl);
        onUploadComplete(response.data.fileUrl);
        toast.success('Document uploaded successfully');
      }
    } catch (error) {
      setError(error.message || 'Failed to upload file. Please try again.');
      toast.error('Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setError('');
    setUploadedFileUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <UploadContainer>
      {/* <Controller
        name="document_name"
        control={control}
        rules={{ required: "Document name is required" }}
        render={({ field, fieldState: { error } }) => (
          <CustomInputField
            {...field}
            label="Document Name"
            placeholder="Enter document name"
            error={error?.message}
            required
          />
        )}
      />

      <Controller
        name="document_type"
        control={control}
        rules={{ required: "Document type is required" }}
        render={({ field, fieldState: { error } }) => (
          <CustomInputField
            {...field}
            label="Document Type"
            placeholder="Enter document type (e.g., png, pdf)"
            error={error?.message}
            required
          />
        )}
      />

      <Controller
        name="expiry_date"
        control={control}
        rules={{ required: "Expiry date is required" }}
        render={({ field, fieldState: { error } }) => (
          <CustomInputField
            {...field}
            label="Expiry Date"
            type="date"
            error={error?.message}
            required
          />
        )}
      /> */}


      <div 
        className={isDragging ? 'dragging' : ''}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{ marginTop: '24px', textAlign:'center' }}
      >
        <FileInput
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".pdf,.jpg,.jpeg,.png"
        />
        
        {!selectedFile ? (
          <>
            <p>Drag and drop your license file here, or</p>
            <UploadButton
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              browse files
            </UploadButton>
            <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
              Supported formats: PDF, JPEG, PNG (max 5MB)
            </p>
          </>
        ) : (
          <FileInfo>
            <div>
              <div className="file-name">{selectedFile.name}</div>
              <div className="file-size">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </div>
              {uploadedFileUrl && (
                <div className="file-url">
                  URL: {uploadedFileUrl}
                </div>
              )}
            </div>
            <button
              type="button"
              className="remove-button"
              onClick={removeFile}
              disabled={isUploading}
            >
              ×
            </button>
          </FileInfo>
        )}

        {selectedFile && !uploadedFileUrl && (
          <CustomButton
            title={isUploading ? "Uploading..." : "Upload File"}
            type="button"
            onClick={handleUploadClick}
            disabled={isUploading}
            customClass="primary-button"
            style={{ marginTop: '16px' }}
          />
        )}
      </div>
    </UploadContainer>
  );
};

export default LicenseFileUpload;
