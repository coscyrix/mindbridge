import styled from "styled-components";

export const CustomDropDownWrapper = styled.div`
  position: relative;
  width: 100%;
  z-index: 1001;
`;

export const DropdownButton = styled.button`
  width: 100%;
  padding: 10px;
  background: transparent;
  border: none;
  border-bottom: 1px solid black;
  outline: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  z-index: 1001;
`;

export const DropdownMenu = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  list-style: none;
  margin: 0;
  padding: 0;
  display: ${(props) => (props.isOpen ? "block" : "none")};
  z-index: 1001;
`;

export const DropdownItem = styled.li`
  padding: 10px;
  cursor: pointer;

  &:hover {
    background: #f0f0f0;
  }
`;

export const Overlay = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
`;
