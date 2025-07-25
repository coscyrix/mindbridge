import styled from "styled-components";
export const SidebarContainer = styled.div`
  position: fixed;
  width: 262px;
  min-height: 100vh;
  background: #ffffff;
  padding: 20px 22px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  transition: transform 0.3s ease-in-out;
  z-index: 5;
  border-right: 1px solid #e1e1e1;
  box-shadow: 0px 1px 2px 0px #a4acb924;

  .sidebar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  @media (max-width: 768px) {
    padding: 16px;
    gap: 4px;
  }

  &.open {
    transform: translateX(0);
    height: 100vh;
  }

  @media (max-width: 1022px) {
    &.closed {
      transform: translateX(-100%);
    }
  }
  .hamburger-icon {
    display: none;
  }
  .sidebar-container.open {
    position: absolute;
    top: 0;
  }
  @media (max-width: 1022px) {
    position: relative;
    top: 0;
  }
  @media (max-width: 1022px) {
    position: absolute;
    width: 250px;
    height: 100vw;
    border-right: 1px solid #e1e1e1;
    box-shadow: 2px 0px 20px 0px rgba(164, 172, 185, 0.1);
    z-index: 99;
    .hamburger-icon {
      display: block;
    }
  }
  .headings-container {
    width: 100%;
    .headings {
      margin-top: 42px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      font-size: 16px;
      font-weight: 500;
      line-height: 19.2px;

      @media (max-width: 768px) {
        margin-top: 12px;
        gap: 8px;
      }

      .heading-item {
        height: 36px;
        display: flex;
        padding: 10px;
        align-items: center;
        gap: 7px;
        a {
          display: flex;
          align-items: center;
          gap: 7px;
        }
        &:hover {
          color: var(--theme-input-color);
        }
      }
      .active-item {
        height: 39px;
        display: flex;
        background: var(--theme-background-color);
        color: var(--theme-input-color);
        padding: 7px 10px;
        border-radius: 8px;
        align-items: center;
        gap: 7px;
        a {
          display: flex;
          align-items: center;
          gap: 7px;
        }
      }
    }
  }
  .profile {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    background: #f6f7f8;
    padding: 12px;
    border-radius: 8px;
    cursor: pointer;

    .profile-details-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      .profile-details {
        h5 {
          font-size: 13px;
          font-weight: 500;
          line-height: 18.51px;
          text-align: left;
          margin: 0px;
        }
      }
    }
    .avatar {
      width: 31px;
      height: 31px;
      display: flex;
      color: white;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: 600;
      line-height: 25.63px;
      text-align: left;
      border-radius: 50%;
      background: #9f7ccb;
    }
  }
`;
export const Overlay = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 6;
  background-color: rgba(0, 0, 0, 0.3);
  transition: opacity 0.3s ease-in-out; /* Transition applied to opacity */
  opacity: 0;
  &.open {
    opacity: 1;
  }
  &.closed {
    opacity: 0;
    z-index: -1;
  }
  @media (min-width: 1024px) {
    display: none;
  }
`;
