import React, { useEffect, useState } from "react";
import { Overlay, SidebarContainer } from "./style";
import { SIDEBAR_HEADINGS } from "../../../utils/constants";
import Link from "next/link";
import { CrossIcon, LogoutIcon } from "../../../public/assets/icons";
import { useRouter } from "next/router";
import { logout } from "../../../utils/auth";
import Cookies from "js-cookie";
import { CgDetailsLess } from "react-icons/cg";
import { GrLicense } from "react-icons/gr";
import { MdOutlineEventAvailable } from "react-icons/md";
import Image from "next/image";

function Sidebar({ showSideBar, setShowSideBar }) {
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showProfileOptions, setShowProfileOptions] = useState(false);
  const router = useRouter();
  const route = router.pathname;
  const isAdmin = userData?.role_id == 4 ? true : false;
  console.log(":::::::::::",isAdmin)
  console.log("::::::::::",userData)

  const formatName = (name) =>
    name[0].toUpperCase() + name.slice(1).toLowerCase();

  useEffect(() => {
    // to get cookie data -> only in case of client side
    const user = Cookies.get("user");
    setUserData(JSON.parse(user));

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

  const getRole = (role) => {
    switch (role) {
      case 1:
        return "Client";
      case 2:
        return "Counselor";
      case 3:
        return "Manager";
      case 4:
        return "Admin";
      default:
        return "";
    }
  };

  return (
    <>
      <SidebarContainer
        className={`sidebar-container ${showSideBar ? "open" : "closed"}`}
      >
        <div className="headings-container">
          <div className="sidebar-header">
            <div className="app-logo">
              <Image
                src="/assets/images/Mindbridge_logo.svg"
                alt="company-logo"
                width={120}
                height={44}
              />
            </div>
            <div className="hamburger-icon" onClick={handleCloseSideBar}>
              <CrossIcon />
            </div>
          </div>
          <div className="headings">
            {SIDEBAR_HEADINGS.filter(
              (item) => !(isAdmin && item.title === "Profile")
            ).map((heading, index) => (
              <div key={heading.title || index}>
                <Link
                  href={heading.url === "/profile" ? " " : heading?.url}
                  key={index}
                  onClick={() =>
                    heading?.title === "Profile"
                      ? setShowProfileOptions(!showProfileOptions)
                      : isSmallScreen
                      ? handleCloseSideBar
                      : null
                  }
                  className={
                    route == heading.url ? "active-item" : "heading-item"
                  }
                >
                  {["Manager", "Admin"].includes(getRole(userData?.role_id)) ? (
                    <>
                      {heading.icon} <span>{heading.title}</span>
                    </>
                  ) : (
                    heading.title != "Service" &&
                    heading.title != "Invoice" && (
                      <>
                        {heading.icon} <span>{heading.title}</span>
                      </>
                    )
                  )}
                </Link>{" "}
                {showProfileOptions && heading?.title === "Profile" && (
                  <div style={{ marginTop: "10px", marginLeft: "34px" }}>
                    <p
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        router.push(
                          `/onboarding?type=basic&userId=${userData?.counselor_profile_id}`
                        )
                      }
                    >
                      {" "}
                      <CgDetailsLess />
                      Basic Details
                    </p>

                    <p
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        router.push(
                          `/onboarding?type=license&userId=${userData?.counselor_profile_id}`
                        )
                      }
                    >
                      <GrLicense fontSize={"12px"} />
                      License Information
                    </p>

                    <p
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        router.push(
                          `/onboarding?type=availability&userId=${userData?.counselor_profile_id}`
                        )
                      }
                    >
                      <MdOutlineEventAvailable />
                      Availability
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="profile">
          <div className="profile-details-container">
            <div className="avatar">
              {userData?.user_first_name &&
                userData?.user_first_name[0]?.toUpperCase()}
            </div>
            <div className="profile-details">
              {userData?.role_id !== 2 && (
                <h4>
                  [
                  {userData?.role_id === 4
                    ? "Mindbridge"
                    : userData?.tenant_name &&
                      userData?.tenant_name.slice(0, 20).toUpperCase()}
                  ]
                </h4>
              )}

              <h5>
                {userData &&
                  `${formatName(
                    userData?.user_first_name
                  )} ${userData?.user_last_name[0]?.toUpperCase()} (${userData?.user_last_name
                    ?.slice(0, 3)
                    .toUpperCase()})`}
              </h5>
              <small>{userData && getRole(userData?.role_id)}</small>
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

//admin - mindbridge static
