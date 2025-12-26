import React, { useEffect, useRef, useState } from "react";
import { Overlay, SidebarContainer } from "./style";
import { SIDEBAR_HEADINGS, QUERY_KEYS } from "../../../utils/constants";
import Link from "next/link";
import { CrossIcon, LogoutIcon } from "../../../public/assets/icons";
import { useRouter } from "next/router";
import { logout } from "../../../utils/auth";
import Cookies from "js-cookie";
import { CgDetailsLess } from "react-icons/cg";
import { GrLicense } from "react-icons/gr";
import { MdOutlineEventAvailable } from "react-icons/md";
import Image from "next/image";
import ChangePasswordModal from "../../ChangePasswordModal";
import ProfileOptionsModal from "../../ProfileOptionModal";
import CommonServices from "../../../services/CommonServices";
import { useQueryData } from "../../../utils/hooks/useQueryData";

function Sidebar({ showSideBar, setShowSideBar }) {
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showProfileOptions, setShowProfileOptions] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const router = useRouter();
  const route = router.pathname;
  const isAdmin = userData?.role_id == 4 ? true : false;
  const isManager = userData?.role_id == 3 ? true : false;
  const [showProfileModal, setShowProfileModal] = useState(false);
  const profileDropdownRef = useRef(null);
  const profileRef = useRef(null);

  // Fetch appointments using React Query (for count display)
  const {
    data: appointmentsData,
  } = useQueryData(
    QUERY_KEYS.APPOINTMENTS(userData?.user_profile_id),
    async () => {
      const response = await CommonServices.getMyAppointments(1000);
      if (response.status === 200) {
        return response.data?.data || response.data || [];
      }
      return [];
    },
    userData?.role_id === 2 && !!userData?.user_profile_id // Only fetch for counselors
  );

  const appointmentCount = appointmentsData?.length || 0;

  const handleOpenPasswordModal = () => {
    setShowPasswordModal(true);
  };

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
  };

  const formatName = (name) =>
    name[0].toUpperCase() + name.slice(1).toLowerCase();

  useEffect(() => {
    // to get cookie data -> only in case of client side
    const user = localStorage.getItem("user");
    if (user && user !== undefined) {
      setUserData(JSON.parse(user));
    }

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
    setShowProfileModal(false);
  };
  useEffect(() => {
    if (typeof document === "undefined") return;
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
  useEffect(() => {
    if (typeof document === "undefined") return;
    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target) &&
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setShowProfileModal(false);
      }
    };

    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setShowProfileModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1023) {
        setShowProfileModal(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <SidebarContainer
        className={`sidebar-container ${showSideBar ? "open" : "closed"}`}
      >
        <div className="headings-container">
          <div className="sidebar-header">
            <div
              onClick={() => {
                router.push("/");
              }}
              className="app-logo"
            >
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
            {SIDEBAR_HEADINGS.map((heading, index) => {
              // Determine if item should be hidden - consolidate all visibility logic
              const isManagerOrAdmin = ["Manager", "Admin"].includes(getRole(userData?.role_id));
              const isCounselor = userData?.role_id === 2;
              
              const shouldHide = 
                ((isManager || isAdmin) && heading.title === "Profile") ||
                ((!isManager && !isAdmin) && heading.title === "Consent Management") ||
                (!isManager && heading.title === "Fee Split Management") ||
                (heading.title === "Appointments" && !isCounselor) ||
                (!isManagerOrAdmin && (heading.title === "Service" || heading.title === "Invoice"));

              return (
                <div 
                  key={heading.title || index}
                  style={{ display: shouldHide ? "none" : "block" }}
                >
                  <div
                    style={{ cursor: "pointer" }}
                    key={index}
                    onClick={() =>
                      heading?.title === "Profile"
                        ? router.push(
                            `/onboarding?type=basic&userId=${userData?.counselor_profile_id}`
                          )
                        : heading?.title !== "Profile"
                        ? router.push(heading?.url)
                        : isSmallScreen
                        ? handleCloseSideBar
                        : null
                    }
                    className={
                      route == heading.url ? "active-item" : "heading-item"
                    }
                  >
                    {heading.icon} <span>
                      {heading.title}
                      {heading.title === "Appointments" && appointmentCount > 0 && (
                        <span style={{ marginLeft: "8px", opacity: 0.7 }}>
                          ({appointmentCount})
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="profile">
          <div
            ref={profileRef}
            onClick={() => {
              setShowProfileModal((prev) => !prev);
            }}
            className="profile-details-container"
          >
            <div className="avatar">
              {userData?.user_first_name &&
                userData?.user_first_name[0]?.toUpperCase()}
            </div>
            <div className="profile-details">
              {userData?.role_id !== 2 && (
                <h4>
                  {userData?.role_id === 4
                    ? "Mindbridge"
                    : userData?.tenant_name &&
                      userData?.tenant_name.slice(0, 20).toUpperCase()}
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
          {/* <div style={{ cursor: "pointer" }} onClick={handleLogout}>
            <LogoutIcon />
          </div> */}
        </div>
      </SidebarContainer>
      <Overlay
        onClick={handleCloseSideBar}
        className={`overlay ${showSideBar ? "open" : "closed"}`}
      />
      <ChangePasswordModal
        open={showPasswordModal}
        onClose={handleClosePasswordModal}
      />
      {showProfileModal && showSideBar && (
        <div
          ref={profileDropdownRef}
          onClick={() => setShowProfileModal((prev) => !prev)}
          style={{
            position: "fixed",
            bottom: "120px",
            left: "20px",
            zIndex: 1000,
          }}
        >
          <ProfileOptionsModal
            open={showProfileModal}
            onClose={() => setShowProfileModal((prev) => !prev)}
            onLogout={handleLogout}
            onChangePassword={handleOpenPasswordModal}
          />
        </div>
      )}
    </>
  );
}
export default Sidebar;

//admin - mindbridge static
