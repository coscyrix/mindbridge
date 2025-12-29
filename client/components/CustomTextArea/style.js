import styled from "styled-components";

export const CustomTextAreaWrapper = styled.div`
  .content {
    display: flex;
    flex-direction: column;
    gap: 8px;

    textarea {
      border: 1px solid #e7e7e7;
      border-radius: 4px;
      font-family: Alegreya Sans;
      font-size: 16px;
      resize: none;

      &.error {
        border-radius: 6px;
        outline: 1px solid #f04438;
        box-shadow: 0px 0px 0px 4px #fee4e2;
      }

      &:focus {
        outline: 1px solid #1b6bc0;
        box-shadow: 0px 0px 0px 1.9px #1b6bc042 inset;
        box-shadow: 0px 0px 0px 4px #1b6bc030;
      }
      &:hover {
        outline: 1px solid #1b6bc0;
        box-shadow: 0px 0px 0px 1.9px #1b6bc042 inset;
        box-shadow: 0px 0px 0px 4px #1b6bc030;
      }
    }
  }

  .error-text {
    color: var(--error-color);
  }

  .helper-text {
    color: rgba(0, 0, 0, 0.4);
    margin-left: 16px;
  }

  p {
    margin-top: 0.5rem;
  }

  .disabled {
    pointer-events: none;
    opacity: 0.7 !important;
  }
`;
