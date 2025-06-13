import styled from "styled-components";

export const UploadContainer = styled.div`
  margin-top: 24px;
  border: 2px dashed #E0E0E0;
  border-radius: 8px;
  padding: 24px;
  background: #FAFAFA;
  transition: all 0.3s ease;

  &:hover {
    border-color: #2196F3;
    background: #F5F9FF;
  }

  &.dragging {
    border-color: #2196F3;
    background: #F5F9FF;
  }
`;

export const FileInput = styled.input`
  display: none;
`;

export const UploadButton = styled.button`
  background: none;
  border: none;
  color: #2196F3;
  cursor: pointer;
  font-size: 16px;
  padding: 8px 16px;
  margin: 8px 0;
  text-decoration: underline;

  &:hover {
    color: #1976D2;
  }
`;

export const FileInfo = styled.div`
  margin-top: 16px;
  padding: 12px;
  background: white;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  .file-name {
    flex: 1;
    text-align: left;
    color: #333;
    font-size: 14px;
  }

  .file-size {
    color: #666;
    font-size: 12px;
  }

  .file-url {
    color: #2196F3;
    font-size: 12px;
    word-break: break-all;
    margin-top: 4px;
  }

  .remove-button {
    background: none;
    border: none;
    color: #FF5252;
    cursor: pointer;
    padding: 4px 8px;
    font-size: 18px;
    
    &:hover {
      color: #D32F2F;
    }
  }
`;

export const ErrorMessage = styled.div`
  color: #FF5252;
  font-size: 14px;
  margin-top: 8px;
`;