import styled from "styled-components";

export const ChipsContainer = styled.div`
  margin-bottom: 10px;
`;

export const ChipsWrapper = styled.div`
    width: 100%;
    height: 45px;
    display:flex;
    align-items:center;
    gap:10px;
    border-radius: 10px;
    background: #ffffff;
    color: #000000;
    border: 1px solid #ddd;
    padding: 11px 16px;
    font-size: 14px;
    font-weight: 400;
    line-height: 24px;
    margin-bottom: 10px;

    &.add {
      outline: 1px solid #1b6bc0;
      box-shadow: 0px 0px 0px 1.9px #1b6bc042 inset;
      box-shadow: 0px 0px 0px 4px #1b6bc030;
    }

    &.remove {
        outline: none;
    }

    input{
        width:100%;
        border:none;
        outline:none;

        &::placeholder {
          color: #000000;
          opacity: 0.2;
        }
    }

  }
`;

export const TagWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const TagContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px 12px;
  border-radius: 20px;
  background-color: #ebebeb;
  svg {
    font-size: 24px;
  }
  .svgContainer {
    display: flex !important;
    align-items: center !important;
  }
`;
