import styled from "styled-components";
const ServiceManagementWrapper = styled.div`
  max-width: 800px;
  margin: 40px auto;
  padding: 40px;
  background-color: #ffffff;
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  gap: 32px;

  @media (max-width: 768px) {
    padding: 24px;
    margin: 20px;
    border-radius: 16px;
    gap: 24px;
  }

  h2 {
    font-size: 2rem;
    font-weight: 600;
    color: #222;
    text-align: center;
    margin: 0;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  button[type="submit"] {
    align-self: flex-end;
    padding: 12px 32px;
    background-color: #0070f3;
    color: white;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: #005fd1;
    }

    &:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }
  }
`;
export default ServiceManagementWrapper