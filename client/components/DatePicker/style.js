import styled from "styled-components";

export const DataPickerWrapper = styled.div`
  .react-datepicker-wrapper {
    width: 100%;
    input {
      width: 100%;
      padding: 10px;
      outline: none;
      border: none;
      border-bottom: 1px solid black !important;
      font-size: 16px;
      background-color: transparent;
      cursor: pointer;
      
      &::placeholder {
        color: #999;
      }
      
      &:focus {
        border-bottom: 2px solid #2563eb !important;
      }
    }
  }
  
  &.styled-input {
    .react-datepicker-wrapper {
      input {
        border: 1px solid #ddd !important;
        border-radius: 4px;
        background-color: #fff;
        
        &:focus {
          border: 1px solid #2563eb !important;
          outline: none;
        }
      }
    }
  }
`;
