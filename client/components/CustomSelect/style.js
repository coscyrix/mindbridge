import styled from "styled-components";

export const CustomSelectContainer = styled.div`
  .custom-select {
    position: relative;
    width: 200px;
    margin-bottom: 12px;

    &.error {
      border-radius: 6px;
      outline: 1px solid #f04438;
      box-shadow: 0px 0px 0px 4px #fee4e2;
    }
    @media (max-width: 576px) {
      width: auto;
    }

    &__selected {
      padding: 5px;
      border-bottom: 1px solid #ccc;
      background: white;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;

      &:hover {
        border-color: #888;
      }
    }

    &__arrow {
      margin-left: 10px;
      transition: transform 0.3s ease;
      display: flex;
      align-items: center;

      &.open {
        transform: rotate(180deg);
      }
    }

    &__dropdown {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      width: 100%;
      border: 1px solid #ccc;
      border-radius: 4px;
      background: white;
      z-index: 1001;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      max-height: 200px;
      overflow-y: auto;
      min-width: max-content;
    }

    &__option {
      padding: 10px 15px;
      cursor: pointer;

      &:hover {
        background: #f0f0f0;
      }

      &.selected {
        background: #e6e6e6;
        font-weight: bold;
      }
    }
  }
  .placeholder {
    opacity: 0.2;
  }
  .disabled {
    opacity: 0.5;
    pointer-events: none;
  }
`;
