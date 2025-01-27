import React, { useEffect, useState } from "react";
import { Overlay, SidebarContainer } from "./style";
import { SIDEBAR_HEADINGS } from "../../../utils/constants";
import Link from "next/link";
import { CrossIcon, LogoutIcon } from "../../../public/assets/icons";
import { useRouter } from "next/router";
import { logout } from "../../../utils/auth";
function Sidebar({ showSideBar, setShowSideBar }) {
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const router = useRouter();
  const route = router.pathname;
  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1024px)");
    const handleMediaChange = () => {
      setIsSmallScreen(mediaQuery.matches);
    };
    handleMediaChange();
    mediaQuery.addEventListener("change", handleMediaChange);
    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
  }, []);
  const handleCloseSideBar = () => {
    setShowSideBar(false);
  };
  useEffect(() => {
    if (showSideBar) {
      document.body.classList.add("open");
    } else {
      document.body.classList.remove("open");
    }
    return () => {
      document.body.classList.remove("open");
    };
  }, [showSideBar]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };
  return (
    <>
      <SidebarContainer
        className={`sidebar-container ${showSideBar ? "open" : "closed"}`}
      >
        <div className="headings-container">
          <div className="sidebar-header">
            <div className="app-logo">
              <img
                height="44px"
                src="/assets/images/Mindbridge_logo.svg"
                alt="company-logo"
              />
            </div>
            <div className="hamburger-icon" onClick={handleCloseSideBar}>
              <CrossIcon />
            </div>
          </div>
          <div className="headings">
            {SIDEBAR_HEADINGS.map((heading, index) => (
              <Link
                href={heading.url}
                key={index}
                onClick={isSmallScreen ? handleCloseSideBar : null}
                className={
                  route == heading.url ? "active-item" : "heading-item"
                }
              >
                {heading.icon} <span>{heading.title}</span>
              </Link>
            ))}
          </div>
        </div>
        <div className="profile">
          <div className="profile-details-container">
            <div className="avatar">C</div>
            <div className="profile-details">
              <h5>Cosman M (MAN)</h5>
              <small>Admin</small>
            </div>
          </div>
          <div style={{ cursor: "pointer" }} onClick={handleLogout}>
            <LogoutIcon />
          </div>
        </div>
      </SidebarContainer>
      <Overlay
        onClick={handleCloseSideBar}
        className={`overlay ${showSideBar ? "open" : "closed"}`}
      />
    </>
  );
}
export default Sidebar;
