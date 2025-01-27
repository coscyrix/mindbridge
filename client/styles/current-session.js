import styled from "styled-components";

export const CurrentSessionHeadingWrapper = styled.div`
  padding: 20px 30px;
  padding-top: 0px;

  @media (max-width: 768px) {
    padding: 20px 16px;
    padding-top: 0px;
  }

  .dropdown_list-container {
    right: 30px;
  }

  .header-wrapper {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 20px 0px;
    background: var(--background-color);
    position: sticky;
    top: 60px;
    z-index: 5;
    @media screen and (max-width: 768px) {
      top: 64px;
    }
  }

  .header-wrapper h2 {
    margin: 0;
  }

  .header-wrapper p {
    margin: 0;
  }
  .today-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .today {
      font-weight: bold;
      font-size: 24px;
      padding: 20px 0px;
    }

    .today-columns {
      position: absolute;
      background: #fff;
      z-index: 999;
      top: 50px;
      border-radius: 6px;
      box-shadow: -2px 0px 20px 0px #a4acb940;
      border: 1px solid #e1e1e1;
    }

    .today-columns-header {
      padding: 8px 10px;
      font-size: 13px;
      font-weight: 500;
      min-width: 170px;
      border-bottom: 1px solid #e1e1e1;
    }

    .today-columns-subheader {
      display: flex;
      justify-content: space-between;
      padding: 5px 15px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
    }

    .today-columns-footer {
      padding: 8px 20px;
      font-size: 13px;
      font-weight: 500;
      min-width: 150px;
      display: flex;
      gap: 10px;
      border-top: 1px solid #e1e1e1;
      cursor: pointer;
    }
  }

  .tomorrow-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .tomorrow {
      font-weight: bold;
      font-size: 24px;
      padding: 20px 0px;
    }
    .tomorrow-columns {
      position: absolute;
      background: #fff;
      z-index: 999;
      top: 50px;
      border-radius: 6px;
      box-shadow: -2px 0px 20px 0px #a4acb940;
      border: 1px solid #e1e1e1;
    }

    .tomorrow-columns-header {
      padding: 8px 10px;
      font-size: 13px;
      font-weight: 500;
      min-width: 170px;
      border-bottom: 1px solid #e1e1e1;
    }

    .tomorrow-columns-subheader {
      display: flex;
      justify-content: space-between;
      padding: 5px 15px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
    }

    .tomorrow-columns-footer {
      padding: 8px 20px;
      font-size: 13px;
      font-weight: 500;
      min-width: 150px;
      display: flex;
      gap: 10px;
      border-top: 1px solid #e1e1e1;
      cursor: pointer;
    }
  }
  .heading-container {
    @media only screen and (max-width: 998px) {
      align-items: center;
      gap: 10px;

      .button-group {
        justify-content: end !important;
      }
    }

    .heading-wrapper {
      display: none !important;
    }
  }
`;
