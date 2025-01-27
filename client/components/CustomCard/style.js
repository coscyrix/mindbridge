import styled from "styled-components";

export const CustomCardContainer = styled.div`
  width: 100%;
  height: 400px;
  border-radius: 6px;
  color: #333333;
  background: #fff;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.14);
  padding: 0 30px 20px;

  .heading {
    background: white;
    padding-top: 20px;
    border-bottom: 1px solid #e1e1e1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 10px;
    margin-bottom: 20px;
  }
  @media (max-width: 767px) {
    padding: 0px 16px;
  }
`;
