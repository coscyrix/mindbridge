import styled from "styled-components";

export const FormWrapper = styled.div`
  padding: 20px;
  .primary {
    margin-top: 20px;
    margin-left: auto;
    min-width: 100px;
    background: var(--primary-button-color);
    color: #fff;
    &:hover {
      background: var(--primary-button-hover-color);
    }
  }
`;

export const Table = styled.table`
  border-collapse: collapse;
  width: 100%;
  margin-top: 20px;
  th,
  td {
    border: 1px solid #ccc;
    padding: 8px;
  }
  th {
    background-color: rgb(235, 235, 235);
  }

  tbody tr:nth-child(even) {
    background-color: rgb(242, 242, 242);
  }

  .questions {
    width: 600px;
    @media screen and (max-width: 1400px) {
      width: 500px;
    }
    @media screen and (max-width: 1300px) {
      width: 400px;
    }
    @media screen and (max-width: 1200px) {
      width: 300px;
    }
    @media screen and (max-width: 1023px) {
      width: unset;
    }
  }

  .relationship-question-enabler {
    margin-bottom: 15px;
  }

  .enabled-table-text {
    font-weight: 500;
    margin-bottom: 15px;
    max-width: 800px;
  }
  .over-past-30-days {
    font-weight: 500;
  }

  .children-container {
    max-width: 800px;
    margin-bottom: 15px;
  }
`;

export const RadioWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;
