import styled from "styled-components";

export const UploadContainer = styled.div`
  margin-top: 24px;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  padding: 24px;
  background: #fafafa;
  transition: all 0.3s ease;

  &:hover {
    border-color: #2196f3;
    background: #f5f9ff;
  }

  &.errorContainer {
    border-color: red;
  }
  &.dragging {
    border-color: #2196f3;
    background: #f5f9ff;
  }
`;

export const FileInput = styled.input`
  display: none;
`;

export const UploadButton = styled.button`
  background: none;
  border: none;
  color: #2196f3;
  cursor: pointer;
  font-size: 16px;
  padding: 8px 16px;
  margin: 8px 0;
  text-decoration: underline;

  &:hover {
    color: #1976d2;
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
    color: #2196f3;
    font-size: 12px;
    word-break: break-all;
    margin-top: 4px;
  }

  .remove-button {
    background: none;
    border: none;
    color: #ff5252;
    cursor: pointer;
    padding: 4px 8px;
    font-size: 18px;

    &:hover {
      color: #d32f2f;
    }
  }
`;

export const ErrorMessage = styled.div`
  color: #ff5252;
  font-size: 14px;
  margin-top: 8px;
`;
