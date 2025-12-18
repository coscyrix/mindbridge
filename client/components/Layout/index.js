import React, { useState, useEffect } from "react";
import styles from "../../styles/Layout.module.css";
import Sidebar from "./Sidebar";
import Header from "./Header";
import NeedHelpWrapper from "../NeedHelp/NeedHelpWrapper";

function Layout({ children }) {
  const [showSideBar, setShowSideBar] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Note: Deactivated account check is handled by middleware.js, so no need to check here
    const mediaQuery = window.matchMedia("(min-width: 1024px)");

    const handleMediaChange = () => {
      setShowSideBar(mediaQuery.matches);
    };

    handleMediaChange();
    mediaQuery.addEventListener("change", handleMediaChange);

    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
  }, [router]);

  return (
    <>
      <div className={styles.layout}>
        <Sidebar showSideBar={showSideBar} setShowSideBar={setShowSideBar} />
        <main className={styles.content}>
          <Header showSideBar={showSideBar} setShowSideBar={setShowSideBar} />
          {children}
        </main>
       <NeedHelpWrapper/>
      </div>
    </>
  );
}

export default Layout;
