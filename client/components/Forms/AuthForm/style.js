import styled from "styled-components";

export const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;

  @media only screen and (max-width: 520px) {
    display: block;
  }
`;

export const LeftPanel = styled.div`
  flex: 1;
  background: linear-gradient(135deg, #4a00e0, #8e2de2);
  color: white;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  text-align: left;

  @media only screen and (min-width: 1100px) {
    padding-top: 120px;
  }

  @media only screen and (max-width: 520px) {
    display: none;
  }

  h1 {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.2rem;
    margin-bottom: 2rem;
    max-width: 660px;
  }

  ul {
    list-style-image: url("/assets/images/check_mark_img.svg");
    padding-left: 20px;
    font-size: 1.2rem;
  }

  span {
    font-size: 1rem;
    opacity: 0.8;
  }

  .company-greetings {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-top: 120px;

    img {
      max-width: 400px;
      object-fit: cover;
      @media only screen and (max-width: 1023px) {
        max-width: 300px;
      }
      @media only screen and (max-width: 768px) {
        max-width: 230px;
      }
    }
  }
`;

export const RightPanel = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;

  .remember-me-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;

    label {
      margin: 0;
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: unset;
    }
    input[type="checkbox"] {
      appearance: none;
      -webkit-appearance: none;
      width: 16px;
      height: 16px;
      border: 1px solid #c7c7c7;
      border-radius: 3px;
      background-color: transparent;
      cursor: pointer;
      margin: 0px;
      padding: 0px;
    }

    input[type="checkbox"]:checked {
      background: #3a00b5;
      color: white;
    }

    input[type="checkbox"]:checked::after {
      content: "✔";
      display: block;
      color: #ffffff;
      font-size: 10px;
      text-align: center;
      line-height: 14px;
      background: #3a00b5;
      border-radius: 2px;
    }
  }
`;

export const FormContainer = styled.div`
  width: 80%;
  max-width: 400px;
  text-align: left;
  padding: 40px 0px;

  h2 {
    font-size: 1.8rem;
    margin-bottom: 2.5rem;
    margin-top: 0px;
  }

  a {
    text-decoration: none;
    color: #4a00e0;
  }

  label {
    display: block;
    margin: 0rem 0 0.5rem;
    font-weight: bold;
  }

  input {
    width: 100%;
    padding: 10px;
    margin-bottom: 1rem;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 1rem;
  }

  button {
    width: 100%;
    padding: 10px;
    font-size: 1rem;
    color: white;
    background: #4a00e0;
    border: none;
    border-radius: 5px;
    cursor: pointer;

    &:hover {
      background: #3a00b5;
    }
  }

  .google-login {
    margin-top: 1rem;
    background: white;
    color: black;
    border: 1px solid #ddd;

    &:hover {
      background: #f7f7f7;
    }
  }

  .forgot-password {
    font-size: 1rem;
  }

  .loginOrSignUp {
    a {
      margin-left: 2px;
    }
  }
`;
