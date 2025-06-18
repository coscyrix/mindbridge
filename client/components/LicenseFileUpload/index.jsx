import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import CustomInputField from '../CustomInputField';
import CustomButton from '../CustomButton';
import CommonServices from '../../services/CommonServices';

const FileUploadContainer = styled.div`
  margin-bottom: 24px;
`;

const UploadButton = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border: 2px dashed #ccc;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #2196F3;
    background: #f5f5f5;
  }

  .upload-icon {
    font-size: 24px;
    color: #666;
  }

  .upload-text {
    color: #666;
  }
`;

const FileInfo = styled.div`
  margin-top: 12px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .file-details {
    display: flex;
    align-items: center;
    gap: 12px;

    .file-icon {
      font-size: 24px;
      color: #666;
    }

    .file-name {
      font-weight: 500;
    }
  }

  .file-actions {
    display: flex;
    gap: 8px;
  }
`;

const DocumentForm = styled.div`
  margin-top: 12px;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 4px;

  .form-row {
    display: flex;
    gap: 16px;
    margin-bottom: 16px;

    .form-field {
      flex: 1;
    }
  }

  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
  }

  input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;

    &:focus {
      outline: none;
      border-color: #2196F3;
    }
  }
`;

const ErrorMessage = styled.div`
  color: #f44336;
  font-size: 14px;
  margin-top: 8px;
`;

const documentTypes = [
  { value: 'license', label: 'License' },
  { value: 'certification', label: 'Certification' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'education', label: 'Education' },
  { value: 'identification', label: 'Identification' },
  { value: 'other', label: 'Other' }
];

const LicenseFileUpload = ({ 
  counselorProfileId, 
  onUploadComplete, 
  documentType = 'license',
  showDocumentType = false,
  error 
}) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [documentName, setDocumentName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const fileInputRef = useRef(null);
  const { register, handleSubmit, getValues, formState: { errors } } = useForm();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Only PDF, JPEG and PNG are allowed.');
      return;
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File too large. Maximum size is 10MB.');
      return;
    }

    setFile(file);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file to upload.');
      return;
    }

    // Only validate document details for non-license documents
    if (documentType !== 'license' && (!documentName || !expiryDate)) {
      toast.error('Please fill in all document details.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      if (documentType === 'license') {
        const response = await CommonServices.uploadLicenseFile(counselorProfileId, formData);
        if (response.data?.license_file_url) {
          onUploadComplete(response.data.license_file_url);
          toast.success('License file uploaded successfully');
        }
      } else {
        formData.append('document_name', documentName);
        formData.append('expiry_date', expiryDate);
        formData.append('document_type', documentType);
        
        const response = await CommonServices.uploadOnboardingDocuments(formData);
        if (response.data) {
          onUploadComplete(response.data);
          toast.success('Document uploaded successfully');
        }
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setDocumentName('');
    setExpiryDate('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <FileUploadContainer>
      <label>{documentType === 'license' ? 'License File*' : 'Document Upload'}</label>
      {!file ? (
        <UploadButton onClick={() => fileInputRef.current?.click()}>
          <span className="upload-icon">📄</span>
          <span className="upload-text">
            {documentType === 'license' 
              ? 'Click to upload license file' 
              : 'Click to upload document'}
          </span>
          <input
            id="file-input"
            type="file"
            ref={fileInputRef}
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </UploadButton>
      ) : (
        <>
          <FileInfo>
            <div className="file-details">
              <span className="file-icon">📄</span>
              <span className="file-name">{file.name}</span>
            </div>
            <div className="file-actions">
              <CustomButton
                title="Remove"
                type="button"
                onClick={handleRemove}
                className="secondary-button"
              />
              <CustomButton
                title="Upload"
                type="button"
                onClick={handleUpload}
                disabled={loading}
                className="primary-button"
              />
            </div>
          </FileInfo>

          {/* Only show document form for non-license documents */}
          {documentType !== 'license' && (
            <DocumentForm>
              <div className="form-row">
                <div className="form-field">
                  <label>Document Name*</label>
                  <input
                    type="text"
                    value={documentName}
                    onChange={(e) => setDocumentName(e.target.value)}
                    placeholder="Enter document name"
                  />
                </div>
                <div className="form-field">
                  <label>Expiry Date*</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                  />
                </div>
              </div>
            </DocumentForm>
          )}
        </>
      )}
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </FileUploadContainer>
  );
};

export default LicenseFileUpload;
