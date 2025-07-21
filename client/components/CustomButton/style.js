import styled from "styled-components";

export const CustomButtonContainer = styled.div`
  button {
    padding: 10.5px 12px;
    border-radius: 6px;
    border: 1px solid #e7e7e9;
    box-shadow: 0px 1px 2px 0px #a4acb933;
    background: var(--secondary-button-color);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2.5px;
    width: max-content;
    position: relative;
    cursor: pointer;
  }
`;

export const DropdownContainer = styled.div`
  position: absolute;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  z-index: 10;
  min-width: 200px;
  width: max-content;
  padding: 6px 8px;
  margin-top: 8px;
  border: 1px solid #e7e7e9;
  box-shadow: -2px 0px 20px 0px #a4acb940;

  h3 {
    font-size: 13px;
    font-weight: 600;
    line-height: 15.28px;
    letter-spacing: -0.02em;
    text-align: left;
    border-bottom: 1px solid #ccc;
    margin: 0px;
    padding-bottom: 6px;
  }

  .dropdown-option {
    padding: 7px 10px;
    display: flex;
    align-items: center;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    line-height: 15.6px;
    letter-spacing: -0.02em;
    text-align: left;
    justify-content: space-between;

    .toggle-icon {
      display: flex;
    }

    &:hover {
      background-color: #f5f5f5;
    }

    .option-icon {
      margin-right: 6px;
    }
  }
`;

export const ButtonRowWrapper = styled.div`

  display: flex;
  // justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  margin: 10px;
  margin-left: ${(props) => props.marginLeft || "0px"};
  width: 100%;
  flex-direction: ${(props) => (props.isMobile ? "column" : "row")};

  .get-started-btn,
  .login-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    white-space: normal;
    word-break: break-word;
    max-width: 100%;
    text-align: center;
    line-height: 1.4;
  }

  .get-started-btn {
    border: 2px solid #3973b7;
    padding: 10px 16px;
    background-color: white;
    color: #3973b7;
    flex-wrap: wrap;

    .badge {
      background-color: ${(props) => (props.isNavbar ? "#ffc004" : "#f6f6f6")};
      color: #2e2e2e;
      font-size: 12px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 4px;
      margin-left: 10px;
      white-space: normal;
      word-break: break-word;
    }
  }

  .login-btn {
    background-color: #3973b7;
    color: #ffffff;
    padding: 10px 12px;
    border: 1px solid #ffffff;
  }

  @media screen and (max-width: 1025px) {
    gap: 12px;
    align-items: center;

    .get-started-btn,
    .login-btn {
      width: ${(props) => (props.isNavbar ? "auto" : "100%")};
      max-width: 100%;
      justify-content: center;
      padding: 12px;
    }
  }

  @media screen and (max-width: 800px) {
    .get-started-btn,
    .login-btn {
      font-size: 12px;
      padding: 10px;
    }

    .badge {
      font-size: 10px;
      padding: 2px 6px;
      margin-left: 6px;
    }
  }

  @media screen and (max-width: 480px) {
    gap: 10px;

    .get-started-btn,
    .login-btn {
      font-size: 10px;
      padding: 8px;
    }

    .badge {
      font-size: 10px;
      padding: 2px 4px;
      margin-left: 4px;
    }
  }
  .next-submit{
  background:blue;
  }
`;
