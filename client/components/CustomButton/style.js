import styled from "styled-components";

export const CustomButtonContainer = styled.div`
  button {
    padding: 10.5px 12px;
    border-radius: 6px;
    border: 1px solid #e1e1e1;
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
  border-radius: 8px;
  z-index: 10;
  width: max-content;
  margin-top: 8px;
  border: 1px solid #e1e1e1;
  box-shadow: -2px 0px 20px 0px #a4acb940;
  padding: 4px;

  .dropdown-heading {
    border-bottom: 1px solid #ccc;
    border-top: 1px solid #ccc;
  }

  h3 {
    padding: 6px 8px;
    font-size: 13px;
    font-weight: 500;
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

    .option-wrapper {
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
