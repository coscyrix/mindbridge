import styled from "styled-components";

export const Wrapper = styled.div`
  display: flex;
  min-height: 100vh;
  justify-content: space-between;
`;

export const LeftPanel = styled.div`
  background: #f8f6f0;
  padding: 2rem;
  width: 45%;

  .company-greetings {
    display: flex;
    flex-direction: column;
    gap: 2rem;

    img {
      width: 200px;
    }

    h1 {
      font-size: 2rem;
      margin-bottom: 1rem;
      color: black;
    }

    p {
      font-size: 1rem;
      margin-bottom: 1.5rem;
      color: black;
    }

    ul {
      list-style: none;
      padding: 0;
      margin: 0;
      color: black;

      li {
        margin-bottom: 1rem;
        line-height: 1.5;
        color: black;
      }
    }
  }

  @media (max-width: 1024px) {
    display: none;
  }
`;

export const RightPanel = styled.div`
  max-height: 100vh;
  margin:auto;
  width: 55%;
`;

export const FormContainer = styled.div`
  padding: 2rem;

  h2 {
    text-align: center;
    margin-bottom: 2rem;
    color: var(--primary-color);
  }

  form {
    display: flex;
    flex-direction: column;

    .name-input,
    .email-input,
    .password-input,
    .license-input,
    .license-url-input,
    .notes-input,
    .location-input,
    .phone-input,
    .patients-input {
      width: 100%;
    }

    .wrapperInputFields {
      display: flex;
      align-items: start;
      gap: 1rem;
      justify-content: space-between;
    }
    .select-field-wrapper {
      width: 100%;

      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: #333;
      }

      .multi-select {
        .select__control {
          border: 1px solid #e1e1e1;
          border-radius: 6px;
          min-height: 42px;
          box-shadow: 0px 1px 2px 0px #a4acb933;

          &:hover {
            border-color: var(--primary-color);
          }

          &--is-focused {
            border-color: var(--primary-color);
            box-shadow: 0 0 0 1px var(--primary-color);
          }
        }

        .select__placeholder {
          color: #666;
        }

        .select__multi-value {
          background-color: var(--primary-color-light);
          border-radius: 4px;

          &__label {
            color: var(--primary-color);
          }

          &__remove:hover {
            background-color: var(--primary-color);
            color: white;
          }
        }
      }
    }

    .remember-me-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 1rem 0;

      .remember-me {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        input[type="checkbox"] {
          width: auto;
        }
      }

      .forgot-password {
        a {
          color: var(--primary-color);
          text-decoration: none;

          &:hover {
            text-decoration: underline;
          }
        }
      }
    }

    button[type="submit"] {
      background: var(--primary-color);
      color: white;
      padding: 0.8rem;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background: var(--primary-color-dark);
      }

      &:disabled {
        background: #ccc;
        cursor: not-allowed;
      }
    }
  }

  .loginOrSignUp {
    text-align: center;
    margin-top: 1rem;

    a {
      color: var(--primary-color);
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .primary-button{
    margin-left: auto;
    background-color: var(--primary-button-color);
    color:#fff;
  }

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;
