import React, { useState } from "react";
import { HeaderContainer } from "./style";
import { MenuBurgerIcon } from "../../../public/assets/icons";
import BreadCrumbs from "../Breadcrumbs";

function Header({ showSideBar, setShowSideBar }) {
  // const [showSideBar, setShowSideBar] = useState(false);
  const handleShowSideBar = () => {
    setShowSideBar(!showSideBar);
  };

  const data = ["Home", "Dashboard"];

  return (
    <HeaderContainer>
      <div
        className="hamburger-icon"
        style={{ visibility: showSideBar && "hidden" }}
        onClick={handleShowSideBar}
      >
        <MenuBurgerIcon />
      </div>
      <div className="breadCrumbs-wrapper">
        <BreadCrumbs breadCrumbs={data} />
      </div>
    </HeaderContainer>
  );
}

export default Header;
