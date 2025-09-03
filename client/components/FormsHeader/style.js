import styled from "styled-components";

export const FormHeaderWrapper = styled.div`
  background: #f8f8f8;
  padding: 0px 80px 80px 80px;

  .main-bg {
    background: white;
    margin: 100px auto;
    padding: 20px 50px;
    border-radius: 15px;
    max-width: 1000px;
  }
  .error-text {
    color: red;
    size: 10px;
  }
  .Image-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    flex-direction: column;

    h2,
    div {
      text-align: center;
      margin: 0;
      padding: 16px;
    }
  }

  .Heading-description {
    background: #d3e7ff;
    border-radius: 8px;
    padding: 30px 120px;
    text-align: center;
  }
`;